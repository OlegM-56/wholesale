from .models import *


class RepBalanceItem:
    """ =====================  Залишки товарів на дату ========================  """
    @staticmethod
    def get_report(params, orders):
        """ ---  Залишки товарів на дату ---   параметри звіту: params= {"date_rep":"10-12-2023"}
          - Рахуємо суми всіх приходів по товару за період  кількість * ціна приходу
            Рахуємо суми всіх витрат товарів за період по складських ордерах  кількість * ціна приходу з партії
            Отримуємо Вартість залишків по цінам приходу
          - Рахуємо суми залишків по прайсовим цінам   кількіст залишку * прайсова ціна
            якщо в прайсі немає ціни - ???????
        """
        data = []
        date_rep = params.get('date_rep')
        if not date_rep: return data

        # --- Формуємо список items, послуги пропускаємо
        item_list = Item.query.filter_by(service=False).all()
        # --- Формуємо список приходів за період з date_0(включно) до дати звіту(включно)
        # рахуємо суму надходження для товарів по рядкам проведених! прибуткових накладних
        # використовуємо функцію sum, щоб підрахувати суму по полям
        receipt_item_list = (
            db.session.query(
                PinvoiceRow.item_id,
                func.sum(PinvoiceRow.quantity).label('sum_quantity'),
                func.sum(PinvoiceRow.quantity*PinvoiceRow.price).label('sum_money')
            ).join(Pinvoice).filter(
                Pinvoice.doc_date_approve <= date_rep, Pinvoice.doc_status == 1
            ).group_by(PinvoiceRow.item_id).all()
        )
        #  масив -- в словник для швидкого пошуку
        receipt_items_dict = {row[0]: row[1:] for row in receipt_item_list if row[1] > 0}

        # --- Формуємо список видатків товарів за період з date_0(включно) до дати звіту(включно)
        #     по рядках складських ордерів
        expense_item_list = (
            db.session.query(
                BalanceItem.item_id,
                func.sum(WarehouseOrderRow.quantity).label('sum_quantity'),
                func.sum(WarehouseOrderRow.quantity * BalanceItem.cost).label('sum_money')
            ).join(Einvoice).join(BalanceItem).filter(
                Einvoice.doc_date_approve <= date_rep, Einvoice.doc_status == 1
            ).group_by(BalanceItem.item_id).all()
        )
        #  масив -- в словник для швидкого пошуку
        expense_items_dict = {row[0]: row[1:] for row in expense_item_list if row[1] > 0}
        #   актуальний прайс
        price_list = (
            db.session.query(PriceList.item_id, PriceList.price)
            .filter_by(is_actual=True)
            .all()
        )
        #  масив -- в словник для швидкого пошуку
        price_dict = dict(price_list)

        #  --- прохрдимо по всіх товарах та формуємо звіт
        total_sum_item = total_pricesum_item = 0
        for item in item_list:
            # приход
            receipt = receipt_items_dict.get(item.id, None)
            if receipt is None:
                sum_receipt = 0
                sum_receipt_money = 0
            else:
                sum_receipt, sum_receipt_money = receipt
            # видаток
            expense = expense_items_dict.get(item.id, None)
            if expense is None:
                sum_expense = 0
                sum_expense_money = 0
            else:
                sum_expense, sum_expense_money = expense

            #  якщо руху немає - пропускаємо
            if sum_receipt == 0 and sum_expense == 0: continue
            # залишок товару =  сума приходів - сума видатків
            balance_item = sum_receipt - sum_expense
            #  сума по прайсовій ціні
            price = price_dict.get(item.id, 0)
            balance_pricesum_item = price*balance_item
            total_pricesum_item += balance_pricesum_item
            #  сума по ціні приходу
            balance_sum_item = sum_receipt_money - sum_expense_money
            total_sum_item += balance_sum_item

            data.append({'id': item.id, 'item_name': item.item_name, 'unit': item.unit,
                         'balance_item': format_number(balance_item),
                         'balance_sum_item': format_number(balance_sum_item),
                         'balance_pricesum_item': format_number(balance_pricesum_item)
                         }
                        )
        #  додаємо підсумковий рядок
        if total_sum_item or total_pricesum_item:
            data.append({'id': '', 'item_name': '<b>ЗАГАЛЬНА  ВАРТІСТЬ  ЗАЛИШКІВ</b>', 'unit': '<b>грн.</b>', 'balance_item': '',
                         'balance_sum_item': f"<b>{format_number(total_sum_item)}</b>",
                         'balance_pricesum_item': f"<b>{format_number(total_pricesum_item)}</b>"})

        return data


class RepBalanceItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'item_name', 'unit', 'balance_item', 'balance_sum_item', 'balance_pricesum_item')


# Schema's initializing
rep_balance_item_schema = RepBalanceItemSchema()
rep_balance_items_schema = RepBalanceItemSchema(many=True)


class RepCirculationItem:
    """ =====================  Обороти товарів на дату та за період ========================  """

    @staticmethod
    def get_list_data(date_rep, date_rep0=date(2000, 1, 1)):
        """ ---  Оборот за період та Залишки товарів на дату ---  """
        data = []
        # --- Формуємо список items, послуги пропускаємо
        item_list = Item.query.filter_by(service=False).all()
        # --- Формуємо список приходів за період з date_0(включно) до дати звіту(включно)
        # рахуємо суму надходження для товарів по рядкам проведених! прибуткових накладних
        # використовуємо функцію sum, щоб підрахувати суму по полю quantity
        receipt_item_list = (
            db.session.query(PinvoiceRow.item_id, func.sum(PinvoiceRow.quantity)).join(Pinvoice).join(Item).filter(
                Pinvoice.doc_date_approve >= date_rep0, Pinvoice.doc_date_approve <= date_rep, Pinvoice.doc_status == 1,
                Item.service == False
            ).group_by(PinvoiceRow.item_id).all()
        )
        #  масив -- в словник для швидкого пошуку
        receipt_items_dict = dict(receipt_item_list)

        # --- Формуємо список видатків товарів за період з date_0(включно) до дати звіту(включно)
        #     по рядках проведених видаткових накладних
        expense_item_list = (
            db.session.query(EinvoiceRow.item_id, func.sum(EinvoiceRow.quantity)).join(Einvoice).join(Item).filter(
                Einvoice.doc_date_approve >= date_rep0, Einvoice.doc_date_approve <= date_rep, Einvoice.doc_status == 1,
                Item.service == False
            ).group_by(EinvoiceRow.item_id).all()
        )
        #  масив -- в словник для швидкого пошуку
        expense_items_dict = dict(expense_item_list)
        #  --- прохрдимо по всіх товарах та формуємо звіт
        for item in item_list:
            # приход
            sum_receipt = receipt_items_dict.get(item.id)
            if sum_receipt is None: sum_receipt = 0
            # видаток
            sum_expense = expense_items_dict.get(item.id)
            if sum_expense is None: sum_expense = 0
            #  якщо руху немає - пропускаємо
            if sum_receipt == 0 and sum_expense == 0: continue
            # залишок товару =  сума приходів - сума видатків
            balance_item = sum_receipt - sum_expense
            data.append({'id': item.id, 'item_name': item.item_name, 'unit': item.unit, 'start_balance_item': 0,
                         'receipt_item': sum_receipt, 'expense_item': sum_expense,
                         'balance_item': balance_item}
                        )
        return data

    @staticmethod
    def get_report(params, orders):
        """ ---  Оборотна відомість за період ---
                 параметри звіту: params= {"date_start":"10-12-2023", "date_end":"10-12-2023"}  """
        date_start = params.get('date_start')
        date_end = params.get('date_end')
        data = []
        if date_start and date_end:
            date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
            date_end = datetime.strptime(date_end, '%Y-%m-%d').date()
            if date_start > date_end:
                raise ValueError(f"Початкова дата періоду більше за кінцеву: {date_start} > {date_end} ! ")
            # -- початкові залишки
            data_items_ends = RepCirculationItem.get_list_data(date_start - timedelta(days=1))
            # -- Обороти
            data = RepCirculationItem.get_list_data(date_end, date_start)
            # --- додаємо початкові залишки
            if data_items_ends:
                #  масив -- в словник для швидкого пошуку
                data_items_ends_dict = {row['id']: row for row in data_items_ends if row['balance_item'] > 0}
                for row_rep in data:
                    item_ends = data_items_ends_dict.pop(row_rep['id'], None)  # беремо рядок залишку з видаленням
                    if item_ends:
                        row_rep['start_balance_item'] = item_ends['balance_item']
                        #  рахуємо залишок
                        row_rep['balance_item'] = row_rep['start_balance_item'] + row_rep['receipt_item'] - row_rep['expense_item']

                # якщо лишилися початкові залишки - додаємо їх до звіту
                for key, item_ends in data_items_ends_dict.items():
                    data.append({'id': item_ends['id'], 'item_name': item_ends['item_name'], 'unit': item_ends['unit'],
                                 'start_balance_item': format_number(item_ends['balance_item']),
                                 'receipt_item': 0, 'expense_item': 0, 'balance_item': format_number(item_ends['balance_item'])}
                                )
            data = sorted(data, key=lambda x: x['id'])

        return data


class RepCirculationItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'item_name', 'unit', 'start_balance_item', 'receipt_item', 'expense_item', 'balance_item')


# Schema's initializing
rep_circulation_item_schema = RepCirculationItemSchema()
rep_circulation_items_schema = RepCirculationItemSchema(many=True)


class RepSaleItem:
    """ =====================  Обсяги продажу товарів за період ========================  """

    @staticmethod
    def get_report(params, orders):
        data = []
        total_sales_money = 0
        # --- Обсяги продажу товарів за період - кількість та сумма грошей
        date_start = params.get('date_start')
        date_end = params.get('date_end')
        if date_start and date_end:
            # --- Формуємо список проданих товарів за період з date_0(включно) до дати звіту(включно)
            #     по рядках проведених видаткових накладних
            sale_items_list = (
                db.session.query(
                    EinvoiceRow.item_id, Item.item_name, Item.unit,
                    func.sum(EinvoiceRow.quantity).label('sales_item'),
                    func.sum(EinvoiceRow.quantity * EinvoiceRow.price).label('sales_money_item')
                ).join(Einvoice).join(Item).filter(
                    Einvoice.doc_date_approve >= date_start, Einvoice.doc_date_approve <= date_end, Einvoice.doc_status == 1,
                    Item.service == False
                ).group_by(EinvoiceRow.item_id, Item.item_name, Item.unit).all()
            )
            #  --- прохрдимо по всіх отриманих рядках та формуємо звіт
            for row in sale_items_list:
                total_sales_money += row.sales_money_item
                data.append({'id': row.item_id, 'item_name': row.item_name, 'unit': row.unit,
                             'sales_item': format_number(row.sales_item), 'sales_money_item': format_number(row.sales_money_item, 2)}
                            )
        #  сортуємо по id
        data = sorted(data, key=lambda x: x['id'])
        #  додаємо підсумковий рядок
        if total_sales_money:
            data.append({'id': '', 'item_name': '<b>ЗАГАЛЬНИЙ ОБСЯГ ПРОДАЖУ</b>', 'unit': '<b>грн.</b>', 'sales_item': '',
                         'sales_money_item': f"<b>{format_number(total_sales_money, 2)}</b>"})

        return data


class RepSaleItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'item_name', 'unit', 'sales_item', 'sales_money_item')


# Schema's initializing
rep_sale_item_schema = RepSaleItemSchema()
rep_sale_items_schema = RepSaleItemSchema(many=True)

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from flask import jsonify
import urllib

