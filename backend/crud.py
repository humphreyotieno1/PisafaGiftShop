from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from . import models, schemas
from .utils import get_password_hash, verify_password
from fastapi import HTTPException

# User CRUD
async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.User).filter(models.User.id == user_id))
    return result.scalars().first()

# Admin CRUD
async def get_users(db: AsyncSession):
    result = await db.execute(select(models.User))
    return result.scalars().all()


async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(models.User).filter(models.User.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role, email=user.email, full_name=user.full_name, phone=user.phone, address=user.address)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def authenticate_user(db: AsyncSession, username: str, password: str):
    user = await get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

async def update_user(db: AsyncSession, user_id: int, user_update: schemas.UserUpdate):
    result = await db.execute(
        update(models.User).where(models.User.id == user_id).values(**user_update.dict(exclude_unset=True))
    )
    await db.commit()
    return await get_user(db, user_id)

# Category CRUD (Admin)
async def get_categories(db: AsyncSession):
    result = await db.execute(select(models.Category))
    return result.scalars().all()

async def get_category(db: AsyncSession, category_id: int):
    result = await db.execute(select(models.Category).filter(models.Category.id == category_id))
    return result.scalars().first()

async def create_category(db: AsyncSession, category: schemas.CategoryBase):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

async def update_category(db: AsyncSession, category_id: int, category: schemas.CategoryBase):
    result = await db.execute(
        update(models.Category).where(models.Category.id == category_id).values(**category.dict())
    )
    await db.commit()
    return await get_category(db, category_id)

async def delete_category(db: AsyncSession, category_id: int):
    result = await db.execute(delete(models.Category).where(models.Category.id == category_id))
    await db.commit()
    return result.rowcount > 0

# Product CRUD (Admin)
async def get_products(db: AsyncSession):
    result = await db.execute(select(models.Product))
    return result.scalars().all()

async def get_product(db: AsyncSession, product_id: int):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    return result.scalars().first()

async def create_product(db: AsyncSession, product: schemas.ProductBase):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def update_product(db: AsyncSession, product_id: int, product: schemas.ProductBase):
    result = await db.execute(
        update(models.Product).where(models.Product.id == product_id).values(**product.dict())
    )
    await db.commit()
    return await get_product(db, product_id)

async def delete_product(db: AsyncSession, product_id: int):
    result = await db.execute(delete(models.Product).where(models.Product.id == product_id))
    await db.commit()
    return result.rowcount > 0

# Cart CRUD (User)
async def get_user_cart(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.Cart).filter(models.Cart.user_id == user_id))
    return result.scalars().all()

async def add_to_cart(db: AsyncSession, cart: schemas.CartBase, user_id: int):
    product = await get_product(db, cart.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < cart.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    db_cart = models.Cart(**cart.dict(), user_id=user_id)
    db.add(db_cart)
    await db.commit()
    await db.refresh(db_cart)
    return db_cart

async def remove_from_cart(db: AsyncSession, cart_id: int, user_id: int):
    result = await db.execute(
        delete(models.Cart).where(models.Cart.id == cart_id, models.Cart.user_id == user_id)
    )
    await db.commit()
    return result.rowcount > 0

# Order CRUD (User)
async def create_order(db: AsyncSession, order: schemas.OrderCreate, user_id: int):
    total = 0
    for item in order.items:
        product = await get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item.product_id}")
        total += item.quantity * item.price
        # Update stock
        await db.execute(
            update(models.Product).where(models.Product.id == item.product_id).values(stock=product.stock - item.quantity)
        )
    db_order = models.Order(user_id=user_id, total=total)
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    for item in order.items:
        db_item = models.OrderItem(**item.dict(), order_id=db_order.id)
        db.add(db_item)
    await db.commit()
    return db_order

async def get_user_orders(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.Order).filter(models.Order.user_id == user_id))
    return result.scalars().all()

# Wishlist CRUD (User)
async def get_user_wishlist(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.Wishlist).filter(models.Wishlist.user_id == user_id))
    return result.scalars().all()

async def add_to_wishlist(db: AsyncSession, wishlist: schemas.WishlistBase, user_id: int):
    product = await get_product(db, wishlist.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db_wishlist = models.Wishlist(**wishlist.dict(), user_id=user_id)
    db.add(db_wishlist)
    await db.commit()
    await db.refresh(db_wishlist)
    return db_wishlist

async def remove_from_wishlist(db: AsyncSession, wishlist_id: int, user_id: int):
    result = await db.execute(
        delete(models.Wishlist).where(models.Wishlist.id == wishlist_id, models.Wishlist.user_id == user_id)
    )
    await db.commit()
    return result.rowcount > 0

# Checkout (User)
async def create_checkout(db: AsyncSession, checkout: schemas.CheckoutBase, order_id: int):
    db_checkout = models.Checkout(**checkout.dict(), order_id=order_id)
    db.add(db_checkout)
    await db.commit()
    await db.refresh(db_checkout)
    return db_checkout

# Payment CRUD
async def create_payment(db: AsyncSession, payment: schemas.PaymentBase, checkout_id: int):
    db_payment = models.Payment(**payment.dict(), checkout_id=checkout_id)
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment