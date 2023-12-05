from flask_marshmallow.fields import fields
from datetime import datetime, date

from sqlalchemy.orm import relationship

from . import db, ma

import os
import json
import codecs


# ============================ Моделі в файлах ====================================
class Menu:
    """ ---  Головне меню ---"""
    class query:
        @staticmethod
        def all():
            file_json = 'menu.json'
            menu = {}
            if os.path.isfile(file_json):
                with codecs.open(file_json, 'r', 'utf-8') as file_data:
                    menu = json.load(file_data)
            return menu


class StatusDoc:
    """ ---  Статус накладної ---"""
    class query:
        @staticmethod
        def all():
            file_json = 'status_doc.json'
            status_doc = {}
            if os.path.isfile(file_json):
                with codecs.open(file_json, 'r', 'utf-8') as file_data:
                    status_doc = json.load(file_data)
            return status_doc

        @staticmethod
        def get(pk):
            status_list = StatusDoc.query.all()
            status = {item["id"]: item["name_status"] for item in status_list if item["id"] == pk}
            return status.get(pk, '')


# ============================ Функції ====================================
def get_spec_dataset(model):
    """  якщо модель має спецметод для складних Моделей(декілька повязаних таблиць) для пошуку та сортування  """
    if 'get_dataset' in dir(model):
        dataset = model.get_dataset()
    else:
        dataset = model.query

    return dataset


def get_spec_field(model, field_name):
    """  якщо модель має спецметод для складних Моделей(декілька повязаних таблиць) для пошуку та сортування  """
    if 'get_field' in dir(model):
        field = model.get_field(field_name)
    else:
        field = getattr(model, field_name, None)

    return field


# ============================ Моделі в БД ====================================
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
    custom_numdoc = db.Column(db.String(30), nullable=True)

    def __repr__(self):
        return f"Pinvoice {self.num_doc} ({self.custom_numdoc}), {self.doc_date}"

    @staticmethod
    def get_dataset():
        """ DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        return Pinvoice.query.join(Customer, Pinvoice.customer_id == Customer.id)

    @staticmethod
    def get_field(field_name):
        """ Отримання поля з DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        if field_name == 'customer_name':
            field = Customer.customer_name
        elif field_name == 'doc_status_name':
            field = Pinvoice.doc_status
        else:
            field = getattr(Pinvoice, field_name, None)
        return field

    @staticmethod
    def delete_row(row):
        """ метод для коректного видалення рядків накладної на самої накладної"""
        try:
            # row - документ Pinvoice для видалення
            if row is not None:
                # Видаляємо всі рядки документу Pinvoice
                PinvoiceRow.query.filter_by(pinvoice_id=row.num_doc).delete()
                # Видаляємо сам документ Pinvoice
                db.session.delete(row)
                # Зберігаємо зміни в базі даних
                db.session.commit()
                return True
            else:
                return False
        except Exception as e:
            print('error"', str(e))
            return False

    @staticmethod
    def confirm(data):
        """ метод для проведення накладної """
        try:
            # data - документ Pinvoice для проведення
            data.doc_date_approve = date.today()
            data.doc_status = 1
            # # Видаляємо всі рядки документу Pinvoice
            # PinvoiceRow.query.filter_by(pinvoice_id=row.num_doc).delete()
            # # Видаляємо сам документ Pinvoice
            # db.session.delete(row)
            # # Зберігаємо зміни в базі даних
            # db.session.commit()
            return True
        except Exception as e:
            print('error"', str(e))
            return False


class PinvoiceSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = (
            'num_doc', 'customer_id', 'customer_name', 'doc_date', 'doc_status', 'doc_status_name', 'doc_date_approve', 'custom_numdoc')

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
    doc_status_name = fields.Function(
        serialize=lambda obj: StatusDoc.query.get(obj.doc_status),
        deserialize=lambda value: None
    )
    custom_numdoc = fields.Function(
        serialize=lambda obj: obj.custom_numdoc if obj and obj.custom_numdoc else '',
        deserialize=lambda value: value
    )

# Schema's initializing
pinvoice_schema = PinvoiceSchema()
pinvoices_schema = PinvoiceSchema(many=True)


