from sqlalchemy import func

from .models import *


class RepBalanceItem:
    """ ---  Залишки товарів на дату ---  """
    @staticmethod
    def get_report(params, orders):
        data = []
        # параметри звіту:  order = ["id"],  params= {"date_rep":"10-12-2023"}
        date_rep = datetime.strptime(params.get('date_rep'), '%Y-%m-%d')
        # date_rep = date(2023, 12, 11)
        if not date_rep: return data
        # --- Формуємо список items з кількістю приходу за період до дати звіту включно
        # рахуємо суму надходження для товарів по рядкам прибуткових накладних
        # використовуємо функцію sum, щоб підрахувати суму по полю quantity
        receipt_item_list = (
            db.session.query(PinvoiceRow.item_id, Item.item_name, Item.unit, Item.service, func.sum(PinvoiceRow.quantity)).join(
                            Pinvoice).join(Item).filter(Pinvoice.doc_date_approve <= date_rep).group_by(PinvoiceRow.item_id).all()
        )
        # --- Формуємо список видатків товарів за період до дати звіту включно
        expense_item_list = (
            db.session.query(EinvoiceRow.item_id, func.sum(EinvoiceRow.quantity)).join(
                            Einvoice).join(Item).filter(Einvoice.doc_date_approve <= date_rep).group_by(EinvoiceRow.item_id).all()
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
            data.append({'id': item_id, 'item_name': item_name, 'unit': unit,
                         'receipt_item': sum_receipt, 'expense_item': sum_expense, 'balance_item': balance_item}
                        )
        return data


class RepBalanceItemSchema(ma.Schema):
    """ schema """
    class Meta:
        fields = ('id', 'item_name', 'unit', 'receipt_item', 'expense_item', 'balance_item')


# Schema's initializing
rep_balance_item_schema = RepBalanceItemSchema()
rep_balance_items_schema = RepBalanceItemSchema(many=True)
