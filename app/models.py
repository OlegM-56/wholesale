import re

from flask_marshmallow.fields import fields
from datetime import datetime, date

from sqlalchemy import func
from sqlalchemy.orm import relationship

from . import db, ma, BASE_DIR

import os
import json
import codecs


# ============================ Моделі в файлах ====================================
class Menu:
    """ ---  Головне меню ---"""

    class query:
        @staticmethod
        def all():
            file_json = str(BASE_DIR / "menu.json")
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
            file_json = str(BASE_DIR / "status_doc.json")
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


def format_number(num_value, digit=0):
    """ форматування чисел для виводу   000 000 000.00 """
    if num_value is None:
        return ''
    # якщо num_value рядок - видаляємо всі тегі та переводимо в число
    str_patram = str_value = ''
    if isinstance(num_value, str):
        str_patram = num_value
        str_value = re.sub('<.*?>', '', num_value)
        num_value = float(str_value)
    if digit == 1:
        res = f"{num_value:,.1f}".replace(',', ' ')
    elif digit == 2:
        res = f"{num_value:,.2f}".replace(',', ' ')
    else:
        res = f"{num_value:,.0f}".replace(',', ' ')
    # якщо параметр був рядком - вставляємо отрирмане значення в цей рядок, зберігаючи теги, якщо вони є
    if str_patram and str_value:
        res = str_patram.replace(str_value, res)

    return res


# ============================ Моделі в БД ====================================

# ===================  ДОВІДНИКИ ==================
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


class GroupItem(db.Model):
    """ --- Групи товарів/послуг --- """
    __tablename__ = 'group_item'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_name = db.Column(db.String(50), nullable=False)
    group_description = db.Column(db.String(150), nullable=True)

    def __repr__(self):
        return f"{self.id} - {self.group_name}"


class GroupItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'group_name', 'group_description')

    group_description = fields.Function(
        # вывод данных
        serialize=lambda obj: obj.group_description if obj and obj.group_description else '',
        # ввод данных
        deserialize=lambda value: value if value else None
    )


# Schema's initializing
group_item_schema = GroupItemSchema()
group_items_schema = GroupItemSchema(many=True)


class Item(db.Model):
    """ ---  Товари та послуги ---"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_name = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(10), db.ForeignKey('unit.unit_code'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('group_item.id', name='fk_item_group'), nullable=False, default=1)
    group = relationship('GroupItem', backref='item_group')
    service = db.Column(db.Boolean, nullable=False, default=False)
    item_description = db.Column(db.String(150), nullable=True, default='')

    def __repr__(self):
        return f"Item {self.id}, {self.item_name}"

    @staticmethod
    def get_dataset():
        """ DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        return Item.query.join(GroupItem, Item.group_id == GroupItem.id)

    @staticmethod
    def get_field(field_name):
        """ Отримання поля з DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        if field_name == 'group_name':
            field = GroupItem.group_name
        else:
            field = getattr(Item, field_name, None)
        return field


class ItemSchema(ma.Schema):
    """ Item_schema """

    class Meta:
        fields = ('id', 'item_name', 'unit', 'service', 'group_id', 'group_name', 'item_description')

    service = fields.Function(
        serialize=lambda obj: 'Так' if obj is not None and obj.service else '',
        deserialize=lambda value: value == 'Так')
    item_description = fields.Function(
        # вывод данных
        serialize=lambda obj: obj.item_description if obj and obj.item_description else '',
        # ввод данных
        deserialize=lambda value: value if value else None
    )
    group_name = fields.Function(
        serialize=lambda obj: obj.group.group_name if obj is not None and obj.group else '',
        deserialize=lambda value: None
    )


# Schema's initializing
item_schema = ItemSchema()
items_schema = ItemSchema(many=True)


class PriceList(db.Model):
    """ --- Актуальний Прайс-лист ---"""
    __tablename__ = 'price_list'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id', name='fk_price_list_item'), nullable=False)
    # Визначаємо відношення до моделі Item
    item = relationship('Item', backref='price_list_items')
    is_actual = db.Column(db.Boolean, nullable=False, default=True)
    price = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"PriceList {self.item_id} = {self.price}"

    @staticmethod
    def get_dataset():
        """ DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        return PriceList.query.join(Item, PriceList.item_id == Item.id)

    @staticmethod
    def get_field(field_name):
        """ Отримання поля з DATASET для складних Моделей(декілька повязаних таблиць) для пошуку та сортування"""
        if field_name == 'item_name':
            field = Item.item_name
        else:
            field = getattr(PriceList, field_name, None)
        return field