class PinvoiceRow(db.Model):
    """ --- Прибуткова накладна, рядки ---"""
    __tablename__ = 'pinvoice_row'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pinvoice_id = db.Column(db.Integer, db.ForeignKey('pinvoice.num_doc', name='fk_pinvoice_num_doc'), nullable=False)
    pinvoice = relationship('Pinvoice', backref='pinvoice_row_items')
    npp = db.Column(db.Integer, nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id', name='fk_pinvoice_row_item'), nullable=False)
    # Визначаємо відношення до моделі Item
    item = relationship('Item', backref='pinvoice_row_items')
    quantity = db.Column(db.Float, nullable=False, default=0)
    price = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"Pinvoice_row Doc N {self.pinvoice}, npp {self.npp}"

    @staticmethod
    def before_update(row_old, row_new):
        """ метод для коригування рядків накладної:
            якщо накладна проведена, то зміни кількості в рядку змінюють залишки по партіях в моделі BalanceItem
            для цього викликається метод  BalanceItem.update_balance, якому передаються старі дані рядка та нові дангі рядка накладної
        """
        BalanceItem.update_balance(True, row_old, row_new)


class PinvoiceRowSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'pinvoice_id', 'npp', 'item_id', 'item_name', 'quantity', 'price')

    item_name = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.item_name if obj is not None and obj.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )


# Schema's initializing
pinvoice_row_schema = PinvoiceRowSchema()
pinvoice_rows_schema = PinvoiceRowSchema(many=True)


class Einvoice(db.Model):
    """ --- Видаткова накладна ---"""
    num_doc = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id', name='fk_einvoice_customer'), nullable=False)
    customer = relationship('Customer', backref='einvoice_customer')
    doc_date = db.Column(db.Date, nullable=False)
    doc_status = db.Column(db.Integer, nullable=False, default=0)
    doc_date_approve = db.Column(db.Date, nullable=True)

    def __repr__(self):
        return f"Einvoice {self.num_doc} від {self.doc_date}"

    @staticmethod
    def get_dataset():
        """ DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        return Einvoice.query.join(Customer, Einvoice.customer_id == Customer.id)

    @staticmethod
    def get_field(field_name):
        """ Отримання поля з DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        if field_name == 'customer_name':
            field = Customer.customer_name
        elif field_name == 'doc_status_name':
            field = Einvoice.doc_status
        else:
            field = getattr(Einvoice, field_name, None)
        return field

    @staticmethod
    def delete_row(row):
        """ метод для коректного видалення рядків накладної на самої накладної"""
        try:
            # row - документ Pinvoice для видалення
            if row is not None:
                # Видаляємо всі рядки документу Pinvoice
                EinvoiceRow.query.filter_by(einvoice_id=row.num_doc).delete()
                # Видаляємо сам документ Pinvoice
                db.session.delete(row)
                # Зберігаємо зміни в базі даних
                db.session.commit()
                return True
            else:
                return False
        except Exception as e:
            print('error"', str(e))
            return False

class EinvoiceSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = (
            'num_doc', 'customer_id', 'customer_name', 'doc_date', 'doc_status', 'doc_status_name', 'doc_date_approve')

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
    doc_status_name = fields.Function(
        serialize=lambda obj: StatusDoc.query.get(obj.doc_status),
        deserialize=lambda value: None
    )

# Schema's initializing
einvoice_schema = EinvoiceSchema()
einvoices_schema = EinvoiceSchema(many=True)


class EinvoiceRow(db.Model):
    """ --- Видаткова накладна, рядки ---"""
    __tablename__ = 'einvoice_row'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    einvoice_id = db.Column(db.Integer, db.ForeignKey('einvoice.num_doc', name='fk_einvoice_num_doc'), nullable=False)
    einvoice = relationship('Einvoice', backref='einvoice_row_items')
    npp = db.Column(db.Integer, nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id', name='fk_einvoice_row_item'), nullable=False)
    # Визначаємо відношення до моделі Item
    item = relationship('Item', backref='einvoice_row_items')
    quantity = db.Column(db.Float, nullable=False, default=0)
    price = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"Einvoice_row Doc N {self.einvoice}, npp {self.npp}"

class EinvoiceRowSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'einvoice_id', 'npp', 'item_id', 'item_name', 'quantity', 'price')

    item_name = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.item_name if obj is not None and obj.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )

