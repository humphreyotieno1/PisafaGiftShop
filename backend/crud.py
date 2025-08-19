from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
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
    # Create the user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username, 
        hashed_password=hashed_password, 
        role=user.role, 
        email=user.email, 
        full_name=user.full_name, 
        phone=user.phone, 
        address=user.address
    )
    db.add(db_user)
    await db.flush()  # Flush to get the user ID
    
    # Create empty cart for the user
    db_cart = models.Cart(user_id=db_user.id)
    db.add(db_cart)
    
    # Create empty wishlist for the user
    db_wishlist = models.Wishlist(user_id=db_user.id)
    db.add(db_wishlist)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def authenticate_user(db: AsyncSession, username: str, password: str):
    user = await get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

async def update_user(db: AsyncSession, user_id: int, user_update):
    # Handle both Pydantic model and dictionary inputs
    update_data = user_update.dict(exclude_unset=True) if hasattr(user_update, 'dict') else user_update
    
    result = await db.execute(
        update(models.User)
        .where(models.User.id == user_id)
        .values(**update_data)
    )
    await db.commit()
    
    # Return the updated user
    if result.rowcount > 0:
        updated_user = await db.get(models.User, user_id)
        await db.refresh(updated_user)
        return updated_user
    return None

async def delete_user(db: AsyncSession, user_id: int):
    result = await db.execute(delete(models.User).where(models.User.id == user_id))
    await db.commit()
    return result.rowcount > 0

async def get_carts(db: AsyncSession):
    result = await db.execute(select(models.Cart))
    return result.scalars().all()

async def get_cart(db: AsyncSession, cart_id: int):
    result = await db.execute(select(models.Cart).filter(models.Cart.id == cart_id))
    return result.scalars().first()

async def create_cart(db: AsyncSession, cart: schemas.CartBase):
    db_cart = models.Cart(**cart.dict())
    db.add(db_cart)
    await db.commit()
    await db.refresh(db_cart)
    return db_cart

async def update_cart(db: AsyncSession, cart_id: int, cart: schemas.CartBase):
    result = await db.execute(
        update(models.Cart).where(models.Cart.id == cart_id).values(**cart.dict())
    )
    await db.commit()
    return await get_cart(db, cart_id)

async def delete_cart(db: AsyncSession, cart_id: int):
    result = await db.execute(delete(models.Cart).where(models.Cart.id == cart_id))
    await db.commit()
    return result.rowcount > 0

async def get_orders(db: AsyncSession):
    result = await db.execute(select(models.Order))
    return result.scalars().all()

async def get_order(db: AsyncSession, order_id: int):
    result = await db.execute(select(models.Order).filter(models.Order.id == order_id))
    return result.scalars().first()

async def create_order(db: AsyncSession, order: schemas.OrderBase):
    db_order = models.Order(**order.dict())
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order

async def update_order(db: AsyncSession, order_id: int, order: schemas.OrderBase):
    result = await db.execute(
        update(models.Order).where(models.Order.id == order_id).values(**order.dict())
    )
    await db.commit()
    return await get_order(db, order_id)

async def delete_order(db: AsyncSession, order_id: int):
    result = await db.execute(delete(models.Order).where(models.Order.id == order_id))
    await db.commit()
    return result.rowcount > 0

# Category CRUD (Admin)
async def get_categories(db: AsyncSession):
    result = await db.execute(
        select(models.Category)
        .options(selectinload(models.Category.products))
        .order_by(models.Category.name)
    )
    return result.scalars().all()

async def get_category(db: AsyncSession, category_id: int):
    result = await db.execute(
        select(models.Category)
        .options(selectinload(models.Category.products))
        .filter(models.Category.id == category_id)
    )
    return result.scalars().first()

async def create_category(db: AsyncSession, category: schemas.CategoryCreate):
    db_category = models.Category(
        name=category.name,
        description=category.description,
        image_url=category.image_url
    )
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    
    # Return a serialized version of the category
    return {
        "id": db_category.id,
        "name": db_category.name,
        "description": db_category.description,
        "image_url": db_category.image_url,
        "products": []  # Empty list for products to match the schema
    }

