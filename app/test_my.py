
# data = [
#     {
#       "id": 0,
#       "name_status": "Створена"
#     },
#     {
#       "id": 1,
#       "name_status": "Проведена"
#     },
# ]
#
# filtered_dict = {item["id"]: item["name_status"] for item in data if item["id"] == 1}
#
# print(filtered_dict)
import codecs
import os, json


# class Menu:
#     """ ---  Головне меню ---"""
#     class query:
#         @staticmethod
#         def all():
#             file_json = 'menu.json'
#             menu = {}
#             if os.path.isfile(file_json):
#                 with codecs.open(file_json, 'r', 'utf-8') as file_data:
#                     menu = json.load(file_data)
#             return menu
#
# class StatusDoc:
#     """ ---  Статус накладної ---"""
#     class query:
#         @staticmethod
#         def all():
#             file_json = '.\status_doc.json'
#             status_doc = {}
#             if os.path.isfile(file_json):
#                 with codecs.open(file_json, 'r', 'utf-8') as file_data:
#                     status_doc = json.load(file_data)
#             return status_doc
#         @staticmethod
#         def get(pk):
#             status_list = StatusDoc.query.all()
#             status = {item["id"]: item["name_status"] for item in status_list if item["id"] == pk}
#             return status.get(pk, '')
# s = StatusDoc.query.get(0)
# print(s)

# options = '{"order":["id"],"paginator":{"page":1,"limit":5}}'
# options = json.loads(options)
#
# if 'order' in options:
#     param = options['order'][0]
#     desc = 'desc' in param
#     if desc:
#         field_name = param.split(' ')[0]
#     else:
#         field_name = param
# print(field_name,desc)