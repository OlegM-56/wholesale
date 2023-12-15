from sqlalchemy import func

from .models import *


class RepBalanceItem:
    """ ---  Залишки товарів на дату ---  """

    @staticmethod
    def get_list_data(date_rep, date_rep0=date(2000,1,1)):
        data = []
        # --- Формуємо список items з кількістю приходу за період з date_rep0 до дати звіту включно
        # рахуємо суму надходження для товарів по рядкам прибуткових накладних
        # використовуємо функцію sum, щоб підрахувати суму по полю quantity
        receipt_item_list = (
            db.session.query(PinvoiceRow.item_id, Item.item_name, Item.unit, Item.service, func.sum(PinvoiceRow.quantity)).join(
                    Pinvoice).join(Item).filter(
                    Pinvoice.doc_date_approve >= date_rep0, Pinvoice.doc_date_approve <= date_rep
                ).group_by(PinvoiceRow.item_id).all()
        )
        # --- Формуємо список видатків товарів за період з date_0(не включно) до дати звіту(включно)
        expense_item_list = (
            db.session.query(EinvoiceRow.item_id, func.sum(EinvoiceRow.quantity)).join(
                Einvoice).join(Item).filter(
                Einvoice.doc_date_approve >= date_rep0,
                Einvoice.doc_date_approve <= date_rep
            ).group_by(EinvoiceRow.item_id).all()
        )
        expense_item_dict = dict(expense_item_list)
        #  (1, 'Рюкзак Tatonka Cycle pack', 'шт.', False, 141.0)
        for item_id, item_name, unit, service, sum_receipt in receipt_item_list:
            # --- пропускаємо послуги
            if service: continue
            # видаток
            sum_expense = expense_item_dict.get(item_id)
            if sum_expense is None: sum_expense = 0
            # залишок товару =  сума приходів - сума видатків за період до дати звіту включно
            balance_item = sum_receipt - sum_expense
            data.append({'id': item_id, 'item_name': item_name, 'unit': unit, 'start_balance_item': 0,
                         'receipt_item': sum_receipt, 'expense_item': sum_expense, 'balance_item': balance_item}
                        )
        return data

    """ ---  Залишки товарів на дату або Оборотна відомість за період ---  
             параметри звіту: params= {"date_rep":"10-12-2023"} або {"date_start":"10-12-2023", "date_end":"10-12-2023"}  """

    @staticmethod
    def get_report(params, orders):
        # ---  Залишки товарів на дату ----
        date_rep = params.get('date_rep')
        if date_rep:
            return RepBalanceItem.get_list_data(datetime.strptime(date_rep, '%Y-%m-%d').date())

        #  --- Оборотна відомість за період ---
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
                                 'start_balance_item': item_ends['balance_item'],
                                 'receipt_item': 0, 'expense_item': 0, 'balance_item': item_ends['balance_item']}
                                )
            return data
        # ---
        if not date_rep: return []


class RepBalanceItemSchema(ma.Schema):
    """ schema """

    class Meta:
        fields = ('id', 'item_name', 'unit', 'start_balance_item', 'receipt_item', 'expense_item', 'balance_item')


# Schema's initializing
rep_balance_item_schema = RepBalanceItemSchema()
rep_balance_items_schema = RepBalanceItemSchema(many=True)
