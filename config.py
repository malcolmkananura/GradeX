from dotenv import load_dotenv
import os
import redis

load_dotenv()

class ApplicationConfig:
    OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True

    if "DATABASE_URL" in os.environ:
        SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]  # Use Heroku-provided database URL
    else:
        SQLALCHEMY_DATABASE_URI = r"sqlite:///./db.sqlite"  # Use SQLite3 for development
    
    # SESSION_TYPE = "redis"
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    # SESSION_REDIS = redis.from_url(os.environ.get("REDIS_URL"))  # Use Heroku-provided Redis URL
    # SESSION_TYPE = "sqlalchemy"  # Use SQLAlchemy for sessions
    # SESSION_SQLALCHEMY_TABLE = "session"  # Use the name of your session table
    REDIS_URI = os.environ.get("REDIS_URI")
    SESSION_TYPE = "redis"
    SESSION_REDIS = redis.from_url(REDIS_URI)
