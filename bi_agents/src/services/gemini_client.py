import json
import logging
import os
import time
from google import genai

logger = logging.getLogger(__name__)


def generate_json_with_fallback(prompt: str, preferred_model: str = "gemini-2.5-flash") -> dict:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found")

    client = genai.Client(api_key=api_key)

    models_to_try = [
        preferred_model,
        "gemini-2.5-flash-lite",
        "gemini-2.5-pro",
    ]

    last_error = None

    for model in models_to_try:
        for attempt in range(2):
            try:
                logger.info(f"Calling Gemini model={model}, attempt={attempt + 1}")

                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "temperature": 0.1,
                    },
                )

                return json.loads(response.text)

            except Exception as e:
                last_error = e
                logger.warning(
                    f"Gemini call failed on {model}, attempt {attempt + 1}: {e}"
                )
                time.sleep(1)

    raise RuntimeError(f"All Gemini calls failed. Last error: {last_error}")