import stripe
from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/payments", tags=["Payments"])

# Set Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-payment-intent")
async def create_payment_intent(
    amount: int = Body(..., embed=True),  # Amount in cents/pence
    currency: str = Body("gbp", embed=True),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a Stripe PaymentIntent and returns the client secret.
    The client secret is used on the frontend to complete the payment.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Stripe is not configured on the server. Please add STRIPE_SECRET_KEY to .env"
        )

    try:
        # Create a PaymentIntent with the order amount and currency
        # We use automatic_payment_methods to support multiple payment options
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            payment_method_types=['card'],
            metadata={
                'user_id': str(current_user.id),
                'email': current_user.email
            }
        )
        
        return {
            'clientSecret': intent['client_secret'],
            'publishableKey': settings.STRIPE_PUBLISHABLE_KEY
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
