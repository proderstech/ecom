import asyncio
from app.models.user import User
from app.core.constants import UserRole
from app.core.security import hash_password
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

DATABASE_URL = "mysql+aiomysql://root:@127.0.0.1:3306/ecommerce"

async def create_admin():
    email = "admin@example.com"
    password = "password123"
    name = "Admin User"
    
    engine = create_async_engine(DATABASE_URL)
    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with session_factory() as session:
        try:
            # Check if user already exists
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            
            # Use the app's hash_password function (which handles SHA256 pre-hashing)
            hashed_pwd = hash_password(password)

            if user:
                print(f"Updating user {email}")
                user.role = UserRole.ADMIN
                user.is_verified = True
                user.password_hash = hashed_pwd
            else:
                print(f"Creating user {email}")
                user = User(
                    name=name,
                    email=email,
                    password_hash=hashed_pwd,
                    role=UserRole.ADMIN,
                    is_verified=True,
                    is_active=True
                )
                session.add(user)
            
            await session.commit()
            print("Success! Admin user updated with correct hash.")
        except Exception as e:
            print(f"Database error: {e}")
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_admin())
