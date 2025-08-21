from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, desc
from sqlalchemy.orm import selectinload
from backend import models, schemas, utils
from fastapi import HTTPException
from typing import Optional, List, Dict, Union

# User CRUD
async def get_user(db: AsyncSession, user_id: int) -> Optional[models.User]:
    result = await db.execute(
        select(models.User)
        .options(
            selectinload(models.User.orders).selectinload(models.Order.items).selectinload(models.OrderItem.product),
            selectinload(models.User.carts),
            selectinload(models.User.wishlists)
        )
        .filter(models.User.id == user_id)
    )
    return result.scalars().first()

async def get_users(db: AsyncSession) -> List[models.User]:
    result = await db.execute(select(models.User))
    return result.scalars().all()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).filter(models.User.username == username))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).filter(models.User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
    hashed_password = utils.get_password_hash(user.password)
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
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user_id: int, user_update: Union[schemas.UserUpdate, schemas.AdminUserUpdate]) -> Optional[models.User]:
    update_data = user_update.dict(exclude_unset=True)
    if 'password' in update_data:
        update_data['hashed_password'] = utils.get_password_hash(update_data.pop('password'))
    result = await db.execute(
        update(models.User).where(models.User.id == user_id).values(**update_data)
    )
    await db.commit()
    if result.rowcount > 0:
        return await get_user(db, user_id)
    return None

async def delete_user(db: AsyncSession, user_id: int) -> bool:
    result = await db.execute(delete(models.User).where(models.User.id == user_id))
    await db.commit()
    return result.rowcount > 0

async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[models.User]:
    user = await get_user_by_username(db, username)
    if not user or not utils.verify_password(password, user.hashed_password):
        return None
    return user

# Category CRUD
async def get_categories(db: AsyncSession) -> List[models.Category]:
    result = await db.execute(
        select(models.Category)
        .options(selectinload(models.Category.products))
        .order_by(models.Category.name)
    )
    return result.scalars().all()

async def get_category(db: AsyncSession, category_id: int) -> Optional[models.Category]:
    result = await db.execute(
        select(models.Category)
        .options(selectinload(models.Category.products))
        .filter(models.Category.id == category_id)
    )
    return result.scalars().first()

async def create_category(db: AsyncSession, category: schemas.CategoryCreate) -> models.Category:
    db_category = models.Category(**category.dict())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

async def update_category(db: AsyncSession, category_id: int, category: schemas.CategoryUpdate) -> Optional[models.Category]:
    update_data = category.dict(exclude_unset=True)
    result = await db.execute(
        update(models.Category).where(models.Category.id == category_id).values(**update_data)
    )
    await db.commit()
    if result.rowcount > 0:
        return await get_category(db, category_id)
    return None

async def delete_category(db: AsyncSession, category_id: int) -> bool:
    result = await db.execute(delete(models.Category).where(models.Category.id == category_id))
    await db.commit()
    return result.rowcount > 0

# Product CRUD
async def get_products(db: AsyncSession) -> List[models.Product]:
    result = await db.execute(select(models.Product).options(selectinload(models.Product.category)))
    return result.scalars().all()

async def get_product(db: AsyncSession, product_id: int) -> Optional[models.Product]:
    result = await db.execute(
        select(models.Product)
        .options(selectinload(models.Product.category))
        .filter(models.Product.id == product_id)
    )
    return result.scalars().first()

