import os
from flask import Flask
from .model import db   # FIXED IMPORT

def create_app():
    app = Flask(__name__, template_folder='../frontend', static_folder='../frontend')

    # Absolute DB path inside backend/database/
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))     # backend/
    DB_PATH = os.path.join(BASE_DIR, "database", "hospital.db")

    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_PATH}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'secret123'

    db.init_app(app)

    # Ensure folder exists
    os.makedirs(os.path.join(BASE_DIR, "database"), exist_ok=True)

    # Create tables
    with app.app_context():
        print("Creating database at:", DB_PATH)
        db.create_all()

    return app
