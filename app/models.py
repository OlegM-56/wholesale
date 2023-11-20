from flask_marshmallow.fields import fields
from datetime import datetime

from sqlalchemy.orm import relationship

from . import db, ma

# ===============================================================================
# MENU
# ===============================================================================
import os, json, codecs


class Menu:
    class query:
        @staticmethod
        def all():
            file_json = 'menu.json'
            menu = {}
            if os.path.isfile(file_json):
                with codecs.open(file_json, 'r', 'utf-8') as file_data:
                    menu = json.load(file_data)
            return menu


# ===============================================================================


class Customer(db.Model):
    """ --- Клієнти ---"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_name = db.Column(db.String(70), nullable=False)
    customer_address = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True, default='')

    def __repr__(self):
        return f"Customer {self.id}, {self.customer_name}"


class CustomerSchema(ma.Schema):
    """ Customer_schema """
    class Meta:
        fields = ('id', 'customer_name', 'customer_address', 'phone')

    phone = fields.Function(
        # вывод данных
        serialize=lambda obj: obj.phone if obj and obj.phone else '',
        # ввод данных
        deserialize=lambda value: value if value else ''
    )


# Schema's initializing
customer_schema = CustomerSchema()
customers_schema = CustomerSchema(many=True)


class Unit(db.Model):
    """ --- Одиниці виміру --- """
    unit_code = db.Column(db.String(10), primary_key=True)
    unit_name = db.Column(db.String(15), nullable=False)

    def __repr__(self):
        return f"{self.unit_code} - {self.unit_name}"


class UnitSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('unit_code', 'unit_name')


# Schema's initializing
unit_schema = UnitSchema()
units_schema = UnitSchema(many=True)


class Item(db.Model):
    """ ---  Товари та послуги ---"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_name = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(10), db.ForeignKey('unit.unit_code'), nullable=False)
    service = db.Column(db.Boolean, nullable=False, default=False)
    item_description = db.Column(db.String(150), nullable=True)

    def __repr__(self):
        return f"Item {self.id}, {self.item_name}"


class ItemSchema(ma.Schema):
    """ Item_schema """
    class Meta:
        fields = ('id', 'item_name', 'unit', 'service', 'item_description')

    service = fields.Function(
        serialize=lambda obj: 'Так' if obj is not None and obj.service else '',
        deserialize=lambda value: value == 'Так')

    item_description = fields.Function(
        # вывод данных
        serialize=lambda obj: obj.item_description if obj is not None else '',
        # ввод данных
        deserialize=lambda value: value if value else ''
    )
# Schema's initializing
item_schema = ItemSchema()
items_schema = ItemSchema(many=True)


class Pinvoice(db.Model):
    """ --- Прибуткова накладна ---"""
    num_doc = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id', name='fk_pinvoice_customer'), nullable=False)
    customer = relationship('Customer', backref='pinvoice_customer')
    doc_date = db.Column(db.Date, nullable=False)
    doc_status = db.Column(db.Integer, nullable=False, default=0)
    doc_date_approve = db.Column(db.Date, nullable=True)
    custom_numdoc = db.Column(db.String(30), nullable=True, default='')

    def __repr__(self):
        return f"Pinvoice {self.num_doc} (self.custom_numdoc), {self.doc_date}"


class PinvoiceSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('num_doc', 'customer_id', 'customer_name', 'doc_date', 'doc_status', 'doc_date_approve', 'custom_numdoc')

    doc_date = fields.Function(
        # дата в строку
        serialize=lambda obj: obj.doc_date.strftime('%Y-%m-%d') if obj and obj.doc_date else '',
        # строка в дату
        deserialize=lambda value: datetime.strptime(value, '%Y-%m-%d') if value else None
    )
    doc_date_approve = fields.Function(
        # дата в строку
        serialize=lambda obj: obj.doc_date_approve.strftime('%Y-%m-%d') if obj and obj.doc_date_approve else '',
        # строка в дату
        deserialize=lambda value: datetime.strptime(value, '%Y-%m-%d') if value else None
    )
    customer_name = fields.Function(
        serialize=lambda obj: obj.customer.customer_name if obj is not None and obj.customer else '',
        deserialize=lambda value: None
    )


# Schema's initializing
pinvoice_schema = PinvoiceSchema()
pinvoices_schema = PinvoiceSchema(many=True)


class PinvoiceRow(db.Model):
    """ --- Прибуткова накладна, рядки ---"""
    __tablename__ = 'pinvoice_row'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pinvoice = db.Column(db.Integer, db.ForeignKey('pinvoice.num_doc'), nullable=False)
    npp = db.Column(db.Integer, nullable=False)
    item = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0)
    price = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"Pinvoice_row Doc N {self.pinvoice}, npp {self.npp}"


class PinvoiceRowSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'pinvoice', 'npp', 'item', 'quantity', 'price')


# Schema's initializing
pinvoice_row_schema = PinvoiceRowSchema()
pinvoice_rows_schema = PinvoiceRowSchema(many=True)


class Einvoice(db.Model):
    """ --- Видаткова накладна ---"""
    num_doc = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    doc_date = db.Column(db.Date, nullable=False)
    doc_status = db.Column(db.Integer, nullable=False, default=0)
    doc_date_approve = db.Column(db.Date)

    def __repr__(self):
        return f"Einvoice {self.num_doc}, {self.doc_date}"


class EinvoiceSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('num_doc', 'customer', 'doc_date', 'doc_status', 'doc_date_approve')


# Schema's initializing
einvoice_schema = EinvoiceSchema()
einvoices_schema = EinvoiceSchema(many=True)


