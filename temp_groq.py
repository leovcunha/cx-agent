import os, httpx
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GROQ_API_KEY')
if not api_key:
    print('No GROQ_API_KEY found in environment')
else:
    r = httpx.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {api_key}'})
    if r.status_code == 200:
        models = r.json().get('data', [])
        for m in models:
            print(m.get('id'))
    else:
        print('Error:', r.status_code, r.text)
