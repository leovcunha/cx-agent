import logging
import os

# Workaround for PermissionError in urllib3 with SSLKEYLOGFILE
if "SSLKEYLOGFILE" in os.environ:
    del os.environ["SSLKEYLOGFILE"]

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI

from api.routes.messages import router as messages_router
from api.routes.chat import router as chat_router
from api.routes.auth import router as auth_router
from api.routes.documents import router as documents_router


debug_enabled = os.environ.get("BACKEND_DEBUG") == "1"
log_level = logging.DEBUG if debug_enabled else logging.INFO
logging.basicConfig(
    level=log_level,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

httpx_level = logging.DEBUG if debug_enabled else logging.WARNING
logging.getLogger("httpx").setLevel(httpx_level)
logging.getLogger("httpcore").setLevel(httpx_level)

if not debug_enabled:
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load the embedding model on startup so the first chat message is fast
    try:
        logging.info("Pre-loading local PyTorch embedding model (this may take 10-20s)...")
        from api.agents.nodes.retrieval import get_embedding_model
        get_embedding_model()
        logging.info("Embedding model pre-loaded successfully!")
    except Exception as e:
        logging.error(f"Failed to pre-load model: {e}")
    yield

app = FastAPI(title="Customer Support Agent Platform", lifespan=lifespan, openapi_url=None, docs_url=None, redoc_url=None)

app.include_router(messages_router)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(documents_router)
