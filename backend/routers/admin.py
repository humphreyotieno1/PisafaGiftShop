from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend import schemas, crud, utils, models
from backend.database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(
    prefix="/admin", 
    tags=["admin"], 
    dependencies=[Depends(utils.get_current_active_admin)]
)
limiter = Limiter(key_func=get_remote_address)


# Admin Users
@router.get("/users/", response_model=list[schemas.User])
@limiter.limit("100/minute")
async def read_users(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_users(db)

@router.get("/users/{user_id}", response_model=schemas.User)
@limiter.limit("100/minute")
async def read_user(request: Request, user_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_user(db, user_id)

@router.put("/users/{user_id}", response_model=schemas.User)
@limiter.limit("10/minute")
async def update_user(
    request: Request, 
    user_id: int, 
    user_update: schemas.AdminUserUpdate,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists
    db_user = await crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if username is being updated and if it's already taken
    if user_update.username and user_update.username != db_user.username:
        existing_user = await crud.get_user_by_username(db, user_update.username)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="Username already taken"
            )
    
    # Check if email is being updated and if it's already in use
    if user_update.email and user_update.email != db_user.email:
        existing_email = await db.execute(
            select(models.User).filter(
                models.User.email == user_update.email,
                models.User.id != user_id
            )
        )
        if existing_email.scalars().first():
            raise HTTPException(
                status_code=400,
                detail="Email already in use"
            )
    
    # Hash password if provided
    update_data = user_update.dict(exclude_unset=True)
    if 'password' in update_data and update_data['password']:
        update_data['hashed_password'] = utils.get_password_hash(update_data.pop('password'))
    
    # Update user with new data
    updated_user = await crud.update_user(db, user_id, update_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return updated_user

@router.delete("/users/{user_id}")
@limiter.limit("10/minute")
async def delete_user(request: Request, user_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}

@router.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_user(request: Request, user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if username already exists
    db_user = await crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists if provided
    if user.email:
        existing_email = await db.execute(
            select(models.User).filter(models.User.email == user.email)
        )
        if existing_email.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    return await crud.create_user(db=db, user=user)


# Admin Products
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

@router.post("/products/", response_model=schemas.Product)
@limiter.limit("10/minute")
async def create_product(request: Request, product: schemas.ProductBase, db: AsyncSession = Depends(get_db)):
    return await crud.create_product(db, product)

@router.put("/products/{product_id}", response_model=schemas.Product)
@limiter.limit("10/minute")
async def update_product(request: Request, product_id: int, product: schemas.ProductBase, db: AsyncSession = Depends(get_db)):
    db_product = await crud.update_product(db, product_id, product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/products/{product_id}")
@limiter.limit("10/minute")
async def delete_product(request: Request, product_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted"}


# Admin Categories
@router.get("/categories/", response_model=list[schemas.Category])
@limiter.limit("100/minute")
async def read_categories(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_categories(db)

@router.post("/categories/", response_model=schemas.Category)
@limiter.limit("10/minute")
async def create_category(
    request: Request,
    category: schemas.CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_active_admin)
):
    return await crud.create_category(db=db, category=category)

@router.put("/categories/{category_id}", response_model=schemas.Category)
@limiter.limit("10/minute")
async def update_category(
    request: Request,
    category_id: int,
    category: schemas.CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_active_admin)
):
    db_category = await crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return await crud.update_category(db=db, category_id=category_id, category=category)

@router.delete("/categories/{category_id}")
@limiter.limit("10/minute")
async def delete_category(request: Request, category_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted"}

# Admin carts
@router.get("/carts/", response_model=list[schemas.Cart])
@limiter.limit("100/minute")
async def read_carts(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_carts(db)

@router.get("/carts/{cart_id}", response_model=schemas.Cart)
@limiter.limit("100/minute")
async def read_cart(request: Request, cart_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_cart(db, cart_id)

@router.put("/carts/{cart_id}", response_model=schemas.Cart)
@limiter.limit("10/minute")
async def update_cart(request: Request, cart_id: int, cart: schemas.CartBase, db: AsyncSession = Depends(get_db)):
    db_cart = await crud.update_cart(db, cart_id, cart)
    if db_cart is None:
        raise HTTPException(status_code=404, detail="Cart not found")
    return db_cart

@router.delete("/carts/{cart_id}")
@limiter.limit("10/minute")
async def delete_cart(request: Request, cart_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_cart(db, cart_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart not found")
    return {"detail": "Cart deleted"}


# Admin Orders
@router.get("/orders/", response_model=list[schemas.Order])
@limiter.limit("100/minute")
async def read_orders(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_orders(db)

@router.get("/orders/{order_id}", response_model=schemas.Order)
@limiter.limit("100/minute")
async def read_order(request: Request, order_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_order(db, order_id)

@router.put("/orders/{order_id}", response_model=schemas.Order)
@limiter.limit("10/minute")
async def update_order(request: Request, order_id: int, order: schemas.OrderBase, db: AsyncSession = Depends(get_db)):
    db_order = await crud.update_order(db, order_id, order)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@router.delete("/orders/{order_id}")
@limiter.limit("10/minute")
async def delete_order(request: Request, order_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"detail": "Order deleted"}


# Admin Order Items
@router.get("/order_items/", response_model=list[schemas.OrderItemBase])
@limiter.limit("100/minute")
async def read_order_items(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_order_items(db)

@router.get("/order_items/{order_item_id}", response_model=schemas.OrderItemBase)
@limiter.limit("100/minute")
async def read_order_item(request: Request, order_item_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_order_item(db, order_item_id)

@router.put("/order_items/{order_item_id}", response_model=schemas.OrderItemBase)
@limiter.limit("10/minute")
async def update_order_item(request: Request, order_item_id: int, order_item: schemas.OrderItemBase, db: AsyncSession = Depends(get_db)):
    db_order_item = await crud.update_order_item(db, order_item_id, order_item)
    if db_order_item is None:
        raise HTTPException(status_code=404, detail="Order item not found")
    return db_order_item

@router.delete("/order_items/{order_item_id}")
@limiter.limit("10/minute")
async def delete_order_item(request: Request, order_item_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_order_item(db, order_item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order item not found")
    return {"detail": "Order item deleted"}


# Admin Wishlists
@router.get("/wishlists/", response_model=list[schemas.Wishlist])
@limiter.limit("100/minute")
async def read_wishlists(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_wishlists(db)

@router.get("/wishlists/{wishlist_id}", response_model=schemas.Wishlist)
@limiter.limit("100/minute")
async def read_wishlist(request: Request, wishlist_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_wishlist(db, wishlist_id)

@router.put("/wishlists/{wishlist_id}", response_model=schemas.Wishlist)
@limiter.limit("10/minute")
async def update_wishlist(request: Request, wishlist_id: int, wishlist: schemas.WishlistBase, db: AsyncSession = Depends(get_db)):
    db_wishlist = await crud.update_wishlist(db, wishlist_id, wishlist)
    if db_wishlist is None:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    return db_wishlist

@router.delete("/wishlists/{wishlist_id}")
@limiter.limit("10/minute")
async def delete_wishlist(request: Request, wishlist_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_wishlist(db, wishlist_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    return {"detail": "Wishlist deleted"}


# Admin Checkouts
@router.get("/checkouts/", response_model=list[schemas.Checkout])
@limiter.limit("100/minute")
async def read_checkouts(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_checkouts(db)

@router.get("/checkouts/{checkout_id}", response_model=schemas.Checkout)
@limiter.limit("100/minute")
async def read_checkout(request: Request, checkout_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_checkout(db, checkout_id)

@router.put("/checkouts/{checkout_id}", response_model=schemas.Checkout)
@limiter.limit("10/minute")
async def update_checkout(request: Request, checkout_id: int, checkout: schemas.CheckoutBase, db: AsyncSession = Depends(get_db)):
    db_checkout = await crud.update_checkout(db, checkout_id, checkout)
    if db_checkout is None:
        raise HTTPException(status_code=404, detail="Checkout not found")
    return db_checkout

@router.delete("/checkouts/{checkout_id}")
@limiter.limit("10/minute")
async def delete_checkout(request: Request, checkout_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_checkout(db, checkout_id)
    if not success:
        raise HTTPException(status_code=404, detail="Checkout not found")
    return {"detail": "Checkout deleted"}


# Admin Payments
@router.get("/payments/", response_model=list[schemas.Payment])
@limiter.limit("100/minute")
async def read_payments(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_payments(db)

@router.get("/payments/{payment_id}", response_model=schemas.Payment)
@limiter.limit("100/minute")
async def read_payment(request: Request, payment_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_payment(db, payment_id)

@router.put("/payments/{payment_id}", response_model=schemas.Payment)
@limiter.limit("10/minute")
async def update_payment(request: Request, payment_id: int, payment: schemas.PaymentBase, db: AsyncSession = Depends(get_db)):
    db_payment = await crud.update_payment(db, payment_id, payment)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@router.delete("/payments/{payment_id}")
@limiter.limit("10/minute")
async def delete_payment(request: Request, payment_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_payment(db, payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"detail": "Payment deleted"}