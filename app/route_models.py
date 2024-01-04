from .models import *
from .reports import *

""" ---------- Models list для автоматичного routing ---------- """
Models = {}
Models['menu'] = {'class': Menu}
Models['status_doc'] = {'class': StatusDoc}
Models['client'] = {'class': Customer, 'schema': customer_schema, 'schemas': customers_schema}
Models['item'] = {'class': Item, 'schema': item_schema, 'schemas': items_schema}
Models['unit'] = {'class': Unit, 'schema': unit_schema, 'schemas': units_schema}
Models['group_item'] = {'class': GroupItem, 'schema': group_item_schema, 'schemas': group_items_schema}

Models['pinvoice'] = {'class': Pinvoice, 'schema': pinvoice_schema, 'schemas': pinvoices_schema}
Models['pinvoice_row'] = {'class': PinvoiceRow, 'schema': pinvoice_row_schema, 'schemas': pinvoice_rows_schema}
Models['einvoice'] = {'class': Einvoice, 'schema': einvoice_schema, 'schemas': einvoices_schema}
Models['einvoice_row'] = {'class': EinvoiceRow, 'schema': einvoice_row_schema, 'schemas': einvoice_rows_schema}
Models['wh_order_row'] = {'class': WarehouseOrderRow, 'schema': warehouse_order_row_schema, 'schemas': warehouse_order_rows_schema}

Models['balance_item'] = {'class': BalanceItem, 'schema': balance_item_schema, 'schemas': balance_items_schema}
Models['price_list'] = {'class': PriceList, 'schema': price_list, 'schemas': price_lists}
Models['price_short'] = {'class': PriceList, 'schema': price_short, 'schemas': price_shorts}

""" ---------- Reports list для автоматичного routing звітів---------- """
ReportModels = {}
ReportModels['rep_balance_item'] = {'class': RepBalanceItem, 'schema': rep_balance_item_schema, 'schemas': rep_balance_items_schema}
ReportModels['rep_circulation_item'] = {'class': RepCirculationItem, 'schema': rep_circulation_item_schema, 'schemas': rep_circulation_items_schema}

ReportModels['rep_sale_item'] = {'class': RepSaleItem, 'schema': rep_sale_item_schema, 'schemas': rep_sale_items_schema}
ReportModels['profit_sale_item'] = {'class': ProfitSaleItem, 'schema': profit_sale_item_schema, 'schemas': profit_sale_items_schema}

ReportModels['abc_analysis'] = {'class': ABCanalysis, 'schema': abc_analysis_schema, 'schemas': abc_analysis_schemas}

ReportModels['rep_sale_sroup'] = {'class': RepSaleGroup, 'schema': rep_sale_sroup_schema, 'schemas': rep_sale_sroup_schemas}
