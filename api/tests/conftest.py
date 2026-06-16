import asyncio
import pytest

_original_run = asyncio.run

@pytest.fixture(scope="session", autouse=True)
def shared_event_loop():
    # Create a session-scoped event loop to prevent 'Event loop is closed' RuntimeError
    # when multiple tests call asyncio.run() and close the loop while global gRPC
    # channels (used by ChatGoogleGenerativeAI) are still active.
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    def run_on_shared_loop(coro):
        return loop.run_until_complete(coro)
        
    asyncio.run = run_on_shared_loop
    yield loop
    
    asyncio.run = _original_run
    loop.close()
