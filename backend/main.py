import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import init_db
from core.seed_data import seed
from routers import chat, employees, career, courses, dashboard, admin

app = FastAPI(title="T&D Platform API", version="0.1.6")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(employees.router)
app.include_router(career.router)
app.include_router(courses.router)
app.include_router(dashboard.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup():
    await init_db()
    if settings.seed_db:
        await seed()


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)
