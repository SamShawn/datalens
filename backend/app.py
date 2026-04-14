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

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return {'error': 'Unauthorized'}, 401
        try:
            payload = jwt.decode(token, os.getenv('JWT_SECRET', 'dev-secret'), algorithms=['HS256'])
            request.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return {'error': 'Token expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}, 401
        return f(*args, **kwargs)
    return decorated


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

@app.route('/api/portfolio', methods=['GET'])
@require_auth
def get_portfolio():
    holdings = _loop.run_until_complete(db.holding.find_many(where={'userId': request.user_id}))
    return {'holdings': [h.model_dump(mode='json') for h in holdings]}

@app.route('/api/portfolio', methods=['POST'])
@require_auth
def add_holding():
    data = request.json
    holding = _loop.run_until_complete(db.holding.create(
        data={
            'userId': request.user_id,
            'symbol': data['symbol'].upper(),
            'quantity': float(data['quantity']),
            'avgCost': float(data['avgCost'])
        }
    ))
    return {'holding': holding.model_dump(mode='json')}

@app.route('/api/portfolio/<holding_id>', methods=['PUT'])
@require_auth
def update_holding(holding_id):
    data = request.json
    holding = _loop.run_until_complete(db.holding.update(
        where={'id': holding_id, 'userId': request.user_id},
        data={
            'quantity': float(data.get('quantity')),
            'avgCost': float(data.get('avgCost'))
        }
    ))
    return {'holding': holding.model_dump(mode='json')}

@app.route('/api/portfolio/<holding_id>', methods=['DELETE'])
@require_auth
def delete_holding(holding_id):
    _loop.run_until_complete(db.holding.delete(where={'id': holding_id, 'userId': request.user_id}))
    return {'success': True}

@app.route('/api/watchlist', methods=['GET'])
@require_auth
def get_watchlist():
    items = _loop.run_until_complete(db.watchlist.find_many(where={'userId': request.user_id}))
    return {'watchlist': [w.symbol for w in items]}

@app.route('/api/watchlist', methods=['POST'])
@require_auth
def add_to_watchlist():
    data = request.json
    symbol = data['symbol'].upper()
    try:
        item = _loop.run_until_complete(db.watchlist.create(
            data={'userId': request.user_id, 'symbol': symbol}
        ))
        return {'watchlist': item.model_dump(mode='json')}, 201
    except Exception:
        return {'error': 'Symbol already in watchlist'}, 400

@app.route('/api/watchlist/<symbol>', methods=['DELETE'])
@require_auth
def remove_from_watchlist(symbol):
    _loop.run_until_complete(db.watchlist.delete_many(
        where={'userId': request.user_id, 'symbol': symbol.upper()}
    ))
    return {'success': True}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)