async def create_product(db: AsyncSession, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def update_product(db: AsyncSession, product_id: int, product: schemas.ProductBase) -> Optional[models.Product]:
    update_data = product.dict(exclude_unset=True)
    result = await db.execute(
        update(models.Product).where(models.Product.id == product_id).values(**update_data)
    )
    await db.commit()
    if result.rowcount > 0:
        return await get_product(db, product_id)
    return None

async def delete_product(db: AsyncSession, product_id: int) -> bool:
    result = await db.execute(delete(models.Product).where(models.Product.id == product_id))
    await db.commit()
    return result.rowcount > 0

# ========== Cart CRUD Operations ==========

async def get_cart(db: AsyncSession, user_id: int) -> Optional[models.Cart]:
    """Retrieve a user's cart if it exists."""
    result = await db.execute(select(models.Cart).filter(models.Cart.user_id == user_id))
    return result.scalars().first()

async def create_cart(db: AsyncSession, user_id: int) -> models.Cart:
    """Create a new cart for a user."""
    db_cart = models.Cart(user_id=user_id, products=[])
    db.add(db_cart)
    await db.commit()
    await db.refresh(db_cart)
    return db_cart

async def get_or_create_cart(db: AsyncSession, user_id: int) -> models.Cart:
    """Get existing cart or create a new one if it doesn't exist."""
    return await get_cart(db, user_id) or await create_cart(db, user_id)

async def add_to_cart(
    db: AsyncSession,
    cart_item: schemas.CartAddRequest,
    user_id: int
) -> models.Cart:
    """Add an item to the cart or update quantity if item exists."""
    cart = await get_or_create_cart(db, user_id)
    product = await get_product(db, cart_item.product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock <= 0:
        raise HTTPException(status_code=400, detail="Product out of stock")

    existing_products = list(cart.products or [])
    for item in existing_products:
        if item.get("product_id") == cart_item.product_id:
            new_quantity = item.get("quantity", 0) + cart_item.quantity
            if new_quantity > product.stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {product.stock} items available in stock"
                )
            item["quantity"] = new_quantity
            break
    else:
        if cart_item.quantity > product.stock:
            raise HTTPException(status_code=400, detail=f"Only {product.stock} items available in stock")
        existing_products.append({"product_id": cart_item.product_id, "quantity": cart_item.quantity})

    cart.products = existing_products
    await db.commit()
    await db.refresh(cart)
    return cart

async def remove_cart_item(db: AsyncSession, user_id: int, product_id: int) -> bool:
    cart = await get_cart(db, user_id)
    if not cart or not cart.products:
        return False
    filtered = [item for item in cart.products if item.get("product_id") != product_id]
    if len(filtered) == len(cart.products):
        return False
    cart.products = filtered
    await db.commit()
    return True

async def update_cart_item_quantity(db: AsyncSession, user_id: int, product_id: int, quantity: int) -> Optional[dict]:
    if quantity < 0:
        raise HTTPException(status_code=400, detail="Quantity cannot be negative")

    cart = await get_cart(db, user_id)
    if not cart:
        return None

    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if quantity > product.stock:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} items available in stock")

    updated_products = list(cart.products or [])
    for item in updated_products:
        if item.get("product_id") == product_id:
            if quantity == 0:
                updated_products.remove(item)
            else:
                item["quantity"] = quantity
            break
    else:
        if quantity > 0:
            updated_products.append({"product_id": product_id, "quantity": quantity})

    cart.products = updated_products
    await db.commit()
    await db.refresh(cart)
    return await get_cart_with_totals(db, user_id)

async def get_cart_with_totals(db: AsyncSession, user_id: int) -> dict:
    cart = await get_cart(db, user_id)
    if not cart or not cart.products:
        return {
            "id": cart.id if cart else None,
            "products": [],
            "subtotal": 0.0,
            "tax": 0.0,
            "total": 0.0,
            "tax_rate": 0.16,
            "currency": "KES"
        }
    
    # Filter out any products that no longer exist
    valid_products = []
    for item in cart.products:
        try:
            product = await get_product(db, item.get("product_id"))
            if product and product.stock > 0:
                valid_products.append({
                    "product_id": item.get("product_id"),
                    "quantity": max(0, int(item.get("quantity", 0)))
                })
        except Exception:
            continue
    
    # Update cart with only valid products
    if len(valid_products) != len(cart.products):
        cart.products = valid_products
        await db.commit()
    
    if not valid_products:
        return {
            "id": cart.id,
            "products": [],
            "subtotal": 0.0,
            "tax": 0.0,
            "total": 0.0,
            "tax_rate": 0.16,
            "currency": "KES"
        }
    
    product_ids = [item["product_id"] for item in valid_products]
    products_result = await db.execute(
        select(models.Product).filter(models.Product.id.in_(product_ids))
    )
    products = {p.id: p for p in products_result.scalars().all()}
    
    cart_items = []
    subtotal = 0.0
    
    for item in valid_products:
        product = products.get(item["product_id"])
        if product:
            item_quantity = min(int(item.get("quantity", 0)), max(0, product.stock))
            if item_quantity <= 0:
                continue
            item_total = item_quantity * product.price
            subtotal += item_total
            
            cart_items.append({
                "product_id": product.id,
                "quantity": item_quantity,
                "product": schemas.ProductBase.from_orm(product),
                "item_total": float(item_total)
            })
    
    tax_rate = 0.16
    tax = subtotal * tax_rate
    total = subtotal + tax
    
    return {
        "id": cart.id,
        "products": cart_items,
        "subtotal": float(subtotal),
        "tax": float(tax),
        "total": float(total),
        "tax_rate": tax_rate,
        "currency": "KES"
    }

