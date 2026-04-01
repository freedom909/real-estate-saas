import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NODE_API = os.getenv("NODE_API", "http://localhost:3000/api")