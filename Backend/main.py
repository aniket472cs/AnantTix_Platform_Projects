from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, execute
import models
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ANANTIX Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(execute.router, prefix="/api", tags=["Compiler"])

@app.get("/")
def read_root():
    return {"status": "ANANTIX Backend is Running Successfully!"}