# ========== Wishlist CRUD Operations ==========

async def get_wishlist(db: AsyncSession, user_id: int) -> Optional[models.Wishlist]:
    """Retrieve a user's wishlist if it exists."""
    result = await db.execute(
        select(models.Wishlist)
        .filter(models.Wishlist.user_id == user_id)
    )
    return result.scalars().first()

async def create_wishlist(db: AsyncSession, user_id: int) -> models.Wishlist:
    """Create a new wishlist for a user."""
    db_wishlist = models.Wishlist(user_id=user_id, products=[])
    db.add(db_wishlist)
    await db.commit()
    await db.refresh(db_wishlist)
    return db_wishlist

async def get_or_create_wishlist(db: AsyncSession, user_id: int) -> models.Wishlist:
    """Get existing wishlist or create a new one if it doesn't exist."""
    return await get_wishlist(db, user_id) or await create_wishlist(db, user_id)

async def add_to_wishlist(
    db: AsyncSession,
    wishlist_item: schemas.WishlistAddRequest,
    user_id: int
) -> models.Wishlist:
    """
    Add a product to the wishlist.
    If the product is already in the wishlist, returns the wishlist as is.
    """
    wishlist = await get_or_create_wishlist(db, user_id)
    product = await get_product(db, wishlist_item.product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product is already in wishlist
    if wishlist.products and wishlist_item.product_id in wishlist.products:
        return wishlist
    
    # Add product to wishlist
    wishlist.products = (wishlist.products or []) + [wishlist_item.product_id]
    await db.commit()
    await db.refresh(wishlist)
    return wishlist

async def remove_wishlist_item(
    db: AsyncSession,
    user_id: int,
    product_id: int
) -> bool:
    """
    Remove a product from the wishlist.
    Returns True if item was removed, False if item was not found.
    """
    wishlist = await get_wishlist(db, user_id)
    if not wishlist or not wishlist.products:
        return False
    
    initial_count = len(wishlist.products)
    wishlist.products = [p_id for p_id in wishlist.products if p_id != product_id]
    
    if len(wishlist.products) < initial_count:
        await db.commit()
        return True
    return False

## Removed wishlist PUT helper as the endpoint is removed

async def get_wishlist_with_details(db: AsyncSession, user_id: int) -> dict:
    """
    Get wishlist with product details.
    Returns a dictionary with wishlist items and their details.
    """
    wishlist = await get_wishlist(db, user_id)
    if not wishlist or not wishlist.products:
        return {
            "id": wishlist.id if wishlist else None,
            "products": []
        }
    
    # Get all product details in a single query
    result = await db.execute(
        select(models.Product)
        .filter(models.Product.id.in_(wishlist.products))
    )
    products = result.scalars().all()
    
    return {
        "id": wishlist.id,
        "products": [schemas.ProductBase.from_orm(product) for product in products]
    }

async def clear_wishlist(db: AsyncSession, user_id: int) -> bool:
    """
    Clear all items from the wishlist.
    Returns True if wishlist was cleared, False if it was already empty.
    """
    wishlist = await get_wishlist(db, user_id)
    if not wishlist or not wishlist.products:
        return False
    
    wishlist.products = []
    await db.commit()
    return True

# Order CRUD
async def get_orders(db: AsyncSession) -> List[models.Order]:
    result = await db.execute(
        select(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.product),
            selectinload(models.Order.checkout)
        )
    )
    return result.scalars().all()

async def get_order(db: AsyncSession, order_id: int) -> Optional[models.Order]:
    result = await db.execute(
        select(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.product),
            selectinload(models.Order.checkout)
        )
        .filter(models.Order.id == order_id)
    )
    return result.scalars().first()

async def get_user_orders(db: AsyncSession, user_id: int) -> List[models.Order]:
    result = await db.execute(
        select(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.product),
            selectinload(models.Order.checkout)
        )
        .filter(models.Order.user_id == user_id)
    )
    return result.scalars().all()

async def create_order(db: AsyncSession, order: schemas.OrderCreate, user_id: int) -> models.Order:
    total = 0
    for item in order.items:
        product = await get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item.product_id}")
        total += item.quantity * item.price
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

