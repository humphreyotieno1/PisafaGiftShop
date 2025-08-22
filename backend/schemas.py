from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List, Union, Dict, Any
from .models import UserRole, OrderStatus
from pydantic import conint

# Message Schema
class Msg(BaseModel):
    detail: str

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
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class Category(CategoryBase):
    id: int
    products: List["Product"] = Field(default_factory=list)
class CategorySimple(CategoryBase):
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
    
    class Config:
        from_attributes = True

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class CartItemBase(BaseModel):
    product_id: conint(gt=0)
    quantity: conint(gt=0)

class WishlistItemBase(BaseModel):
    product_id: conint(gt=0)

# Cart Schemas
class CartCreate(BaseModel):
    products: List[CartItemBase] = Field(..., min_items=1)

    @validator('products', pre=True)
    def validate_products(cls, v):
        if not v:
            raise ValueError('Products list cannot be empty')
        return [item.dict() if hasattr(item, 'dict') else item for item in v]

class CartUpdateRequest(BaseModel):
    quantity: conint(ge=0)

class Cart(BaseModel):
    id: int
    user_id: int
    products: List[Dict] = Field(default_factory=list)

    class Config:
        from_attributes = True

class CartItemResponse(BaseModel):
    product_id: int
    quantity: int
    product: ProductBase
    item_total: float

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: Optional[int]
    products: List[CartItemResponse]
    subtotal: float
    tax: float
    total: float
    tax_rate: float = 0.16
    currency: str = "KES"

# Wishlist Schemas
class WishlistCreate(BaseModel):
    products: List[conint(gt=0)] = Field(..., min_items=1)

    @validator('products', pre=True)
    def validate_product_ids(cls, v):
        if not v:
            raise ValueError('Products list cannot be empty')
        return v

class Wishlist(BaseModel):
    id: int
    user_id: int
    products: List[Union[int, Dict]] = Field(default_factory=list)

    class Config:
        from_attributes = True

# Input Schemas
class CartAddRequest(CartItemBase):
    pass

class WishlistAddRequest(WishlistItemBase):
    pass    
    
class WishlistResponse(BaseModel):
    id: Optional[int]
    products: List[ProductBase]

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderBase(BaseModel):
    total: float
    status: OrderStatus = OrderStatus.pending  # Updated to use enum

class OrderCreate(BaseModel):
    items: List[OrderItemBase]

class Order(OrderBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
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
    status: OrderStatus  # Updated to use enum
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
    phone_number: str

class CheckoutCreate(CheckoutBase):
    pass

class Checkout(CheckoutBase):
    id: int
    order_id: int
    payment_status: str
    mpesa_transaction_id: Optional[str]

    class Config:
        from_attributes = True

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

Category.update_forward_refs()
User.update_forward_refs()


class AnalyticsResponse(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
    top_products: List[dict]
    category_performance: List[dict]
    currency: str = "KES"

    class Config:
        from_attributes = True


class SettingsSchema(BaseModel):
    data: Dict[str, Any]

class SettingsResponse(BaseModel):
    id: int
    data: Dict[str, Any]
    updated_at: datetime

    class Config:
        from_attributes = True