from fastapi import FastAPI

from app.api.experiments import router as experiments_router

app = FastAPI(
    title="ModelLabs API",
    version="1.0.0"
)

app.include_router(experiments_router)


@app.get("/")
def root():
    return {
        "name": "ModelLabs",
        "status": "running"
    }