# Schema's initializing
einvoice_row_schema = EinvoiceRowSchema()
einvoice_rows_schema = EinvoiceRowSchema(many=True)


# class WarehouseOrderRow(db.Model):
#     """ --- рядки складського ордеру (списання залишків по партіях) ---"""
#     __tablename__ = 'warehouse_order_row'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     einvoice_row = db.Column(db.Integer, db.ForeignKey('einvoice_row.id'), nullable=False)
#     quantity = db.Column(db.Float, nullable=False, default=0)
#     cost = db.Column(db.Float, nullable=False, default=0)
#
#     def __repr__(self):
#         return f"Warehouse_order_row id {self.id}, einvoice_row {self.einvoice_row}"

#
# class WarehouseOrderRowSchema(ma.Schema):
#     """ schema """
#
#     class Meta:
#         fields = ('id', 'einvoice', 'npp', 'item', 'quantity', 'price')
#
#
# # Schema's initializing
# warehouse_order_row_schema = WarehouseOrderRowSchema()
# warehouse_order_rows_schema = WarehouseOrderRowSchema(many=True)


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

    @staticmethod
    def get_dataset():
        """ DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        return BalanceItem.query.join(Item, BalanceItem.item_id == Item.id)

    @staticmethod
    def get_field(field_name):
        """ Отримання поля з DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        if field_name == 'item_name':
            field = Item.item_name
        else:
            field = getattr(BalanceItem, field_name, None)
        return field

    @staticmethod
    def update_balance(adding, row_old, row_new):
        """ якщо накладна проведена, то зміни кількості в рядку змінюють залишки по партіях в моделі BalanceItem
            для цього викликається метод  BalanceItem.update_balance, якому передаються старі дані рядка та нові дангі рядка накладної
        """
        # ------- Надходження товару на склад -------
        if adding:
            # -- шукаємо партію по старих даних
            old_party = None
            #  дата проведення накладної
            date_receipt_old = Pinvoice.query.get(row_old.pinvoice_id).doc_date_approve
            if date_receipt_old:
                old_party = BalanceItem.query.filter_by(
                    item_id=row_old.item_id, date_receipt=date_receipt_old, cost=row_old.price
                ).first()

            # -- шукаємо партію по нових даних
            new_party = None
            #  дата проведення накладної
            date_receipt_new = Pinvoice.query.get(row_new['pinvoice_id']).doc_date_approve
            if date_receipt_new:
                #  нова та стара партія - однакові
                if (old_party and
                        row_new['item_id'] == row_old.item_id and date_receipt_new == date_receipt_old and row_new['price'] == row_old.price):
                    new_party = old_party
                else:
                    # інакше -  шукаємо партію по нових даних
                    new_party = BalanceItem.query.filter_by(
                        item_id=row_new['item_id'], date_receipt=date_receipt_new, cost=row_new['price']
                    ).first()
                #  якщо немає нової партії - створюємо
                if not new_party:
                    new_party = BalanceItem(item_id=row_new['item_id'], date_receipt=date_receipt_new, cost=row_new['price'], quantity=0)
                    db.session.add(new_party)

            # ----- Віднімаємо кількість від старої партії
            if old_party:
                old_party.quantity = old_party.quantity - row_old.quantity
                if old_party.quantity < 0:  old_party.quantity = 0
            # ----- Додаємо кількість до нової партії
            if new_party:
                new_party.quantity = new_party.quantity + float(row_new['quantity'])


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


# class Product(db.Model):
#     """ --- TEST ---"""
#     __tablename__ = 'product'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     code = db.Column(db.String(10), nullable=False)
#     name = db.Column(db.String(70), nullable=False)
#     price = db.Column(db.Float, nullable=False, default=0)
#     warehouse = db.Column(db.Integer, nullable=False)
#     comment = db.Column(db.String(100), nullable=True)
#
#     def __repr__(self):
#         return f"Product {self.code}, item {self.name}"
#
# class ProductSchema(ma.Schema):
#     """ schema """
#
#     class Meta:
#         fields = ('id', 'code', 'name', 'price', 'warehouse', 'comment')
#
# # Schema's initializing
# product_schema = ProductSchema()
# products_schema = ProductSchema(many=True)




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
