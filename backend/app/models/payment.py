from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Integer, ForeignKey, Numeric, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.core.constants import PaymentStatus, PaymentMethod


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    payment_method: Mapped[str] = mapped_column(
        SAEnum(PaymentMethod, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        SAEnum(PaymentStatus, values_callable=lambda x: [e.value for e in x]),
        default=PaymentStatus.PENDING, nullable=False
    )
    transaction_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    gateway_response: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="payment")  # type: ignore
