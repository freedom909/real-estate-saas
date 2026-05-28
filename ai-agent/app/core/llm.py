import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_model():
    """
    Initializes and returns the Gemini GenAI client.
    Note: The 'google-genai' package uses Client initialization instead of configure().
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in the environment variables.")
    
    # Initialize the client for the new google-genai SDK
    client = genai.Client(api_key=GEMINI_API_KEY)
    return client