class PriceListSchema(ma.Schema):
    """ Item_schema """

    class Meta:
        fields = ('id', 'item_id', 'item_name', 'unit', 'service', 'price', 'is_actual')

    item_name = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.item_name if obj is not None and obj.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    unit = fields.Function(
        # витягнути ОВ
        serialize=lambda obj: obj.item.unit if obj is not None and obj.item else '',
        # пропустити ОВ при десеріалізації
        deserialize=lambda value: None
    )
    service = fields.Function(
        serialize=lambda obj: 'Так' if obj and obj.item and obj.item.service else '',
        deserialize=lambda value: None)

    is_actual = fields.Function(
        serialize=lambda obj: 'Так' if obj and obj.is_actual else '',
        deserialize=lambda value: value == 'Так')


class PriceShortSchema(ma.Schema):
    """ Item_schema """

    class Meta:
        fields = ('item_id', 'price')


# Schema's initializing
price_list = PriceListSchema()
price_lists = PriceListSchema(many=True)

price_short = PriceShortSchema()
price_shorts = PriceShortSchema(many=True)


# ===================  ДОКУМЕНТИ ==================
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
        # row - документ Pinvoice для видалення
        if row is not None:
            # Видаляємо всі рядки документу Pinvoice
            PinvoiceRow.query.filter_by(pinvoice_id=row.num_doc).delete()

    @staticmethod
    def confirm(data):
        """  ---- метод для проведення накладної ----
        data - документ Pinvoice для проведення
        """
        # Знаходимо всі рядки документу Pinvoice
        rows = PinvoiceRow.query.filter_by(pinvoice_id=data.num_doc).all()
        #  запускаємо метод проведення документу та повертаємо результат проведення
        return BalanceItem.update_balance(adding=True, doc=data, rows=rows)

    @staticmethod
    def get_sum_doc(num_doc):
        """  ---- Сума по накладній ----
        row - документ
        """
        sumdoc = PinvoiceRow.query.filter_by(pinvoice_id=num_doc).with_entities(func.sum(PinvoiceRow.quantity * PinvoiceRow.price)).scalar()
        return sumdoc if sumdoc else 0


class PinvoiceSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = (
            'num_doc', 'customer_id', 'customer_name', 'doc_date', 'doc_status', 'doc_status_name', 'doc_date_approve', 'custom_numdoc',
            'sum_doc')

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
    sum_doc = fields.Function(
        serialize=lambda obj: format_number(obj.get_sum_doc(obj.num_doc), 2) if obj is not None else 0,
        deserialize=lambda value: None
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


class PinvoiceRowSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'pinvoice_id', 'npp', 'item_id', 'item_name', 'unit', 'quantity', 'price', 'amount')

    item_name = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.item_name if obj is not None and obj.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    unit = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.unit if obj is not None and obj.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    amount = fields.Function(
        # рахуемо суму грошей по рядку
        serialize=lambda obj: format_number(obj.quantity * obj.price if obj is not None else 0, 2),
        # пропустити суму грошей по рядку
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
        # row - документ Einvoice для видалення
        if row is not None:
            # Видаляємо всі рядки документу Pinvoice
            EinvoiceRow.query.filter_by(einvoice_id=row.num_doc).delete()

    @staticmethod
    def confirm(data):
        """  ---- метод для проведення накладної ----
        data - документ Einvoice для проведення
        """
        # Знаходимо всі рядки документу Einvoice
        rows = EinvoiceRow.query.filter_by(einvoice_id=data.num_doc).all()
        #  запускаємо метод проведення документу та повертаємо результат проведення
        return BalanceItem.update_balance(adding=False, doc=data, rows=rows)

    @staticmethod
    def get_sum_doc(num_doc):
        """  ---- Сума по накладній ----
        row - документ
        """
        sumdoc = EinvoiceRow.query.filter_by(einvoice_id=num_doc).with_entities(func.sum(EinvoiceRow.quantity * EinvoiceRow.price)).scalar()
        return sumdoc if sumdoc else 0


class EinvoiceSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = (
            'num_doc', 'customer_id', 'customer_name', 'doc_date', 'doc_status', 'doc_status_name', 'doc_date_approve', 'sum_doc')

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
    sum_doc = fields.Function(
        serialize=lambda obj: format_number(obj.get_sum_doc(obj.num_doc) if obj is not None else 0, 2),
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
        fields = ('id', 'einvoice_id', 'npp', 'item_id', 'item_name', 'unit', 'quantity', 'price', 'amount')

    item_name = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.item_name if obj is not None and obj.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    unit = fields.Function(
        # витягнути назву ОВ
        serialize=lambda obj: obj.item.unit if obj is not None and obj.item else '',
        # пропустити назву ОВ
        deserialize=lambda value: None
    )
    amount = fields.Function(
        # рахуемо суму грошей по рядку
        serialize=lambda obj: format_number(obj.quantity * obj.price if obj is not None else 0, 2),
        # пропустити суму грошей по рядку
        deserialize=lambda value: None
    )


# Schema's initializing
einvoice_row_schema = EinvoiceRowSchema()
einvoice_rows_schema = EinvoiceRowSchema(many=True)


class WarehouseOrderRow(db.Model):
    """ --- рядки складського ордеру для списання залишків по партіях ---"""
    __tablename__ = 'warehouse_order_row'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    einvoice_id = db.Column(db.Integer, db.ForeignKey('einvoice.num_doc', name='fk_wh_einvoice_num_doc'), nullable=False)
    einvoice = relationship('Einvoice', backref='wh_order_row_items')
    einvoice_row_id = db.Column(db.Integer, db.ForeignKey('einvoice_row.id'), name='fk_einvoice_row_order', nullable=False)
    einvoice_row = relationship('EinvoiceRow', backref='einvoice_row_order')
    party_id = db.Column(db.Integer, db.ForeignKey('balance_item.party_id'), name='fk_balance_order_row', nullable=False)
    balance_item = relationship('BalanceItem', backref='balance_order_row')
    quantity = db.Column(db.Float, nullable=False, default=0)

    def __repr__(self):
        return f"Warehouse_order_row id {self.id}, einvoice_row {self.einvoice_row}"


class WarehouseOrderRowSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'einvoice_row_id', 'npp', 'item_name', 'party_id', 'date_receipt', 'cost', 'quantity', 'unit')

    npp = fields.Function(
        # витягнути дати партії
        serialize=lambda obj: obj.einvoice_row.npp if obj is not None and obj.einvoice_row else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    date_receipt = fields.Function(
        # витягнути дати партії
        serialize=lambda obj: obj.balance_item.date_receipt if obj is not None and obj.balance_item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    cost = fields.Function(
        # витягнути дати партії
        serialize=lambda obj: obj.balance_item.cost if obj is not None and obj.balance_item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    item_name = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.balance_item.item.item_name if obj is not None and obj.balance_item.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )
    unit = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.balance_item.item.unit if obj is not None and obj.balance_item.item else '',
        # пропустити ім'я товару при десеріалізації
        deserialize=lambda value: None
    )


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

    # ============ Коригування залишків при проведенні накладних ========
    @staticmethod
    def update_balance(adding, doc, rows):
        """ ------   Алгоритм проведення накладних --------
            В сеансі накладних є кнопка Провести документ та Скасувати проведення, обробляється цим методом.
            - Аналізуємо поточне поле doc_status в накладній:  якщо = 0, то документ треба Провести,
            якщо = 1, то треба відмінити Проведення документу.
            Аналізуємо тип накладної:  Прибуткова чи Видаткова
            На основі цих параметрів запускаемо метод проведення
            ! Принцип:
            Ми робимо Проведення всього документу та Скасування проведення всього документу !!!
            Коригування рядків в проведеному документі не дозволяється!
            Для коригування робимо Скасування, коригуємо та знову Проводимо
            ! Якщо при Проведенні або Скасування баланс по партії стає менше 0, то вся операція скасовується!

        """
        # !! Якщо у документу немає рядків - повертаємо помилку
        if not rows:
            raise ValueError(f"Немає рядків у документі № {doc.num_doc}!")

        # проведення чи скасування проведення
        confirm = doc.doc_status ^ 1
        # Дата проведення = doc_date_approve, якщо воно заповнене, або поточна дата
        date_approve = doc.doc_date_approve if doc.doc_date_approve else date.today()

        ''' ---- проходимо по всіх рядках документу та правимо баланс по партіях
            надходження товару на склад - шукаємо/формуємо партію по item_id+date_party+ціна закупки

            Видаткові накладні обробляються так:
            Проведення:
              - на кожен рядок накладної формується один або більше рядків складського ордеру, 
                в якому зазначається, з залишків якої партії іде списання;
                алгоритм FIFO:  
                   шукаємо всі партії по товару, для яких Дата приходу <= Дата проведення 
                   сортуємо їх по зростанню Дати приходу
                   беремо першу партію в перший рядок складського ордеру - якщо вистачає кількості, то завершуємо,
                   якщо кількості не вистачило для покриття кількості в рядку накладної - беремо наступну партію и т.д.
              - коригування балансу по партіях проводиться по рядках складського ордеру
            Скасування проведення:
              - проходимо по рядкам складських ордерів, коригуємо баланс по партіях та видаляємо рядки складських ордерів
              
        '''
        error_message = []
        # --- Надходження товару на склад - Прибуткові накладні -----
        if adding:
            for row in rows:
                # якщо це послуга - пропускаємо
                if row.item.service: continue
                # шукаємо партію по даних рядка документу
                party = BalanceItem.query.filter_by(item_id=row.item_id, date_receipt=date_approve, cost=row.price).first()
                #  якщо немає партії - створюємо
                if not party:
                    party = BalanceItem(item_id=row.item_id, date_receipt=date_approve, cost=row.price, quantity=0)
                    db.session.add(party)
                #  коригуємо баланс
                party.quantity = party.quantity + row.quantity if confirm else party.quantity - row.quantity
                if party.quantity < 0:
                    error_message.append(f"По товару '{row.item.item_name}' утворюється від'ємний залишок = {party.quantity}!")

        # --- Вибуття товару зі складу - Видаткові накладні -----
        else:
            # ------  Проходимо по рядкам накладної
            for row in rows:
                # якщо це послуга - пропускаємо
                if row.item.service: continue
                # --- якщо це проведення
                if confirm:
                    # шукаємо партії з залишком > 0 для товару з рядка
                    parties = (BalanceItem.query.filter(
                        BalanceItem.item_id == row.item_id,
                        BalanceItem.quantity > 0,
                        BalanceItem.date_receipt <= date_approve
                    ).order_by(BalanceItem.date_receipt).all())
                    #  якщо немає партії - видаємо помилку та продовжуємо !
                    if not parties:
                        error_message.append(f"Не знайдено залишків товару {row.item.item_name}  у кількості {row.quantity} "
                                             f"на дату {date_approve.strftime('%d.%m.%Y')} !")
                        continue
                    #  формуємо рядки складських ордерів
                    quantity_row = row.quantity
                    for party in parties:
                        #  доступна кількість на залишку партій
                        quantity_order = quantity_row if party.quantity >= quantity_row else party.quantity
                        # створюємо рядок ордеру
                        new_order_row = WarehouseOrderRow(einvoice_id=row.einvoice_id, einvoice_row_id=row.id, party_id=party.party_id,
                                                          quantity=quantity_order)
                        db.session.add(new_order_row)
                        #  коригуємо баланс по партії
                        party.quantity = party.quantity - quantity_order
                        #  контроль кількості
                        quantity_row -= quantity_order
                        if quantity_row == 0: break
                    # якщо не вистачило залишків
                    if quantity_row > 0:
                        error_message.append(f"Не вистачило залишків товару {row.item.item_name} у кількості {quantity_row}"
                                             f" на дату {date_approve.strftime('%d.%m.%Y')} !")

                # --- якщо це скасування проведення
                else:
                    # шукаємо рядки складських ордерів по рядку накладної
                    rows_order = WarehouseOrderRow.query.filter_by(einvoice_row_id=row.id)
                    for row_o in rows_order.all():
                        # шукаємо партію по даних рядка
                        party = BalanceItem.query.get(row_o.party_id)
                        #  якщо є партія коригуємо баланс
                        if party:
                            party.quantity = party.quantity + row_o.quantity
                    # видаляємо рядки складських ордерів по рядку накладної
                    WarehouseOrderRow.query.filter_by(einvoice_row_id=row.id).delete()
        #  -- генеруємо помилку, якщо є
        if error_message:
            raise ValueError(error_message)

        # --- вносимо зміни в заголовок документу
        if not doc.doc_date_approve:
            doc.doc_date_approve = date_approve
        doc.doc_status = confirm

        return True


class BalanceItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('party_id', 'item_id', 'item_name', 'unit', 'date_receipt', 'cost', 'quantity')

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
    unit = fields.Function(
        # витягнути ім'я товару
        serialize=lambda obj: obj.item.unit if obj is not None and obj.item else '',
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
