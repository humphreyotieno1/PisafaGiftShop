from fastapi import APIRouter, Depends, HTTPException, Request, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend import schemas, crud, models, utils
from backend.services import mpesa as mpesa_service
from backend.database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Union, Optional

router = APIRouter(prefix="/user", tags=["user"])
limiter = Limiter(key_func=get_remote_address)

@router.get("/profile", response_model=schemas.User, summary="Get user profile")
@limiter.limit("100/minute")
async def get_profile(
    request: Request,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the authenticated user's profile with orders, cart, and wishlist."""
    user = await crud.get_user(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile", response_model=schemas.User, summary="Update user profile")
@limiter.limit("10/minute")
async def update_profile(
    request: Request,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the authenticated user's profile (email, full_name, phone, address)."""
    if user_update.email and user_update.email != current_user.email:
        existing = await crud.get_user_by_email(db, user_update.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    updated_user = await crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

# CART CRUD
@router.get("/cart", response_model=schemas.CartResponse, summary="Get user cart")
@limiter.limit("100/minute")
async def read_cart(
    request: Request,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the authenticated user's cart with item details and totals."""
    return await crud.get_cart_with_totals(db, current_user.id)

@router.post("/cart", response_model=schemas.CartResponse, summary="Add item to cart")
@limiter.limit("10/minute")
async def add_to_cart(
    request: Request,
    cart_item: schemas.CartAddRequest,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a product to the authenticated user's cart."""
    cart = await crud.add_to_cart(db, cart_item, current_user.id)
    return await crud.get_cart_with_totals(db, current_user.id)

@router.delete("/cart/{product_id}", response_model=schemas.Msg, summary="Remove item from cart")
@limiter.limit("10/minute")
async def remove_from_cart(
    request: Request,
    product_id: int,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a specific product from the authenticated user's cart."""
    success = await crud.remove_cart_item(db, current_user.id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found in cart")
    return {"detail": "Product removed from cart"}

@router.put("/cart/{product_id}", response_model=schemas.CartResponse, summary="Update cart item quantity")
@limiter.limit("30/minute")
async def update_cart_item(
    request: Request,
    product_id: int,
    update_data: schemas.CartUpdateRequest,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the quantity of a product in the user's cart."""
    updated_cart = await crud.update_cart_item_quantity(db, current_user.id, product_id, update_data.quantity)
    if not updated_cart:
        raise HTTPException(status_code=404, detail="Cart or product not found")
    return await crud.get_cart_with_totals(db, current_user.id)

@router.post("/cart/checkout", response_model=schemas.CheckoutResponse, summary="Checkout cart")
@limiter.limit("5/minute")
async def checkout_cart(
    request: Request,
    checkout_data: schemas.CheckoutCreate,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Checkout the user's cart, create an order, and initiate payment."""
    if checkout_data.payment_method.lower() != "mpesa":
        raise HTTPException(status_code=400, detail="Only M-Pesa is supported")
    
    cart = await crud.get_cart_with_totals(db, current_user.id)
    if not cart or not cart.products:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Validate stock for all products
    for item in cart.products:
        product = await crud.get_product(db, item["product_id"])
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
        if product.stock < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item['product_id']}")
    
    cart_data = await crud.get_cart_with_totals(db, current_user.id)
    order_items = [
        schemas.OrderItemBase(
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["product"]["price"]
        ) for item in cart_data["products"]
    ]
    order_create = schemas.OrderCreate(items=order_items, total=cart_data["total"])
    order = await crud.create_order(db, order_create, current_user.id)
    mpesa_response = await mpesa_service.initiate_stk_push(checkout_data.phone_number, order.total, order.id)
    checkout = await crud.create_checkout(db, checkout_data, order.id)
    checkout.mpesa_transaction_id = mpesa_response.get("CheckoutRequestID")
    await db.commit()
    await db.refresh(checkout)
    payment = schemas.PaymentBase(amount=order.total, transaction_id=checkout.mpesa_transaction_id)
    await crud.create_payment(db, payment, checkout.id)
    
    # Clear the cart
    cart = await crud.get_cart(db, current_user.id)
    cart.products = []
    await db.commit()
    
    order_summary = await crud.get_order_summary(db, order.id)
    return {
        "message": "Order created successfully",
        "order_id": order.id,
        "checkout_id": checkout.id,
        "order_summary": order_summary
    }

@router.get("/wishlist", response_model=schemas.WishlistResponse, summary="Get user wishlist")
@limiter.limit("100/minute")
async def read_wishlist(
    request: Request,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the authenticated user's wishlist."""
    wishlist = await crud.get_wishlist_with_details(db, current_user.id)
    if not wishlist:
        return schemas.WishlistResponse(id=None, products=[])
    return wishlist

async def get_wishlist(db: AsyncSession, user_id: int) -> Optional[models.Wishlist]:
    result = await db.execute(
        select(models.Wishlist).filter(models.Wishlist.user_id == user_id)
    )
    wishlist = result.scalars().first()
    if wishlist and wishlist.products:
        product_ids = wishlist.products
        products_result = await db.execute(
            select(models.Product).filter(models.Product.id.in_(product_ids))
        )
        products = products_result.scalars().all()
        wishlist.products = [
            {
                "id": p.id,
                "name": p.name,
                "price": float(p.price),
                "image_url": p.image_url
            } for p in products if p.id in product_ids
        ]
    return wishlist

@router.post("/wishlist", response_model=schemas.WishlistResponse, summary="Add item to wishlist")
@limiter.limit("10/minute")
async def add_to_wishlist(
    request: Request,
    wishlist_item: schemas.WishlistAddRequest,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a product to the authenticated user's wishlist."""
    await crud.add_to_wishlist(db, wishlist_item, current_user.id)
    return await crud.get_wishlist_with_details(db, current_user.id)

async def add_to_wishlist(db: AsyncSession, wishlist_item: schemas.WishlistAddRequest, user_id: int) -> models.Wishlist:
    wishlist = await get_wishlist(db, user_id)
    if not wishlist:
        wishlist = await crud.create_wishlist(db, user_id)
    
    product_id = wishlist_item.product_id
    product = await crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product_id in wishlist.products:
        raise HTTPException(status_code=400, detail="Product already in wishlist")
    
    wishlist.products.append(product_id)
    await db.commit()
    await db.refresh(wishlist)
    return await get_wishlist(db, user_id)  # Return with detailed products

@router.delete("/wishlist/{product_id}", response_model=schemas.Msg, summary="Remove item from wishlist")
@limiter.limit("10/minute")
async def remove_from_wishlist(
    request: Request,
    product_id: int,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a specific product from the authenticated user's wishlist."""
    success = await crud.remove_wishlist_item(db, current_user.id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found in wishlist")
    return {"detail": "Product removed from wishlist"}

# Removed PUT wishlist endpoint as requested

async def update_wishlist_item(db: AsyncSession, user_id: int, product_id: int, is_active: bool) -> models.Wishlist:
    wishlist = await get_wishlist(db, user_id)
    if not wishlist:
        wishlist = await crud.create_wishlist(db, user_id)
    
    product = await crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if is_active and product_id not in wishlist.products:
        wishlist.products.append(product_id)
    elif not is_active and product_id in wishlist.products:
        wishlist.products.remove(product_id)
    
    await db.commit()
    await db.refresh(wishlist)
    return await get_wishlist(db, user_id)  # Return with detailed products

@router.get("/orders", response_model=list[schemas.Order], summary="Get user orders")
@limiter.limit("100/minute")
async def read_orders(
    request: Request,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders for the authenticated user."""
    return await crud.get_user_orders(db, current_user.id)

@router.get("/orders/{order_id}", response_model=schemas.Order, summary="Get order details")
@limiter.limit("100/minute")
async def read_order(
    request: Request,
    order_id: int,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific order for the authenticated user."""
    order = await crud.get_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/orders/{order_id}/summary", response_model=schemas.OrderSummaryResponse, summary="Get order summary")
@limiter.limit("100/minute")
async def get_order_summary(
    request: Request,
    order_id: int,
    current_user: models.User = Depends(utils.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed summary of a specific order."""
    order = await crud.get_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return await crud.get_order_summary(db, order_id)
