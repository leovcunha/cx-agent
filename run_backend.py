import argparse
import os
import sys

import uvicorn

# Ensure the current directory is in the python path
sys.path.append(os.getcwd())

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Refero backend.")
    parser.add_argument("--debug", action="store_true", help="Enable debug logging and access logs.")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind the server to.")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind the server to.")
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    if args.debug:
        os.environ["BACKEND_DEBUG"] = "1"

    log_level = "debug" if args.debug else "info"
    uvicorn.run(
        "api.index:app",
        host=args.host,
        port=args.port,
        reload=True,
        reload_dirs=["api"],
        log_level=log_level,
        access_log=args.debug,
    )
