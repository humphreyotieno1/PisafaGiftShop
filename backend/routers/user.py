from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from backend import schemas, crud, models, services
from backend.database import get_db
from backend import utils
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/user", tags=["user"], dependencies=[Depends(utils.get_current_user)])
limiter = Limiter(key_func=get_remote_address)

@router.get("/profile/", response_model=schemas.User)
@limiter.limit("100/minute")
async def get_profile(request: Request, current_user: models.User = Depends(utils.get_current_user)):
    return current_user

@router.put("/profile/", response_model=schemas.User)
@limiter.limit("10/minute")
async def update_profile(request: Request, user_update: schemas.UserUpdate, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    updated_user = await crud.update_user(db, current_user.id, user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.get("/categories/", response_model=list[schemas.Category])
@limiter.limit("100/minute")
async def read_categories(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_categories(db)

@router.get("/categories/{category_id}", response_model=schemas.Category)
@limiter.limit("100/minute")
async def read_category(request: Request, category_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_category(db, category_id)

@router.get("/products/", response_model=list[schemas.Product])
@limiter.limit("100/minute")
async def read_products(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_products(db)

@router.get("/products/{product_id}", response_model=schemas.Product)
@limiter.limit("100/minute")
async def read_product(request: Request, product_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_product(db, product_id)

@router.get("/cart/", response_model=list[schemas.Cart])
@limiter.limit("100/minute")
async def read_cart(request: Request, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_user_cart(db, current_user.id)

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

@router.get("/order_items/", response_model=list[schemas.OrderItemBase])
@limiter.limit("100/minute")
async def read_order_items(request: Request, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_user_order_items(db, current_user.id)

@router.get("/order_items/{order_item_id}", response_model=schemas.OrderItemBase)
@limiter.limit("100/minute")
async def read_order_item(request: Request, order_item_id: int, current_user: models.User = Depends(utils.get_current_user), db: AsyncSession = Depends(get_db)):
    return await crud.get_order_item(db, order_item_id, current_user.id)

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