async def update_category(db: AsyncSession, category_id: int, category: schemas.CategoryUpdate):
    update_data = category.dict(exclude_unset=True)
    result = await db.execute(
        update(models.Category)
        .where(models.Category.id == category_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_category(db, category_id)

async def delete_category(db: AsyncSession, category_id: int):
    result = await db.execute(
        delete(models.Category)
        .where(models.Category.id == category_id)
    )
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

async def remove_cart_item(db: AsyncSession, user_id: int, product_id: int):
    """Remove a specific product from user's cart"""
    result = await db.execute(
        delete(models.Cart)
        .where(
            models.Cart.user_id == user_id,
            models.Cart.product_id == product_id
        )
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

async def remove_wishlist_item(db: AsyncSession, user_id: int, product_id: int):
    """Remove a specific product from user's wishlist"""
    result = await db.execute(
        delete(models.Wishlist)
        .where(
            models.Wishlist.user_id == user_id,
            models.Wishlist.product_id == product_id
        )
    )
    await db.commit()
    return result.rowcount > 0

async def get_wishlist(db: AsyncSession, wishlist_id: int):
    result = await db.execute(select(models.Wishlist).filter(models.Wishlist.id == wishlist_id))
    return result.scalars().first()

async def update_wishlist(db: AsyncSession, wishlist_id: int, wishlist: schemas.WishlistBase):
    result = await db.execute(
        update(models.Wishlist).where(models.Wishlist.id == wishlist_id).values(**wishlist.dict())
    )
    await db.commit()
    return await get_wishlist(db, wishlist_id)

async def delete_wishlist(db: AsyncSession, wishlist_id: int):
    result = await db.execute(delete(models.Wishlist).where(models.Wishlist.id == wishlist_id))
    await db.commit()
    return result.rowcount > 0

# Checkout (User)
async def create_checkout(db: AsyncSession, checkout: schemas.CheckoutBase, order_id: int):
    db_checkout = models.Checkout(**checkout.dict(), order_id=order_id)
    db.add(db_checkout)
    await db.commit()
    await db.refresh(db_checkout)
    return db_checkout

async def get_checkouts(db: AsyncSession):
    result = await db.execute(select(models.Checkout))
    return result.scalars().all()

async def get_checkout(db: AsyncSession, checkout_id: int):
    result = await db.execute(select(models.Checkout).filter(models.Checkout.id == checkout_id))
    return result.scalars().first()

async def update_checkout(db: AsyncSession, checkout_id: int, checkout: schemas.CheckoutBase):
    result = await db.execute(
        update(models.Checkout).where(models.Checkout.id == checkout_id).values(**checkout.dict())
    )
    await db.commit()
    return await get_checkout(db, checkout_id)

async def delete_checkout(db: AsyncSession, checkout_id: int):
    result = await db.execute(delete(models.Checkout).where(models.Checkout.id == checkout_id))
    await db.commit()
    return result.rowcount > 0

# Payment CRUD
async def create_payment(db: AsyncSession, payment: schemas.PaymentBase, checkout_id: int):
    db_payment = models.Payment(**payment.dict(), checkout_id=checkout_id)
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

async def get_payments(db: AsyncSession):
    result = await db.execute(select(models.Payment))
    return result.scalars().all()

async def get_payment(db: AsyncSession, payment_id: int):
    result = await db.execute(select(models.Payment).filter(models.Payment.id == payment_id))
    return result.scalars().first()

async def update_payment(db: AsyncSession, payment_id: int, payment: schemas.PaymentBase):
    result = await db.execute(
        update(models.Payment).where(models.Payment.id == payment_id).values(**payment.dict())
    )
    await db.commit()
    return await get_payment(db, payment_id)

async def delete_payment(db: AsyncSession, payment_id: int):
    result = await db.execute(delete(models.Payment).where(models.Payment.id == payment_id))
    await db.commit()
    return result.rowcount > 0


# Order item
async def create_order_item(db: AsyncSession, order_item: schemas.OrderItemBase, order_id: int):
    db_order_item = models.OrderItem(**order_item.dict(), order_id=order_id)
    db.add(db_order_item)
    await db.commit()
    await db.refresh(db_order_item)
    return db_order_item

async def get_order_items(db: AsyncSession):
    result = await db.execute(select(models.OrderItem))
    return result.scalars().all()

async def delete_order_item(db: AsyncSession, order_item_id: int, user_id: int):
    """Delete an order item if it belongs to the user's order"""
    # First check if the order belongs to the user
    order_item = await db.execute(
        select(models.OrderItem)
        .join(models.Order)
        .where(
            models.OrderItem.id == order_item_id,
            models.Order.user_id == user_id
        )
    )
    order_item = order_item.scalars().first()
    
    if not order_item:
        return False
        
    # Delete the order item
    result = await db.execute(
        delete(models.OrderItem)
        .where(models.OrderItem.id == order_item_id)
    )
    await db.commit()
    return result.rowcount > 0

# Utility functions for calculating totals
async def calculate_cart_total(db: AsyncSession, user_id: int) -> float:
    """Calculate the total price of all items in the user's cart"""
    result = await db.execute(
        select(models.Cart.quantity * models.Product.price)
        .join(models.Product, models.Cart.product_id == models.Product.id)
        .where(models.Cart.user_id == user_id)
    )
    return float(sum(row[0] for row in result.all() or [0]))

async def get_cart_with_totals(db: AsyncSession, user_id: int):
    """Get user's cart with item details and calculate subtotal, tax, and total"""
    # Get cart items with product details
    result = await db.execute(
        select(models.Cart, models.Product)
        .join(models.Product, models.Cart.product_id == models.Product.id)
        .where(models.Cart.user_id == user_id)
    )
    
    cart_items = []
    subtotal = 0.0
    
    for cart_item, product in result.all():
        item_total = cart_item.quantity * product.price
        subtotal += item_total
        
        cart_items.append({
            "id": cart_item.id,
            "product_id": cart_item.product_id,
            "quantity": cart_item.quantity,
            "product": {
                "id": product.id,
                "name": product.name,
                "price": float(product.price),
                "image_url": product.image_url
            },
            "item_total": float(item_total)
        })
    
    # Calculate tax (16% VAT)
    tax_rate = 0.16
    tax = subtotal * tax_rate
    total = subtotal + tax
    
    return {
        "items": cart_items,
        "subtotal": float(subtotal),
        "tax": float(tax),
        "total": float(total),
        "tax_rate": tax_rate,
        "currency": "KES"
    }

async def get_order_summary(db: AsyncSession, order_id: int):
    """Get order summary with item details and totals"""
    # Get order with items and products
    order = await db.execute(
        select(models.Order)
        .options(
            selectinload(models.Order.items)
            .selectinload(models.OrderItem.product)
        )
        .where(models.Order.id == order_id)
    )
    order = order.scalars().first()
    
    if not order:
        return None
    
    # Prepare order items with details
    order_items = []
    subtotal = 0.0
    
    for item in order.items:
        item_total = item.quantity * item.price
        subtotal += item_total
        
        order_items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": float(item.price),
            "item_total": float(item_total),
            "product": {
                "id": item.product.id,
                "name": item.product.name,
                "image_url": item.product.image_url
            }
        })
    
    # Calculate tax and totals
    tax_rate = 0.16
    tax = subtotal * tax_rate
    shipping_cost = 0.0  # Could be calculated based on address, weight, etc.
    grand_total = subtotal + tax + shipping_cost
    
    return {
        "order_id": order.id,
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "items": order_items,
        "subtotal": float(subtotal),
        "tax": float(tax),
        "tax_rate": tax_rate,
        "shipping_cost": float(shipping_cost),
        "total": float(grand_total),
        "currency": "KES"
    }