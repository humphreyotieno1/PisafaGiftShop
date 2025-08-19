from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from .models import UserRole

# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.user

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class User(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None

# Category Schemas
class CategoryBase(BaseModel):
    name: str

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category_id: int
    image_url: Optional[str] = None
    is_bestseller: bool = False
    is_featured: bool = False

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

# Cart Schemas
class CartBase(BaseModel):
    product_id: int
    quantity: int = 1

class Cart(CartBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderBase(BaseModel):
    total: float
    status: str = "pending"

class OrderCreate(BaseModel):
    items: List[OrderItemBase]

class Order(OrderBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Wishlist Schemas
class WishlistBase(BaseModel):
    product_id: int

class Wishlist(WishlistBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Checkout Schemas
class CheckoutBase(BaseModel):
    payment_method: str
    address: str
    phone_number: str  # Required for M-Pesa

class Checkout(CheckoutBase):
    id: int
    order_id: int
    payment_status: str
    mpesa_transaction_id: Optional[str]

    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    amount: float
    transaction_id: str
    status: str = "pending"

class Payment(PaymentBase):
    id: int
    checkout_id: int
    created_at: datetime

    class Config:
        from_attributes = True