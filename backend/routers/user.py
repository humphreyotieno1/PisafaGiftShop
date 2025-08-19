from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from backend import schemas, crud, models, services
from backend.database import get_db
from backend import utils
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="", tags=["user"])
limiter = Limiter(key_func=get_remote_address)

@router.get("/categories/", response_model=list[schemas.Category])
@limiter.limit("100/minute")
async def read_categories(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_categories(db)

@router.get("/categories/{category_id}", response_model=schemas.Category)
@limiter.limit("100/minute")
async def read_category(request: Request, category_id: int, db: AsyncSession = Depends(get_db)):
    category = await crud.get_category(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("/products/", response_model=list[schemas.Product])
@limiter.limit("100/minute")
async def read_products(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_products(db)

@router.get("/products/{product_id}", response_model=schemas.Product)
@limiter.limit("100/minute")
async def read_product(request: Request, product_id: int, db: AsyncSession = Depends(get_db)):
    product = await crud.get_product(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/profile/", response_model=schemas.User)
@limiter.limit("100/minute")
async def get_profile(
    request: Request, 
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get user with all relationships
    result = await db.execute(
        select(models.User)
        .options(
            selectinload(models.User.orders).selectinload(models.Order.items),
            selectinload(models.User.wishlists).selectinload(models.Wishlist.product),
            selectinload(models.User.carts).selectinload(models.Cart.product)
        )
        .where(models.User.id == current_user.id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile/", response_model=schemas.User)
@limiter.limit("10/minute")
async def update_profile(request: Request, user_update: schemas.UserUpdate, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    updated_user = await crud.update_user(db, current_user.id, user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.get("/cart/", response_model=schemas.CartResponse)
@limiter.limit("100/minute")
async def read_cart(
    request: Request,
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's cart with calculated totals"""
    return await crud.get_cart_with_totals(db, current_user.id)

@router.get("/cart/{cart_id}", response_model=schemas.Cart)
@limiter.limit("100/minute")
async def read_cart_item(request: Request, cart_id: int, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_cart_item(db, cart_id, current_user.id)

@router.post("/cart/", response_model=schemas.Cart)
@limiter.limit("10/minute")
async def add_to_cart(request: Request, cart: schemas.CartBase, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.add_to_cart(db, cart, current_user.id)

@router.delete("/cart/{cart_id}")
@limiter.limit("10/minute")
async def remove_from_cart(request: Request, cart_id: int, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    success = await crud.remove_from_cart(db, cart_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"detail": "Item removed from cart"}

@router.delete("/cart/items/{product_id}")
@limiter.limit("10/minute")
async def remove_cart_item(
    request: Request,
    product_id: int,
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a specific product from the user's cart"""
    success = await crud.remove_cart_item(db, current_user.id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"detail": "Item removed from cart"}

@router.post("/cart/checkout/", response_model=schemas.CheckoutResponse)
@limiter.limit("5/minute")
async def checkout_cart(
    request: Request,
    checkout_data: schemas.CheckoutBase,
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Process cart checkout and create an order"""
    # Get cart with totals
    cart_data = await crud.get_cart_with_totals(db, current_user.id)
    if not cart_data["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Create order items
    order_items = [
        schemas.OrderItemBase(
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["product"]["price"]  # Store price at time of order
        ) for item in cart_data["items"]
    ]
    
    order_create = schemas.OrderCreate(
        items=order_items,
        total=cart_data["total"]
    )
    
    # Create order (this will also validate stock)
    order = await crud.create_order(db, order_create, current_user.id)
    
    # Clear the cart after successful order
    await db.execute(delete(models.Cart).where(models.Cart.user_id == current_user.id))
    await db.commit()
    
    # Create checkout
    checkout = await crud.create_checkout(
        db=db,
        checkout=checkout_data,
        order_id=order.id
    )
    
    # Get order summary with all details
    order_summary = await crud.get_order_summary(db, order.id)
    
    return {
        "message": "Order created successfully",
        "order_id": order.id,
        "checkout_id": checkout.id,
        "order_summary": order_summary
    }

@router.post("/orders/", response_model=schemas.Order)
@limiter.limit("5/minute")
async def create_order(request: Request, order: schemas.OrderCreate, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.create_order(db, order, current_user.id)

@router.get("/orders/", response_model=list[schemas.Order])
@limiter.limit("100/minute")
async def read_orders(request: Request, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_user_orders(db, current_user.id)

@router.get("/orders/{order_id}", response_model=schemas.Order)
@limiter.limit("100/minute")
async def read_order(request: Request, order_id: int, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_order(db, order_id, current_user.id)

@router.get("/orders/{order_id}/summary", response_model=schemas.OrderSummaryResponse)
@limiter.limit("100/minute")
async def get_order_summary(
    request: Request,
    order_id: int,
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed order summary with totals"""
    # Verify the order belongs to the user
    order = await crud.get_order(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return await crud.get_order_summary(db, order_id)

@router.get("/order_items/", response_model=list[schemas.OrderItemBase])
@limiter.limit("100/minute")
async def read_order_items(request: Request, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_user_order_items(db, current_user.id)

@router.get("/order_items/{order_item_id}", response_model=schemas.OrderItemBase)
@limiter.limit("100/minute")
async def read_order_item(request: Request, order_item_id: int, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_order_item(db, order_item_id, current_user.id)

@router.delete("/order_items/{order_item_id}")
@limiter.limit("10/minute")
async def remove_order_item(
    request: Request,
    order_item_id: int,
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove an item from an order (if the order belongs to the user)"""
    success = await crud.delete_order_item(db, order_item_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Order item not found or access denied")
    return {"detail": "Order item removed"}

@router.get("/wishlist/", response_model=list[schemas.Wishlist])
@limiter.limit("100/minute")
async def read_wishlist(request: Request, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_user_wishlist(db, current_user.id)

@router.post("/wishlist/", response_model=schemas.Wishlist)
@limiter.limit("10/minute")
async def add_to_wishlist(request: Request, wishlist: schemas.WishlistBase, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.add_to_wishlist(db, wishlist, current_user.id)

@router.delete("/wishlist/{wishlist_id}")
@limiter.limit("10/minute")
async def remove_from_wishlist(request: Request, wishlist_id: int, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    success = await crud.remove_from_wishlist(db, wishlist_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"detail": "Item removed from wishlist"}

@router.delete("/wishlist/items/{product_id}")
@limiter.limit("10/minute")
async def remove_wishlist_item(
    request: Request,
    product_id: int,
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a specific product from the user's wishlist"""
    success = await crud.remove_wishlist_item(db, current_user.id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"detail": "Item removed from wishlist"}

@router.post("/checkout/{order_id}", response_model=schemas.Checkout)
@limiter.limit("5/minute")
async def process_checkout(
    request: Request,
    order_id: int,
    checkout: schemas.CheckoutBase,
    current_user: models.User = Depends(utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order = await db.execute(
        select(models.Order).filter(models.Order.id == order_id, models.Order.user_id == current_user.id)
    )
    order = order.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if checkout.payment_method.lower() != "mpesa":
        raise HTTPException(status_code=400, detail="Only M-Pesa is supported")
    # Initiate M-Pesa STK Push
    mpesa_response = await services.initiate_stk_push(checkout.phone_number, order.total, order_id)
    db_checkout = await crud.create_checkout(db, checkout, order_id)
    # Store M-Pesa transaction ID (CheckoutRequestID for now, update in callback)
    db_checkout.mpesa_transaction_id = mpesa_response.get("CheckoutRequestID")
    await db.commit()
    await db.refresh(db_checkout)
    # Create payment record
    payment = schemas.PaymentBase(amount=order.total, transaction_id=db_checkout.mpesa_transaction_id)
    await crud.create_payment(db, payment, db_checkout.id)
    return db_checkout

@router.post("/callback/{order_id}")
async def mpesa_callback(order_id: int, callback_data: dict, db: AsyncSession = Depends(get_db)):
    # Handle M-Pesa callback
    result_code = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
    checkout_request_id = callback_data.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")
    if not result_code or not checkout_request_id:
        raise HTTPException(status_code=400, detail="Invalid callback data")
    
    checkout = await db.execute(
        select(models.Checkout).filter(models.Checkout.order_id == order_id, models.Checkout.mpesa_transaction_id == checkout_request_id)
    )
    checkout = checkout.scalars().first()
    if not checkout:
        raise HTTPException(status_code=404, detail="Checkout not found")
    
    if result_code == 0:  # Success
        callback_metadata = callback_data.get("Body", {}).get("stkCallback", {}).get("CallbackMetadata", {}).get("Item", [])
        mpesa_receipt = next((item["Value"] for item in callback_metadata if item["Name"] == "MpesaReceiptNumber"), None)
        checkout.payment_status = "paid"
        checkout.mpesa_transaction_id = mpesa_receipt
        # Update order status
        await db.execute(
            update(models.Order).where(models.Order.id == order_id).values(status="paid")
        )
        # Update payment status
        await db.execute(
            update(models.Payment).where(models.Payment.checkout_id == checkout.id).values(status="paid")
        )
    else:
        checkout.payment_status = "failed"
        await db.execute(
            update(models.Order).where(models.Order.id == order_id).values(status="failed")
        )
        # Update payment status
        await db.execute(
            update(models.Payment).where(models.Payment.checkout_id == checkout.id).values(status="failed")
        )
    
    await db.commit()
    return {"detail": "Callback processed"}