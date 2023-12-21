from .models import *


class RepBalanceItem:
    """ =====================  Залишки та обороти товарів на дату та за період ========================  """

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
                         'receipt_item': format_number(sum_receipt), 'expense_item': format_number(sum_expense),
                         'balance_item': format_number(balance_item)}
                        )
        return data

    """ ---  Залишки товарів на дату або Оборотна відомість за період ---  
             параметри звіту: params= {"date_rep":"10-12-2023"} або {"date_start":"10-12-2023", "date_end":"10-12-2023"}  """

    @staticmethod
    def get_report(params, orders):
        """ Отримання звітів: """
        # ---  1. Залишки товарів на дату ----
        date_rep = params.get('date_rep')
        if date_rep:
            return RepBalanceItem.get_list_data(datetime.strptime(date_rep, '%Y-%m-%d').date())

        #  --- 2. Оборотна відомість за період ---
        date_start = params.get('date_start')
        date_end = params.get('date_end')
        if date_start and date_end:
            date_start = datetime.strptime(date_start, '%Y-%m-%d').date()
            date_end = datetime.strptime(date_end, '%Y-%m-%d').date()
            if date_start > date_end:
                raise ValueError(f"Початкова дата періоду більше за кінцеву: {date_start} > {date_end} ! ")
            # -- початкові залишки
            data_items_ends = RepBalanceItem.get_list_data(date_start - timedelta(days=1))
            data = RepBalanceItem.get_list_data(date_end, date_start)
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
            return sorted(data, key=lambda x: x['id'])
        # --- якщо не задано параметрів звіту
        return []


class RepBalanceItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'item_name', 'unit', 'start_balance_item', 'receipt_item', 'expense_item', 'balance_item')


# Schema's initializing
rep_balance_item_schema = RepBalanceItemSchema()
rep_balance_items_schema = RepBalanceItemSchema(many=True)


class RepSaleItem:
    """ =====================  Обсяги продажу товарів за період ========================  """

    @staticmethod
    def get_report(params, orders):
        data = []
        total_sales_money = 0
        # --- 1. Обсяги продажу товарів за період - кількість та сумма грошей
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

'''
  --- Приклад sum group by
receipt_item_list = (
    db.session.query(PinvoiceRow.item_id, Item.item_name, Item.unit, Item.service, func.sum(PinvoiceRow.quantity)).join(
            Pinvoice).join(Item).filter(
            Pinvoice.doc_date_approve >= date_rep0, Pinvoice.doc_date_approve <= date_rep
        ).group_by(PinvoiceRow.item_id).all()
)
'''
