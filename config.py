from dotenv import load_dotenv
import os
import redis

load_dotenv()

class ApplicationConfig:
    OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True

    # if "DATABASE_URL" in os.environ:
    #     SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]  # Use Heroku-provided database URL
    # else:
    
    SQLALCHEMY_DATABASE_URI = r"sqlite:///./db.sqlite"  # Use SQLite3 for development
    
    SESSION_TYPE = "filesystem"
    # SESSION_PERMANENT = False
    # SESSION_USE_SIGNER = True
    

    # r = redis.Redis(
    # host='redis-11821.c15.us-east-1-4.ec2.cloud.redislabs.com',
    # port=11821,
    # password='YSieJe08e6UlQLmE8X8k9C0J9xgIDHWR')