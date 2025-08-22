from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.database import engine, Base
from backend.routers import auth, admin, user, shop

# Async function to create database tables
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Initialize FastAPI app with enhanced OpenAPI configuration
app = FastAPI(
    title="Pisafa Gift Shop API",
    description="API for an e-commerce gift shop with user authentication, product management, cart, wishlist, and M-Pesa payments.",
    version="1.0.0",
    openapi_tags=[
        {"name": "auth", "description": "User authentication and account management"},
        {"name": "user", "description": "User profile, orders, cart, and wishlist operations"},
        {"name": "shop", "description": "Public shop operations for products and categories"},
        {"name": "admin", "description": "Admin operations for managing users, products, and orders"}
    ]
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://pisafa-giftshop.vercel.app", "https://pisafa-api.onrender.com"],  # Adjust for production (e.g., ["https://your-frontend.com"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include routers with clear prefixes
app.include_router(auth.router, tags=["auth"])
app.include_router(user.router, tags=["user"])
app.include_router(shop.router, tags=["shop"])
app.include_router(admin.router, tags=["admin"])

# Run database initialization on startup
@app.on_event("startup")
async def startup_event():
    await init_db()