from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from backend import schemas, crud, utils
from backend.database import get_db
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(utils.get_current_user)])
limiter = Limiter(key_func=get_remote_address)

@router.get("/categories/", response_model=list[schemas.Category])
@limiter.limit("100/minute")
async def read_categories(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_categories(db)

@router.post("/categories/", response_model=schemas.Category)
@limiter.limit("10/minute")
async def create_category(request: Request, category: schemas.CategoryBase, db: AsyncSession = Depends(get_db)):
    return await crud.create_category(db, category)

@router.put("/categories/{category_id}", response_model=schemas.Category)
@limiter.limit("10/minute")
async def update_category(request: Request, category_id: int, category: schemas.CategoryBase, db: AsyncSession = Depends(get_db)):
    db_category = await crud.update_category(db, category_id, category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/categories/{category_id}")
@limiter.limit("10/minute")
async def delete_category(request: Request, category_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted"}

@router.get("/products/", response_model=list[schemas.Product])
@limiter.limit("100/minute")
async def read_products(request: Request, db: AsyncSession = Depends(get_db)):
    return await crud.get_products(db)

@router.get("/products/{product_id}", response_model=schemas.Product)
@limiter.limit("100/minute")
async def read_product(request: Request, product_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_product(db, product_id)

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

# Users
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
async def update_user(request: Request, user_id: int, user: schemas.UserBase, db: AsyncSession = Depends(get_db)):
    db_user = await crud.update_user(db, user_id, user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/users/{user_id}")
@limiter.limit("10/minute")
async def delete_user(request: Request, user_id: int, db: AsyncSession = Depends(get_db)):
    success = await crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}

@router.post("/users/")
@limiter.limit("10/minute")
async def create_user(request: Request, user: schemas.UserBase, db: AsyncSession = Depends(get_db)):
    return await crud.create_user(db, user)



