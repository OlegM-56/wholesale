from .models import *
from .reports import *

""" ---------- Models list для автоматичного routing ---------- """
Models = {}
Models['menu'] = {'class': Menu}
Models['status_doc'] = {'class': StatusDoc}
Models['client'] = {'class': Customer, 'schema': customer_schema, 'schemas': customers_schema}
Models['item'] = {'class': Item, 'schema': item_schema, 'schemas': items_schema}
Models['unit'] = {'class': Unit, 'schema': unit_schema, 'schemas': units_schema}
Models['pinvoice'] = {'class': Pinvoice, 'schema': pinvoice_schema, 'schemas': pinvoices_schema}
Models['pinvoice_row'] = {'class': PinvoiceRow, 'schema': pinvoice_row_schema, 'schemas': pinvoice_rows_schema}
Models['einvoice'] = {'class': Einvoice, 'schema': einvoice_schema, 'schemas': einvoices_schema}
Models['einvoice_row'] = {'class': EinvoiceRow, 'schema': einvoice_row_schema, 'schemas': einvoice_rows_schema}
Models['wh_order_row'] = {'class': WarehouseOrderRow, 'schema': warehouse_order_row_schema, 'schemas': warehouse_order_rows_schema}
Models['balance_item'] = {'class': BalanceItem, 'schema': balance_item_schema, 'schemas': balance_items_schema}

""" ---------- Reports list для автоматичного routing ---------- """
ReportModels = {}
ReportModels['rep_balance_item'] = {'class': RepBalanceItem, 'schema': rep_balance_item_schema, 'schemas': rep_balance_items_schema}
