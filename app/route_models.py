from .models import *
from .reports import *

""" ---------- Models list для автоматичного routing ---------- """
Models = {
    'menu': {'class': Menu}, 'status_doc': {'class': StatusDoc},
    'client': {'class': Customer, 'schema': customer_schema, 'schemas': customers_schema},
    'item': {'class': Item, 'schema': item_schema, 'schemas': items_schema},
    'unit': {'class': Unit, 'schema': unit_schema, 'schemas': units_schema},
    'group_item': {'class': GroupItem, 'schema': group_item_schema, 'schemas': group_items_schema},
    'pinvoice': {'class': Pinvoice, 'schema': pinvoice_schema, 'schemas': pinvoices_schema},
    'pinvoice_row': {'class': PinvoiceRow, 'schema': pinvoice_row_schema, 'schemas': pinvoice_rows_schema},
    'einvoice': {'class': Einvoice, 'schema': einvoice_schema, 'schemas': einvoices_schema},
    'einvoice_row': {'class': EinvoiceRow, 'schema': einvoice_row_schema, 'schemas': einvoice_rows_schema},
    'wh_order_row': {'class': WarehouseOrderRow, 'schema': warehouse_order_row_schema, 'schemas': warehouse_order_rows_schema},
    'balance_item': {'class': BalanceItem, 'schema': balance_item_schema, 'schemas': balance_items_schema},
    'price_list': {'class': PriceList, 'schema': price_list, 'schemas': price_lists},
    'price_short': {'class': PriceList, 'schema': price_short, 'schemas': price_shorts}
}

""" ---------- Reports list для автоматичного routing звітів---------- """
ReportModels = {
    'rep_balance_item': {'class': RepBalanceItem},
    'rep_circulation_item': {'class': RepCirculationItem},
    'rep_sale_item': {'class': RepSaleItem},
    'profit_sale_item': {'class': ProfitSaleItem},
    'abc_analysis': {'class': ABCanalysis},
    'rep_sale_sroup': {'class': RepSaleGroup}
}