class EinvoiceRow(db.Model):
    """ --- Видаткова накладна, рядки ---"""
    __tablename__ = 'einvoice_row'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    einvoice = db.Column(db.Integer, db.ForeignKey('einvoice.num_doc'), nullable=False)
    npp = db.Column(db.Integer, nullable=False)
    item = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0)
    price = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"Einvoice_row Doc N {self.einvoice}, npp {self.npp}"


class EinvoiceRowSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'einvoice', 'npp', 'item', 'quantity', 'price')


# Schema's initializing
einvoice_row_schema = EinvoiceRowSchema()
einvoice_rows_schema = EinvoiceRowSchema(many=True)


class WarehouseOrderRow(db.Model):
    """ --- рядки складського ордеру (списання залишків по партіях) ---"""
    __tablename__ = 'warehouse_order_row'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    einvoice_row = db.Column(db.Integer, db.ForeignKey('einvoice_row.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0)
    cost = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"Warehouse_order_row id {self.id}, einvoice_row {self.einvoice_row}"


class WarehouseOrderRowSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'einvoice', 'npp', 'item', 'quantity', 'price')


# Schema's initializing
warehouse_order_row_schema = WarehouseOrderRowSchema()
warehouse_order_rows_schema = WarehouseOrderRowSchema(many=True)


class BalanceItem(db.Model):
    """ --- Залишки товарів по партіях. Партія =  код товару+дата приходу +ціна приходу ---"""
    __tablename__ = 'balance_item'
    party_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id', name='fk_balance_item'), nullable=False)
    # Визначаємо відношення до моделі Item
    item = relationship('Item', backref='balance_items')
    date_receipt = db.Column(db.Date, nullable=False)
    cost = db.Column(db.Float, nullable=False, default=0)
    quantity = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"Balance_item {self.party_id}, item {self.item}"


class BalanceItemSchema(ma.Schema):
    """ schema """
    class Meta:
        fields = ('party_id', 'item_id', 'item_name', 'date_receipt', 'cost', 'quantity')

    date_receipt = fields.Function(
        # дата в строку
        serialize=lambda obj: obj.date_receipt.strftime('%Y-%m-%d') if obj is not None else '',
        # строка в дату
        deserialize=lambda value: datetime.strptime(value, '%Y-%m-%d') if value else datetime(1900, 1, 1))

    item_name = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.item_name if obj is not None and obj.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )

# Schema's initializing
balance_item_schema = BalanceItemSchema()
balance_items_schema = BalanceItemSchema(many=True)

"""
    release_date = db.Column(db.Date, index=True, nullable=False)
    uuid = db.Column(db.String(36), unique=True)
    description = db.Column(db.Text)
    distributed_by = db.Column(db.String(128), nullable=False)
    length = db.Column(db.Float)
    rating = db.Column(db.Float)
    test = db.Column(db.Float)

    def __init__(self, title, release_date, description, distributed_by, length, rating, actors=None):
        self.title = title
        self.release_date = release_date
        self.description = description
        self.distributed_by = distributed_by
        self.length = length
        self.rating = rating
        if not actors:
            self.actors = []
        else:
            self.actors = actors

# class User(db.Model):
#     __tablename__ = 'users'
#
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(50), unique=True, nullable=False)
#     email = db.Column(db.String(50), unique=True, nullable=False)
#     password = db.Column(db.String(254), nullable=False)
#     is_admin = db.Column(db.Boolean, default=False)
#     uuid = db.Column(db.String(36), unique=True)
#
#     def __init__(self, username, email, password, is_admin=False):
#         self.username = username
#         self.email = email
#         self.password = generate_password_hash(password)
#         self.is_admin = is_admin
#         self.uuid = str(uuid.uuid4())
#
#     def __repr__(self):
#         return f'User({self.username}, {self.email}, {self.uuid})'
#
#     @classmethod
#     def find_user_by_username(cls, username):
#         return cls.query.filter_by(username=username).first()
#
#     @classmethod
#     def find_user_by_uuid(cls, uuid):
#         return cls.query.filter_by(uuid=uuid).first()



<<<===================================
Методи query, filter, та filter_by в SQLAlchemy використовуються для створення запитів до бази даних та фільтрації результатів. 
Вони допомагають вам взаємодіяти з даними у вашому додатку. Давайте детальніше розглянемо кожен з цих методів:

Метод query:

query - це основний метод, який використовується для створення запитів до бази даних в SQLAlchemy. Він дозволяє вам вибирати дані з таблиць, 
використовуючи об'єкт запиту.


# Створення запиту для вибору всіх користувачів
users = User.query.all()

# Створення запиту для вибору користувача за ідентифікатором
user = User.query.get(1)
Ви можете додавати різні методи до об'єкта запиту, такі як filter, order_by, limit, offset, щоб створювати більш складні запити.

Метод filter:

filter використовується для додавання умов до запиту, що дозволяє фільтрувати дані за певними критеріями.

# Створення запиту для вибору користувачів з ім'ям "John"
users = User.query.filter(User.username == "John").all()
Ви можете поєднувати декілька умов за допомогою операторів, таких як and_, or_, для створення більш складних фільтрів.

Метод filter_by:

filter_by - це спрощений метод фільтрації, який приймає аргументи у вигляді ключів та значень для фільтрації.

# Створення запиту для вибору користувачів з ім'ям "John"
users = User.query.filter_by(username="John").all()
Цей метод особливо корисний, коли ви хочете фільтрувати за однією або декількома конкретними колонками у таблиці.

За допомогою методів query, filter, та filter_by, ви можете створювати різноманітні запити до бази даних, використовуючи різні 
умови та фільтри, і отримувати результати, які відповідають вашим потребам. Ці методи є важливою частиною SQLAlchemy і допомагають
 здійснювати роботу з базою даних в вашому додатку Flask або іншому додатку, який використовує SQLAlchemy.
===================================>>>



"""
