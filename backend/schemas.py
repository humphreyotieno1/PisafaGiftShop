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

class AdminUserUpdate(UserUpdate):
    """Schema for admin to update any user field"""
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class User(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    updated_at: datetime
    orders: List["Order"] = []
    wishlists: List["Wishlist"] = []
    carts: List["Cart"] = []

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    expires_in: int  # Token expiration time in seconds

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    image_url: Optional[str] = None

class Category(CategoryBase):
    id: int
    products: List["Product"] = []

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

class ProductCreate(ProductBase):
    pass

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

# Cart Response Schemas
class CartItemProduct(BaseModel):
    id: int
    name: str
    price: float
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: CartItemProduct
    item_total: float

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: float
    tax: float
    total: float
    tax_rate: float
    currency: str = "KES"

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

# Order Response Schemas
class OrderItemProduct(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    item_total: float
    product: OrderItemProduct

    class Config:
        from_attributes = True

class OrderSummaryResponse(BaseModel):
    order_id: int
    status: str
    created_at: str
    items: List[OrderItemResponse]
    subtotal: float
    tax: float
    tax_rate: float
    shipping_cost: float
    total: float
    currency: str = "KES"

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

# Checkout Response Schema
class CheckoutResponse(BaseModel):
    message: str
    order_id: int
    checkout_id: int
    order_summary: OrderSummaryResponse

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

# Wishlist Schemas
class WishlistBase(BaseModel):
    product_id: int

class Wishlist(WishlistBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

Category.update_forward_refs()
User.update_forward_refs()