class RepSaleGroup:
    """ =====================  Обсяги продажу за період по групам ========================  """

    @staticmethod
    def get_circle_diagram(data):
        """ ===================== Кругова діаграма ================
        """
        # --- формуємо дані по queryset та готуємо таблицю розподілу та Діаграму
        title_rep = 'Продаж по групам'

        # Дані для кругової діаграми
        labels = []
        values = []
        for row in data:
            labels.append(row['group_name'])
            values.append(row['sales_money_group'])

        # Очищення попередньої діаграми
        plt.clf()  # або plt.cla()
        # Створення об'єкта figure з вказаною шириною та висотою
        plt.subplots(figsize=(6, 6))

        #   Побудова кругової діаграми
        plt.pie(values, autopct='%1.0f', startangle=90, counterclock=False)  # autopct='%1.0f%%'
        #   Встановлення назви діаграми
        plt.title(title_rep, pad=1)
        #   Додаткові налаштування
        plt.axis('equal')  # Забезпечує рівні пропорції вісей для отримання кругової форми
        #   Виведення таблиці з повними назвами (легенда)
        plt.legend(labels, loc='upper center', bbox_to_anchor=(0.5, -0.01))
        plt.tight_layout()

        # Зберігаємо діаграму у буфер пам'яті
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        buf.seek(0)
        # Кодуємо графік у формат base64
        encoded_diagram = base64.b64encode(buf.read())

        return encoded_diagram

    @staticmethod
    def get_report(params, orders):
        data = []
        total_sales_money = 0
        # --- Обсяги продажу за період по групам -сумма грошей
        date_start = params.get('date_start')
        date_end = params.get('date_end')
        if date_start and date_end:
            # --- Формуємо список проданих товарів за період з date_0(включно) до дати звіту(включно)
            #     по рядках проведених видаткових накладних
            sale_items_list = (
                db.session.query(
                    Item.group_id, GroupItem.group_name,
                    func.sum(EinvoiceRow.quantity * EinvoiceRow.price).label('sales_money_group')
                ).join(Einvoice).join(Item).join(GroupItem).filter(
                    Einvoice.doc_date_approve >= date_start, Einvoice.doc_date_approve <= date_end, Einvoice.doc_status == 1
                ).group_by(Item.group_id, GroupItem.group_name).all()
            )
            #  --- прохрдимо по всіх отриманих рядках та формуємо звіт
            for row in sale_items_list:
                total_sales_money += row.sales_money_group
                data.append({'id': row.group_id, 'group_name': row.group_name,
                             'sales_money_group': row.sales_money_group}
                            )
        #  сортуємо по id
        data = sorted(data, key=lambda x: x['sales_money_group'], reverse=True)

        image_diagram = RepSaleGroup.get_circle_diagram(data)

        #  додаємо підсумковий рядок
        if total_sales_money:
            data.append({'id': '', 'group_name': '<b>ЗАГАЛЬНИЙ ОБСЯГ ПРОДАЖУ</b>',  'sales_money_group': f"<b>{total_sales_money}</b>"})

        return data, image_diagram


class RepSaleGroupSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'group_name', 'sales_money_group')

    sales_money_group = fields.Function(
        serialize=lambda obj: format_number(obj['sales_money_group']) if obj is not None else ''
    )


# Schema's initializing
rep_sale_sroup_schema = RepSaleGroupSchema()
rep_sale_sroup_schemas = RepSaleGroupSchema(many=True)



class ProfitSaleItem:
    """ =====================  Прибутки за період ========================  """

    @staticmethod
    def get_report(params, orders):
        data = []
        # --- 1. Прибутки за період: по кожному товару  прибуток = сумма реалізації - сумма закупки по складських ордерах
        date_start = params.get('date_start')
        date_end = params.get('date_end')
        if date_start and date_end:
            # --- Формуємо список проданих товарів за період з date_0(включно) до дати звіту(включно)
            #     по рядках проведених видаткових накладних
            sale_items_list = (
                db.session.query(
                    EinvoiceRow.item_id, Item.item_name, Item.unit,
                    func.sum(EinvoiceRow.quantity).label('sales_item'),
                    func.sum(EinvoiceRow.quantity * EinvoiceRow.price).label('sales_money_item')
                ).join(Einvoice).join(Item).filter(
                    Einvoice.doc_date_approve >= date_start, Einvoice.doc_date_approve <= date_end, Einvoice.doc_status == 1
                ).group_by(EinvoiceRow.item_id, Item.item_name, Item.unit).all()
            )
            # --- Формуємо список товарів за період з date_0(включно) до дати звіту(включно)
            #     по рядках по складських ордерів по проведених видаткових накладних
            #     рахуємо вартість закіпки по кожному товару
            purchase_items_list = (
                db.session.query(
                    BalanceItem.item_id,
                    func.sum(WarehouseOrderRow.quantity * BalanceItem.cost).label('purchase_money_item')
                ).join(Einvoice).join(BalanceItem).filter(
                    Einvoice.doc_date_approve >= date_start, Einvoice.doc_date_approve <= date_end, Einvoice.doc_status == 1
                ).group_by(BalanceItem.item_id).all()
            )
            #  масив -- в словник для швидкого пошуку
            purchase_items_dict = dict(purchase_items_list)
            # ----------- формуємо звіт ----------
            total_profit = 0
            for item in sale_items_list:
                purchase_money_item = purchase_items_dict.get(item.item_id, 0)
                profit_item = item.sales_money_item - purchase_money_item
                total_profit += profit_item
                data.append({'id': item.item_id, 'item_name': item.item_name, 'unit': item.unit,
                             'sales_item': format_number(item.sales_item),
                             'sales_money_item': format_number(item.sales_money_item, 2),
                             'purchase_money_item': format_number(purchase_money_item, 2),
                             'profit_item': format_number(profit_item, 2)}
                            )
            #  сортуємо по id
            data = sorted(data, key=lambda x: x['id'])
            #  додаємо підсумковий рядок
            data.append({'id': '', 'item_name': '<b>ЗАГАЛЬНИЙ ПРИБУТОК ВІД ПРОДАЖУ</b>', 'unit': '<b>грн.</b>', 'sales_item': '',
                         'sales_money_item': '', 'purchase_money_item': '',
                         'profit_item': f"<b>{format_number(total_profit, 2)}</b>"})

        return data


class ProfitSaleItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'item_name', 'unit', 'sales_item', 'sales_money_item', 'purchase_money_item', 'profit_item')


# Schema's initializing
profit_sale_item_schema = ProfitSaleItemSchema()
profit_sale_items_schema = ProfitSaleItemSchema(many=True)

class ABCanalysis:
    """ ABC-аналіз по Виручці та Прибутку
        Виручка/Прибуток  Питома вага  Накопичена частка  Група
     """
    @staticmethod
    def get_report(params, orders):
        data = []
        # --- отримуємо звіт по прибуткам
        data_tmp = ProfitSaleItem.get_report(params, orders)
        data_tmp.pop()   # видаляємо останній рядок з підсумками
        # отримуємо параметр типу звіту
        type_rep = params.get('type_rep', '')
        # --- якщо дані отримані - проводимо ABC-аналіз
        #  type_rep == 'profit'  - по прибутку, '' - по виручці
        if data_tmp:
            # data = {'id', 'item_name', 'unit', 'sales_item', 'sales_money_item', 'purchase_money_item', 'profit_item'}
            #   1. формування масиву даних
            total_amount_indicator = 0
            for row in data_tmp:
                indicator = row['profit_item'] if type_rep == 'profit' else row['sales_money_item']
                amount_indicator = float(indicator.replace(' ',''))
                total_amount_indicator += amount_indicator
                data.append({'id': row['id'], 'item_name': row['item_name'], 'amount_indicator': amount_indicator})
            #   2. Сортуємо по показнику по спаданню
            data = sorted(data, key=lambda x: x['amount_indicator'], reverse=True)
            #   3. рахуємо відсотки та визначаємо групи
            groupA = 80
            groupB = 95
            cumulative_percentage = 0
            a = b = False
            for row in data:
                percentage = row['amount_indicator'] / total_amount_indicator * 100
                cumulative_percentage += percentage
                cumulative_percentage = cumulative_percentage
                #  групи ABC
                if cumulative_percentage <= groupB:
                    if cumulative_percentage <= groupA:
                        group = 'A'
                    else:
                        if not a:
                            group = 'A'
                            a = True
                        else:
                            group = 'B'
                            b = True
                else:
                    if not a:
                        group = 'A'
                        a = True
                    elif not b:
                        group = 'B'
                        b = True
                    else:
                        group = 'C'
                # додаємо параметри
                row.update({'percentage': round(percentage, 2), 'cumulative_percentage': round(cumulative_percentage, 2),  'group': group})

        # -----
        return data


class ABCanalysisSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'item_name', 'amount_indicator',  'percentage', 'cumulative_percentage',  'group')

# Schema's initializing
abc_analysis_schema = ABCanalysisSchema()
abc_analysis_schemas = ABCanalysisSchema(many=True)


'''
  --- Приклад sum group by
receipt_item_list = (
    db.session.query(PinvoiceRow.item_id, Item.item_name, Item.unit, Item.service, func.sum(PinvoiceRow.quantity)).join(
            Pinvoice).join(Item).filter(
            Pinvoice.doc_date_approve >= date_rep0, Pinvoice.doc_date_approve <= date_rep
        ).group_by(PinvoiceRow.item_id).all()
)
'''
