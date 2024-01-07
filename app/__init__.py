from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

import config
from config import BASE_DIR

# app = Flask(__name__, static_folder='/app/static')
app = Flask(__name__)
app.config.from_object(config.Config)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

app.debug = True

ma = Marshmallow(app)

from .models import *
from .routes import *