async def update_order(db: AsyncSession, order_id: int, order: schemas.OrderBase) -> Optional[models.Order]:
    update_data = order.dict(exclude_unset=True)
    result = await db.execute(
        update(models.Order).where(models.Order.id == order_id).values(**update_data)
    )
    await db.commit()
    if result.rowcount > 0:
        return await get_order(db, order_id)
    return None

async def delete_order(db: AsyncSession, order_id: int) -> bool:
    result = await db.execute(delete(models.Order).where(models.Order.id == order_id))
    await db.commit()
    return result.rowcount > 0

async def get_order_summary(db: AsyncSession, order_id: int) -> Optional[Dict]:
    order = await get_order(db, order_id)
    if not order:
        return None
    subtotal = 0.0
    tax_rate = 0.16
    order_items = []
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
    tax = subtotal * tax_rate
    shipping_cost = 0.0
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

# OrderItem CRUD
async def get_order_items(db: AsyncSession) -> List[models.OrderItem]:
    result = await db.execute(
        select(models.OrderItem).options(selectinload(models.OrderItem.product))
    )
    return result.scalars().all()

async def get_user_order_items(db: AsyncSession, user_id: int) -> List[models.OrderItem]:
    result = await db.execute(
        select(models.OrderItem)
        .options(selectinload(models.OrderItem.product))
        .join(models.Order)
        .filter(models.Order.user_id == user_id)
    )
    return result.scalars().all()

