import os
from dotenv import load_dotenv
import base64
import httpx
from datetime import datetime
from fastapi import HTTPException

load_dotenv()

MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_PASS_KEY = os.getenv("MPESA_PASS_KEY")
MPESA_SHORT_CODE = os.getenv("MPESA_SHORT_CODE")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")

async def generate_access_token():
    auth_str = f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}"
    encoded_auth = base64.b64encode(auth_str.encode()).decode()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            headers={"Authorization": f"Basic {encoded_auth}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to generate M-Pesa access token")
        return response.json().get("access_token")

def generate_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S")

def generate_password(timestamp: str):
    data_to_encode = f"{MPESA_SHORT_CODE}{MPESA_PASS_KEY}{timestamp}"
    return base64.b64encode(data_to_encode.encode()).decode()

async def initiate_stk_push(phone: str, amount: float, order_id: int):
    access_token = await generate_access_token()
    timestamp = generate_timestamp()
    password = generate_password(timestamp)
    
    payload = {
        "BusinessShortCode": MPESA_SHORT_CODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),  # M-Pesa expects integer amounts
        "PartyA": phone,  # Customer phone number
        "PartyB": MPESA_SHORT_CODE,
        "PhoneNumber": phone,
        "CallBackURL": f"{MPESA_CALLBACK_URL}/{order_id}",
        "AccountReference": f"Order_{order_id}",
        "TransactionDesc": "Jewelry Shop Payment"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to initiate M-Pesa STK Push")
        return response.json()