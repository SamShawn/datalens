from flask import Flask, request
from flask_cors import CORS
import os
import asyncio
import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from prisma import Prisma

db = Prisma()

app = Flask(__name__)
CORS(app)

# Create a persistent event loop
_loop = asyncio.new_event_loop()
asyncio.set_event_loop(_loop)

# Connect to Prisma at startup
_loop.run_until_complete(db.connect())

@app.route('/health')
def health():
    return {'status': 'ok'}

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return {'error': 'Email and password required'}, 400

    existing = _loop.run_until_complete(db.user.find_unique(where={'email': email}))
    if existing:
        return {'error': 'Email already registered'}, 400

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    user = _loop.run_until_complete(db.user.create(
        data={
            'email': email,
            'passwordHash': password_hash,
            'name': name
        }
    ))

    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        },
        os.getenv('JWT_SECRET', 'dev-secret'),
        algorithm='HS256'
    )

    return {
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        },
        'token': token
    }

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = _loop.run_until_complete(db.user.find_unique(where={'email': email}))
    if not user or not user.passwordHash:
        return {'error': 'Invalid credentials'}, 401

    if not bcrypt.checkpw(password.encode(), user.passwordHash.encode()):
        return {'error': 'Invalid credentials'}, 401

    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        },
        os.getenv('JWT_SECRET', 'dev-secret'),
        algorithm='HS256'
    )

    return {
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        },
        'token': token
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)
