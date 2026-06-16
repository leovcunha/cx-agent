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


debug_enabled = os.environ.get("BACKEND_DEBUG") == "1"
log_level = logging.DEBUG if debug_enabled else logging.INFO
logging.basicConfig(level=log_level)

httpx_level = logging.DEBUG if debug_enabled else logging.WARNING
logging.getLogger("httpx").setLevel(httpx_level)
logging.getLogger("httpcore").setLevel(httpx_level)

if not debug_enabled:
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


app = FastAPI(title="Refero app", openapi_url=None, docs_url=None, redoc_url=None)

app.include_router(messages_router)
app.include_router(chat_router)
