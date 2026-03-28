import os
import time
import uuid

# --- MONKEYPATCH FOR BCRYPT/PASSLIB COMPATIBILITY ---
import bcrypt
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})
# ----------------------------------------------------

import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError

from app.core.config import settings
from app.api.router import api_router
from app.db.session import engine

# Import ALL models so SQLAlchemy can see them
from app.models.user import User  # noqa
from app.models.category import Category  # noqa
from app.models.product import Product  # noqa
from app.models.cart import Cart, CartItem  # noqa
from app.models.order import Order, OrderItem  # noqa
from app.models.review import Review  # noqa
from app.models.wishlist import Wishlist  # noqa
from app.models.payment import Payment  # noqa
from app.models.coupon import Coupon  # noqa

# ── LOGGING CONFIGURATION ─────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S", utc=False),
        structlog.dev.ConsoleRenderer() if settings.APP_ENV == "development" else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(20),  # INFO level
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# ── LIFESPAN ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Log startup
    logger.info("Starting up Belgravia Spirits API")
    yield
    # Cleanup on shutdown
    logger.info("Shutting down Belgravia Spirits API")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade e-commerce API for Belgravia Spirits — London's premium drinks & grocery delivery service.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
origins = settings.ALLOWED_HOSTS
if "*" in origins or not origins:
    origins = ["*"]

logger.info("Configured CORS origins", origins=origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MIDDLEWARE ───────────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=request_id)
    
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    logger.info(
        "Request processed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration=f"{duration:.4f}s"
    )
    
    response.headers["X-Request-ID"] = request_id
    return response

# ── ERROR HANDLERS ───────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "error_type": "HTTPException"
        }
    )

@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Request validation error caught", errors=exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Invalid request parameters or body.",
            "errors": exc.errors(),
            "error_type": "RequestValidationError"
        }
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning("Value error caught", error=str(exc))
    # Special handle for bcrypt's password length error
    message = str(exc)
    if "password cannot be longer than 72 bytes" in message:
        message = "Password is too long. Maximum allowed length is 72 characters."
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "status": "error",
            "message": message,
            "error_type": "ValueError"
        }
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    from sqlalchemy.exc import IntegrityError
    # Log the full exception with traceback for debugging
    logger.error("Database error", error=str(exc), exc_info=True)
    
    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": "error",
                "message": "This operation violates a database constraint (e.g., duplicate record).",
                "error_type": "IntegrityError"
            }
        )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "A database error occurred. Our team has been notified.",
            "error_type": "DatabaseError"
        }
    )

@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    logger.warning("Pydantic validation error caught", errors=exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Internal data validation failed.",
            "errors": exc.errors(),
            "error_type": "ValidationError"
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception with traceback
    logger.critical("Unhandled exception", error=str(exc), exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected server error occurred. Please try again later.",
            "error_type": type(exc).__name__
        }
    )

# Create upload folders if they don't exist (must happen before mounting StaticFiles)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "products"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "categories"), exist_ok=True)

# ── Static files (uploads) ─────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "healthy",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
