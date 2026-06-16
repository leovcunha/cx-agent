from api.index import app
for route in app.routes:
    print(f"{route.path} [{route.methods}]")
