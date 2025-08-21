from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend import schemas, crud, models, utils
from backend.database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import List
from sqlalchemy import select

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(utils.get_current_active_admin)]
)
limiter = Limiter(key_func=get_remote_address)

@router.get("/users", response_model=List[schemas.User], summary="List all users")
@limiter.limit("100/minute")
async def read_users(request: Request, db: AsyncSession = Depends(get_db)):
    """Get a list of all users (admin only)."""
    return await crud.get_users(db)

@router.get("/users/{user_id}", response_model=schemas.User, summary="Get user details")
@limiter.limit("100/minute")
async def read_user(request: Request, user_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific user (admin only)."""
    user = await crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED, summary="Create user")
@limiter.limit("10/minute")
async def create_user(request: Request, user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user (admin only)."""
    if await crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if user.email and await crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return await crud.create_user(db, user)

@router.put("/users/{user_id}", response_model=schemas.User, summary="Update user")
@limiter.limit("10/minute")
async def update_user(
    request: Request,
    user_id: int,
    user_update: schemas.AdminUserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a user's details, including role and password (admin only)."""
    db_user = await crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_update.username and user_update.username != db_user.username:
        if await crud.get_user_by_username(db, user_update.username):
            raise HTTPException(status_code=400, detail="Username already taken")
    if user_update.email and user_update.email != db_user.email:
        if await crud.get_user_by_email(db, user_update.email):
            raise HTTPException(status_code=400, detail="Email already in use")
    updated_user = await crud.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/users/{user_id}", response_model=schemas.Msg, summary="Delete user")
@limiter.limit("10/minute")
async def delete_user(request: Request, user_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a user (admin only)."""
    success = await crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}

@router.get("/categories", response_model=List[schemas.Category], summary="List all categories")
@limiter.limit("100/minute")
async def read_categories(request: Request, db: AsyncSession = Depends(get_db)):
    """Get a list of all categories (admin only)."""
    return await crud.get_categories(db)

@router.get("/categories/{category_id}", response_model=schemas.Category, summary="Get category details")
@limiter.limit("100/minute")
async def read_category(request: Request, category_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific category, including its products (admin only)."""
    category = await crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/categories", response_model=schemas.CategorySimple, status_code=status.HTTP_201_CREATED, summary="Create category")
@limiter.limit("10/minute")
async def create_category(request: Request, category: schemas.CategoryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new category (admin only)."""
    try:
        existing_category = await db.execute(select(models.Category).filter(models.Category.name == category.name))
        if existing_category.scalars().first():
            raise HTTPException(status_code=400, detail="Category name already exists")
        created = await crud.create_category(db, category)
        # Return a lightweight schema to avoid heavy relationship serialization
        return schemas.CategorySimple(
            id=created.id,
            name=created.name,
            description=created.description,
            image_url=created.image_url,
        )
    except HTTPException:
        raise
    except Exception as e:
        # Log and surface a clean error while category may have been created
        raise HTTPException(status_code=500, detail="Failed to create category")

@router.put("/categories/{category_id}", response_model=schemas.Category, summary="Update category")
@limiter.limit("10/minute")
async def update_category(
    request: Request,
    category_id: int,
    category: schemas.CategoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a category (admin only)."""
    if category.name:
        existing_category = await db.execute(
            select(models.Category).filter(models.Category.name == category.name, models.Category.id != category_id)
        )
        if existing_category.scalars().first():
            raise HTTPException(status_code=400, detail="Category name already exists")
    db_category = await crud.update_category(db, category_id, category)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/categories/{category_id}", response_model=schemas.Msg, summary="Delete category")
@limiter.limit("10/minute")
async def delete_category(request: Request, category_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a category (admin only)."""
    success = await crud.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted"}

@router.get("/products", response_model=List[schemas.Product], summary="List all products")
@limiter.limit("100/minute")
async def read_products(request: Request, db: AsyncSession = Depends(get_db)):
    """Get a list of all products (admin only)."""
    return await crud.get_products(db)

@router.get("/products/{product_id}", response_model=schemas.Product, summary="Get product details")
@limiter.limit("100/minute")
async def read_product(request: Request, product_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific product (admin only)."""
    product = await crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED, summary="Create product")
@limiter.limit("10/minute")
async def create_product(request: Request, product: schemas.ProductCreate, db: AsyncSession = Depends(get_db)):
    """Create a new product (admin only)."""
    category = await crud.get_category(db, product.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    return await crud.create_product(db, product)

@router.put("/products/{product_id}", response_model=schemas.Product, summary="Update product")
@limiter.limit("10/minute")
async def update_product(
    request: Request,
    product_id: int,
    product: schemas.ProductBase,
    db: AsyncSession = Depends(get_db)
):
    """Update a product (admin only)."""
    category = await crud.get_category(db, product.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    db_product = await crud.update_product(db, product_id, product)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/products/{product_id}", response_model=schemas.Msg, summary="Delete product")
@limiter.limit("10/minute")
async def delete_product(request: Request, product_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a product (admin only)."""
    success = await crud.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted"}

@router.get("/orders", response_model=List[schemas.Order], summary="List all orders")
@limiter.limit("100/minute")
async def read_orders(request: Request, db: AsyncSession = Depends(get_db)):
    """Get a list of all orders (admin only)."""
    return await crud.get_orders(db)

@router.get("/orders/{order_id}", response_model=schemas.Order, summary="Get order details")
@limiter.limit("100/minute")
async def read_order(request: Request, order_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific order (admin only)."""
    order = await crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}", response_model=schemas.Order, summary="Update order")
@limiter.limit("10/minute")
async def update_order(
    request: Request,
    order_id: int,
    order: schemas.OrderBase,
    db: AsyncSession = Depends(get_db)
):
    """Update an order's status or total (admin only)."""
    db_order = await crud.update_order(db, order_id, order)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@router.delete("/orders/{order_id}", response_model=schemas.Msg, summary="Delete order")
@limiter.limit("10/minute")
async def delete_order(request: Request, order_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an order (admin only)."""
    success = await crud.delete_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"detail": "Order deleted"}

@router.get("/orders/{order_id}/summary", response_model=schemas.OrderSummaryResponse, summary="Get order summary")
@limiter.limit("100/minute")
async def get_order_summary(request: Request, order_id: int, db: AsyncSession = Depends(get_db)):
    """Get detailed summary of a specific order (admin only)."""
    order_summary = await crud.get_order_summary(db, order_id)
    if not order_summary:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_summary

@router.get("/analytics", response_model=schemas.AnalyticsResponse, summary="Get store analytics")
@limiter.limit("50/minute")
async def get_analytics(request: Request, db: AsyncSession = Depends(get_db)):
    """Get analytics data for the store (admin only)."""
    analytics = await crud.get_analytics(db)
    return analytics

@router.get("/settings", response_model=schemas.SettingsResponse, summary="Get admin settings")
async def get_settings(request: Request, db: AsyncSession = Depends(get_db)):
    settings = await crud.get_settings(db)
    return settings

@router.put("/settings", response_model=schemas.SettingsResponse, summary="Update admin settings")
async def put_settings(request: Request, payload: schemas.SettingsSchema, db: AsyncSession = Depends(get_db)):
    settings = await crud.update_settings(db, payload.data)
    return settings