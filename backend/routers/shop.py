from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend import schemas, crud
from backend.database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import List

router = APIRouter(prefix="/shop", tags=["shop"])
limiter = Limiter(key_func=get_remote_address)

@router.get("/categories", response_model=List[schemas.Category], summary="List all categories")
@limiter.limit("100/minute")
async def read_categories(request: Request, db: AsyncSession = Depends(get_db)):
    """Get a list of all product categories."""
    return await crud.get_categories(db)

@router.get("/categories/{category_id}", response_model=schemas.Category, summary="Get category details")
@limiter.limit("100/minute")
async def read_category(request: Request, category_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific category, including its products."""
    category = await crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("/products", response_model=List[schemas.Product], summary="List all products")
@limiter.limit("100/minute")
async def read_products(request: Request, db: AsyncSession = Depends(get_db)):
    """Get a list of all products."""
    return await crud.get_products(db)

@router.get("/products/{product_id}", response_model=schemas.Product, summary="Get product details")
@limiter.limit("100/minute")
async def read_product(request: Request, product_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific product."""
    product = await crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/bestsellers", response_model=List[schemas.Product], summary="Get bestseller products")
@limiter.limit("100/minute")
async def get_bestsellers(
    request: Request,
    limit: int = Query(10, gt=0, le=100, description="Number of products to return"),
    db: AsyncSession = Depends(get_db)
):
    """Get bestseller products based on order history."""
    return await crud.get_bestseller_products(db, limit=limit)

@router.get("/featured", response_model=List[schemas.Product], summary="Get featured products")
@limiter.limit("100/minute")
async def get_featured_products(
    request: Request,
    limit: int = Query(10, gt=0, le=100, description="Number of products to return"),
    db: AsyncSession = Depends(get_db)
):
    """Get featured products, ordered by most recently updated."""
    return await crud.get_featured_products(db, limit=limit)