from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()  # Load all the environment variables

app = Flask(__name__)
CORS(app)

# Configure the Google Generative AI client
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Function to load Gemini Pro model and get responses
model = genai.GenerativeModel("gemini-pro")
chat = model.start_chat(history=[])

def get_gemini_response(question):
    response = chat.send_message(question, stream=True)
    return response

messages = []

@app.route("/message", methods=["POST"])
def message():
    user_prompt = request.json.get("prompt", "")
    messages.append({"role": "user", "content": user_prompt})

    try:
        response = get_gemini_response(user_prompt)
        assistant_message = ''.join([chunk.text for chunk in response])
        messages.append({"role": "assistant", "content": assistant_message})
        return jsonify({"assistant_message": assistant_message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
