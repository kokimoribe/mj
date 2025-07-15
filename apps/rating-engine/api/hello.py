from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World", "status": "healthy"}


@app.post("/")
async def materialize():
    return {"message": "Materialization endpoint", "status": "not implemented"}


# Vercel handler
handler = app
