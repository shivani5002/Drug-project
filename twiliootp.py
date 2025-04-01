import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.rest import Client
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime  # Import datetime module

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
mongo_client = MongoClient(MONGO_URI)
db = mongo_client['your_database_name']  # Replace with your database name
users_collection = db['users']  # Collection to store user data

# Initialize Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Temporary storage for OTPs
otp_storage = {}

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    phone = data.get('phone')

    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    # Generate OTP
    otp = str(random.randint(100000, 999999))  # Now this will work
    otp_storage[phone] = otp

    # Send OTP via Twilio
    try:
        message = client.messages.create(
            body=f'Your OTP is: {otp}',
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        return jsonify({"message": "OTP sent successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    phone = data.get('phone')
    otp = data.get('otp')

    if not phone or not otp:
        return jsonify({"error": "Phone number and OTP are required"}), 400

    # Verify OTP
    if otp_storage.get(phone) == otp:
        del otp_storage[phone]  # Clear OTP after verification
        return jsonify({"message": "OTP verified successfully!"}), 200
    else:
        return jsonify({"error": "Invalid OTP"}), 400

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not email or not password or not phone:
        return jsonify({"error": "Email, password, and phone are required"}), 400

    try:
        # Step 1: Store user data in MongoDB
        user_data = {
            "email": email,
            "phone": phone,
            "password": password,  # Note: In a real app, hash the password before storing
            "createdAt": datetime.utcnow(),
        }
        users_collection.insert_one(user_data)

        # Step 2: Send success response
        return jsonify({"message": "User created successfully!"}), 201
    except Exception as e:
        print(f"Error in /api/signup: {e}")  # Log the error
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)  # Run on port 5001