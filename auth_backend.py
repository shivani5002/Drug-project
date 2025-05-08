from flask import Blueprint, request, jsonify, current_app
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import random
import string
from twilio.rest import Client
import os
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
load_dotenv()

auth_bp = Blueprint('auth', __name__)

# Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'your-secret-key')
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
MONGO_URI = os.getenv('MONGO_URI')
SMTP_SERVER = os.getenv('SMTP_SERVER')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
APP_BASE_URL = os.getenv('APP_BASE_URL', 'http://localhost:5173')

required_vars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER']
for var in required_vars:
    if not os.getenv(var):
        raise ValueError(f"Missing environment variable: {var}")

# Initialize Twilio client
twilio_client = Client(
    os.getenv('TWILIO_ACCOUNT_SID'),
    os.getenv('TWILIO_AUTH_TOKEN')
)

# Temporary storage for OTPs and email tokens
otp_storage = {}
email_tokens = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
            current_user = data['user']
            # Verify user is active in DB
            user = current_app.mongo.db.users.find_one({'_id': ObjectId(current_user['id'])})
            if not user or not user.get('email_verified'):
                return jsonify({'message': 'User not verified!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def generate_email_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

def send_verification_email(email, token):
    verification_url = f"{APP_BASE_URL}/verify-email?token={token}"
    message = MIMEText(f"""
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email:</p>
    <a href="{verification_url}">Verify Email</a>
    """, 'html')
    
    message['Subject'] = 'Verify Your Email'
    message['From'] = SMTP_USERNAME
    message['To'] = email
    
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(message)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Input validation (keep your existing checks)
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        required_fields = ['email', 'password', 'name', 'mobile']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        email = data['email'].lower().strip()
        mobile = data['mobile'].strip()
        
        if not mobile.startswith('+') or not mobile[1:].isdigit():
            return jsonify({'error': 'Invalid mobile format. Use +CountryCodeNumber'}), 400

        # Check for existing user (without transaction)
        if current_app.mongo.db.users.find_one({'$or': [{'email': email}, {'mobile': mobile}]}):
            return jsonify({'error': 'User already exists'}), 400

        # Create new user
        hashed_password = generate_password_hash(data['password'])
        user = {
            'email': email,
            'password': hashed_password,
            'name': data['name'].strip(),
            'mobile': mobile,
            'email_verified': False,
            'mobile_verified': False,
            'created_at': datetime.utcnow(),
            'otp_attempts': 0
        }
        
        user_id = current_app.mongo.db.users.insert_one(user).inserted_id

        # Generate and store OTP
        otp = generate_otp()
        otp_storage[mobile] = {
            'otp': otp,
            'expires_at': datetime.utcnow() + timedelta(minutes=5),
            'user_id': str(user_id),
            'attempts': 0
        }

        # Send OTP
        try:
            message = twilio_client.messages.create(
                body=f'Your verification code: {otp}',
                from_=os.getenv('TWILIO_PHONE_NUMBER'),
                to=mobile
            )
            current_app.logger.info(f"OTP sent to {mobile}")
        except Exception as e:
            current_app.logger.error(f"Twilio error: {str(e)}")
            return jsonify({'error': 'Failed to send OTP'}), 500
            
        return jsonify({
            'success': True,
            'user_id': str(user_id),
            'mobile': mobile
        }), 200

    except Exception as e:
        current_app.logger.error(f"Signup error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/verify-mobile', methods=['POST'])
def verify_mobile():
    try:
        data = request.get_json()
        if not data or not data.get('mobile') or not data.get('otp'):
            return jsonify({'error': 'Mobile and OTP required'}), 400

        mobile = data['mobile'].strip()
        otp = data['otp'].strip()
        
        # Debug: Log current OTP storage
        current_app.logger.info(f"OTP storage state: {otp_storage}")
        
        stored_otp_data = otp_storage.get(mobile)
        if not stored_otp_data:
            return jsonify({'error': 'OTP expired or invalid'}), 401

        # Verify OTP match
        if stored_otp_data['otp'] != otp:
            return jsonify({'error': 'Invalid OTP'}), 401

        # Check expiration
        if datetime.utcnow() > stored_otp_data['expires_at']:
            return jsonify({'error': 'OTP expired'}), 401

        # Update mobile verification status
        user_id = ObjectId(stored_otp_data['user_id'])
        update_result = current_app.mongo.db.users.update_one(
            {'_id': user_id},
            {'$set': {'mobile_verified': True}}
        )
        
        if update_result.modified_count == 0:
            return jsonify({'error': 'User not found'}), 404

        # Get user email for verification
        user = current_app.mongo.db.users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User data not found'}), 404

        # Generate email verification token
        email_token = generate_email_token()
        email_tokens[email_token] = {
            'user_id': str(user_id),
            'expires_at': datetime.utcnow() + timedelta(hours=24)
        }

        # Send verification email
        try:
            send_verification_email(
                email=user['email'],
                token=email_token
            )
            current_app.logger.info(f"Verification email sent to {user['email']}")
        except Exception as e:
            current_app.logger.error(f"Email sending failed: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Mobile verified but email failed to send',
                'debug': str(e)
            }), 500

        # Cleanup OTP storage
        del otp_storage[mobile]
        
        return jsonify({
            'success': True,
            'message': 'Mobile verified. Check your email for verification link.',
            'email': user['email']  # For frontend display
        })

    except Exception as e:
        current_app.logger.error(f"Verification error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Verification failed'}), 500
    
@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    try:
        data = request.get_json()
        if not data or not data.get('mobile') or not data.get('user_id'):
            return jsonify({'error': 'Mobile and user ID required'}), 400

        mobile = data['mobile'].strip()
        otp = generate_otp()
        
        otp_storage[mobile] = {
            'otp': otp,
            'expires_at': datetime.utcnow() + timedelta(minutes=5),
            'user_id': data['user_id']
        }

        twilio_client.messages.create(
            body=f'Your new verification code: {otp}',
            from_=os.getenv('TWILIO_PHONE_NUMBER'),
            to=mobile
        )
        
        return jsonify({'success': True, 'message': 'OTP resent'})

    except Exception as e:
        return jsonify({'error': 'Failed to resend OTP', 'details': str(e)}), 500

@auth_bp.route('/verify-email', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
        
    stored_token = email_tokens.get(token)
    
    if not stored_token:
        return jsonify({'error': 'Invalid token'}), 401
        
    if datetime.utcnow() > stored_token['expires_at']:
        return jsonify({'error': 'Token expired'}), 401
        
    # Update user in database
    user_id = ObjectId(stored_token['user_id'])
    current_app.mongo.db.users.update_one(
        {'_id': user_id},
        {'$set': {'email_verified': True}}
    )
    
    # Clean up token
    del email_tokens[token]
    
    return jsonify({'message': 'Email verified successfully'})

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
        
    email = data['email'].lower().strip()
    password = data['password']
    
    user = current_app.mongo.db.users.find_one({'email': email})
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    # Generate JWT token
    token = jwt.encode({
        'user': {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user['name']
        },
        'exp': datetime.utcnow() + timedelta(days=30)
    }, JWT_SECRET_KEY)
    
    # Explicitly include verification statuses in response
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user['name'],
            'mobile': user['mobile'],
            'email_verified': user.get('email_verified', False),
            'mobile_verified': user.get('mobile_verified', False)
        }
    })
@auth_bp.route('/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({
        'message': f'Hello {current_user["name"]}! This is a protected route.',
        'user': current_user
    })