async def get_order_item(db: AsyncSession, order_item_id: int, user_id: Optional[int] = None) -> Optional[models.OrderItem]:
    query = select(models.OrderItem).options(selectinload(models.OrderItem.product)).filter(models.OrderItem.id == order_item_id)
    if user_id:
        query = query.join(models.Order).filter(models.Order.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().first()

async def create_order_item(db: AsyncSession, order_item: schemas.OrderItemBase, order_id: int) -> models.OrderItem:
    db_order_item = models.OrderItem(**order_item.dict(), order_id=order_id)
    db.add(db_order_item)
    await db.commit()
    await db.refresh(db_order_item)
    return db_order_item

async def update_order_item(db: AsyncSession, order_item_id: int, order_item: schemas.OrderItemBase) -> Optional[models.OrderItem]:
    update_data = order_item.dict(exclude_unset=True)
    result = await db.execute(
        update(models.OrderItem).where(models.OrderItem.id == order_item_id).values(**update_data)
    )
    await db.commit()
    if result.rowcount > 0:
        return await get_order_item(db, order_item_id)
    return None

async def delete_order_item(db: AsyncSession, order_item_id: int, user_id: Optional[int] = None) -> bool:
    query = delete(models.OrderItem).where(models.OrderItem.id == order_item_id)
    if user_id:
        query = query.join(models.Order).where(models.Order.user_id == user_id)
    result = await db.execute(query)
    await db.commit()
    return result.rowcount > 0

# Checkout CRUD
async def get_checkouts(db: AsyncSession) -> List[models.Checkout]:
    result = await db.execute(select(models.Checkout).options(selectinload(models.Checkout.order)))
    return result.scalars().all()

async def get_checkout(db: AsyncSession, checkout_id: int) -> Optional[models.Checkout]:
    result = await db.execute(
        select(models.Checkout)
        .options(selectinload(models.Checkout.order))
        .filter(models.Checkout.id == checkout_id)
    )
    return result.scalars().first()

async def create_checkout(db: AsyncSession, checkout: schemas.CheckoutCreate, order_id: int) -> models.Checkout:
    db_checkout = models.Checkout(**checkout.dict(), order_id=order_id)
    db.add(db_checkout)
    await db.commit()
    await db.refresh(db_checkout)
    return db_checkout

async def update_checkout(db: AsyncSession, checkout_id: int, checkout: schemas.CheckoutBase) -> Optional[models.Checkout]:
    update_data = checkout.dict(exclude_unset=True)
    result = await db.execute(
        update(models.Checkout).where(models.Checkout.id == checkout_id).values(**update_data)
    )
    await db.commit()
    if result.rowcount > 0:
        return await get_checkout(db, checkout_id)
    return None

async def delete_checkout(db: AsyncSession, checkout_id: int) -> bool:
    result = await db.execute(delete(models.Checkout).where(models.Checkout.id == checkout_id))
    await db.commit()
    return result.rowcount > 0

# Payment CRUD
async def get_payments(db: AsyncSession) -> List[models.Payment]:
    result = await db.execute(select(models.Payment).options(selectinload(models.Payment.checkout)))
    return result.scalars().all()

async def get_payment(db: AsyncSession, payment_id: int) -> Optional[models.Payment]:
    result = await db.execute(
        select(models.Payment)
        .options(selectinload(models.Payment.checkout))
        .filter(models.Payment.id == payment_id)
    )
    return result.scalars().first()

async def create_payment(db: AsyncSession, payment: schemas.PaymentBase, checkout_id: int) -> models.Payment:
    db_payment = models.Payment(**payment.dict(), checkout_id=checkout_id)
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

async def update_payment(db: AsyncSession, payment_id: int, payment: schemas.PaymentBase) -> Optional[models.Payment]:
    update_data = payment.dict(exclude_unset=True)
    result = await db.execute(
        update(models.Payment).where(models.Payment.id == payment_id).values(**update_data)
    )
    await db.commit()
    if result.rowcount > 0:
        return await get_payment(db, payment_id)
    return None

async def delete_payment(db: AsyncSession, payment_id: int) -> bool:
    result = await db.execute(delete(models.Payment).where(models.Payment.id == payment_id))
    await db.commit()
    return result.rowcount > 0

# Bestseller and Featured Products
async def get_bestseller_products(db: AsyncSession, limit: int = 10) -> List[models.Product]:
    product_sales = (
        select(
            models.OrderItem.product_id,
            func.sum(models.OrderItem.quantity).label('total_sold')
        )
        .group_by(models.OrderItem.product_id)
        .subquery()
    )
    result = await db.execute(
        select(models.Product)
        .options(selectinload(models.Product.category))
        .outerjoin(product_sales, models.Product.id == product_sales.c.product_id)
        .order_by(desc(product_sales.c.total_sold))
        .limit(limit)
    )
    return result.scalars().all()

async def get_featured_products(db: AsyncSession, limit: int = 10) -> List[models.Product]:
    result = await db.execute(
        select(models.Product)
        .options(selectinload(models.Product.category))
        .where(models.Product.is_featured == True)
        .order_by(desc(models.Product.updated_at))
        .limit(limit)
    )
    return result.scalars().all()

# Analytics
async def get_analytics(db: AsyncSession) -> Dict:
    total_users = await db.execute(select(func.count()).select_from(models.User))
    total_users = total_users.scalar()

    orders_result = await db.execute(
        select(func.count(models.Order.id), func.sum(models.Order.total))
    )
    total_orders, total_revenue = orders_result.first()

    top_products_result = await db.execute(
        select(
            models.Product.id,
            models.Product.name,
            func.sum(models.OrderItem.quantity).label('total_sold'),
            func.sum(models.OrderItem.quantity * models.OrderItem.price).label('total_revenue')
        )
        .join(models.OrderItem, models.Product.id == models.OrderItem.product_id)
        .group_by(models.Product.id, models.Product.name)
        .order_by(desc('total_sold'))
        .limit(5)
    )
    top_products = [
        {
            "id": row.id,
            "name": row.name,
            "total_sold": row.total_sold,
            "total_revenue": float(row.total_revenue)
        } for row in top_products_result.all()
    ]

    category_result = await db.execute(
        select(
            models.Category.id,
            models.Category.name,
            func.count(models.Product.id).label('product_count'),
            func.sum(models.OrderItem.quantity).label('total_sold'),
            func.sum(models.OrderItem.quantity * models.OrderItem.price).label('total_revenue')
        )
        .outerjoin(models.Product, models.Category.id == models.Product.category_id)
        .outerjoin(models.OrderItem, models.Product.id == models.OrderItem.product_id)
        .group_by(models.Category.id, models.Category.name)
    )
    category_performance = [
        {
            "id": row.id,
            "name": row.name,
            "product_count": row.product_count,
            "total_sold": row.total_sold or 0,
            "total_revenue": float(row.total_revenue or 0)
        } for row in category_result.all()
    ]

    return {
        "total_users": total_users,
        "total_orders": total_orders or 0,
        "total_revenue": float(total_revenue or 0),
        "top_products": top_products,
        "category_performance": category_performance,
        "currency": "KES"
    }

# Settings
async def get_settings(db: AsyncSession) -> models.Settings:
    result = await db.execute(select(models.Settings).order_by(models.Settings.id.desc()))
    settings = result.scalars().first()
    if not settings:
        settings = models.Settings(data={})
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings

async def update_settings(db: AsyncSession, data: Dict) -> models.Settings:
    settings = await get_settings(db)
    settings.data = data
    await db.commit()
    await db.refresh(settings)
    return settings