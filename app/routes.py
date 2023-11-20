from flask import render_template, jsonify, request, send_from_directory
from . import app
from .models import *
from .route_models import Models
from sqlalchemy import or_

# ----------------  Маршрути ------------------
# ----- Головна сторінка  FrontEnd
@app.route('/')
@app.route('/home')
def serve_index():
    # Використовуємо функцію send_from_directory для відправки файла index.html із каталогу 'static'
    return send_from_directory('static','index.html')
    # return render_template('index.html')

##############################
# Create
##############################
@app.route('/<string:model>/', methods=['POST'])
def create_data(model):
    """ --- Створення запису в моделі (таблиці) по переданому json---
        model - модель/таблиця
        request.json - дані для нового запису
    """
    # Десеріалізуємо дані з JSON згідно схеми
    dd = request.get_json()
    request_data = Models[model]['schema'].load(request.get_json())
    # створюємо обєкт моделі
    try:
        new_data = Models[model]['class'](**request_data)
    except Exception as e:
        # обробка помилки переданих даних
        print(str(e))
        return jsonify({'errors': ['Bad data', str(e)]}), 400

    # зберігаємо дані в таблиці
    try:
        db.session.add(new_data)
        db.session.commit()
        return Models[model]['schema'].jsonify(new_data), 200
    except Exception as e:
        # відкат при помилці
        db.session().rollback()
        return jsonify({'errors': ['Can not create', str(e)]}), 409


##############################
# Read
##############################
@app.route('/<string:model>/', methods=['GET'])
@app.route('/<string:model>/<options>', methods=['GET'])
# @app.route('/<string:model>/<pk>', methods=['GET'])
# @app.route('/<string:model>/<pk>/<options>', methods=['GET'])
def get_data(model, pk='', options=None):
    """ --- Отримання даних з будь-якої моделі (таблиці) ---
        model - модель/таблиця
        pk - значення primary key
        options - додаткові параметри
        Посторінковий + Сортування + Пошук
            http://localhost:5000/client/
            {"paginator":{"page":1,"limit":5},"order":["name"],"search":[{"field":"name","value":"At","operator":"LIKE"}]}
            http://localhost:5000/client/0/%7B%22search%22:[%7B%22phone%22:%22name%22,%22value%22:%22+22%22%7D]%7D
            http://localhost:5000/client/0/{"paginator":{"page":1,"limit":5},"order":["id"],"search":[{"field":"phone","value":"+22","operator":"LIKE"}]}

    """
    data = None
    if model in Models:
        # ------- Видача одного запису ---------
        # пошук запису по primary key
        if pk and pk != '0':
            data = Models[model]['class'].query.get(pk)
            # переводимо в json згідно зі схемою
            if 'schema' in Models[model]:
                json_data = Models[model]['schema'].jsonify(data)
            else:
                # або без схеми
                json_data = jsonify(data)
        # -------- Видача декількох записів таблиці -------
        else:
            record_count = ''
            # виводимо записи
            if not options:
                # --- нема додаткових параметрів
                data = Models[model]['class'].query.all()
            else:
                # ----- є додаткові параметри  ---
                options = json.loads(options)
                data = []
                # --- є пошук
                filters = []
                if 'search' in options:
                    for param in options['search']:
                        field_name = param.get('field')
                        fvalue = param.get('value')
                        if field_name and fvalue:
                            field = getattr(Models[model]['class'], field_name, None)
                            if field is not None:
                                filters.append(field.ilike(f"%{param['value']}%"))
                    if filters:
                        data = Models[model]['class'].query.filter(or_(*filters)).all()
                # ---- є пагінатор
                paginator = False
                if 'paginator' in options:
                    if 'limit' in options['paginator'] and 'page' in options['paginator']:
                        limit = options['paginator']['limit']
                        offset = limit * (options['paginator']['page'] - 1)
                        if filters:
                            data = Models[model]['class'].query.filter(or_(*filters)).offset(offset).limit(limit).all()
                            # --- загальна кількість записів в запиті
                            total_records = Models[model]['class'].query.filter(or_(*filters)).count()
                        else:
                            data = Models[model]['class'].query.offset(offset).limit(limit).all()
                            # --- загальна кількість записів в запиті
                            total_records = Models[model]['class'].query.count()
                        record_count = {'_total_records_': total_records}
                        paginator = True

            # переводимо в json згідно зі схемою
            if 'schemas' in Models[model]:
                json_data = Models[model]['schemas'].jsonify(data).json
            else:
                # або без схеми
                json_data = jsonify(data).json

            # --- загальна кількість записів в запиті
            if record_count:
                json_data.append(record_count)
    else:
        json_data = jsonify({'error': f"Невідома модель <{model}>"})

    return json.dumps(json_data)


'''
#-------------------
def read(self, id=None, data=None):
    def makeWhere(data=None):
        result = ''
        if data != None:
            if 'search' in data:
                fieldsList = []
                for item in data['search']:
                    # item['operator']  !!! not used yet. Just 'Like' yet
                    fieldsList.append("CAST({0} as TEXT) LIKE '%{1}%'".format(item['field'], item['value']))
                separator = ' OR '
                result = ' WHERE({0})'.format(separator.join(fieldsList))
        return result

    def makeOrder(data=None):
        result = ''
        if data != None:
            if 'order' in data:
                separator = ','
                fieldsList = separator.join(data['order'])
                result = ' ORDER BY {0}'.format(fieldsList)

        return result

    def makeLimit(data=None):
        result = ''
        if data != None:
            if 'paginator' in data:
                if 'limit' in data['paginator'] and 'page' in data['paginator']:
                    limit = data['paginator']['limit']
                    offset = limit * (data['paginator']['page'] - 1)
                    result = ' LIMIT {0} OFFSET {1}'.format(limit, offset)

        return result

    cursor = self.connection.cursor()
    if id == None:
        try:
            data = json.loads(data)
        except Exception:
            data = None

        record_count = None

        if data != None:
            if 'paginator' in data:
                SQL_COUNT_REC = 'SELECT COUNT(*) FROM {0}{1};'.format(self.objName, makeWhere(data))
                cursor.execute(SQL_COUNT_REC)
                rows = cursor.fetchone()
                record_count = {'_total_records_': rows[0]}

            SQL = 'SELECT * FROM {0}{1}{2}{3};'.format(self.objName, makeWhere(data), makeOrder(data), makeLimit(data))
        else:
            SQL = 'SELECT * FROM {0};'.format(self.objName)

        cursor.execute(SQL)
        field_names = list(map(lambda x: x[0], cursor.description))
        rows = cursor.fetchall()
        records = []
        for row in rows:
            field_i = 0
            record = {}
            for field in field_names:
                record[field] = row[field_i]
                field_i += 1
            records.append(record)

        if record_count != None:
            records.append(record_count)

        return records
    else:
        cursor.execute('SELECT * FROM {0} WHERE(id={1});'.format(self.objName, id))
        field_names = list(map(lambda x: x[0], cursor.description))
        rows = cursor.fetchall()
        record = {}
        for row in rows:
            field_i = 0
            for field in field_names:
                record[field] = row[field_i]
                field_i += 1

        return record

# -------------
'''


##############################
# Update
##############################
@app.route('/<string:model>/<pk>/', methods=['PUT'])
def update_data(model, pk):
    """ --- Оновлення даних з будь-якої моделі (таблиці) ---
        model - модель/таблиця
        pk - значення primary key запису
        request.json - дані для оновлення
    """
    print('pk= ', pk)
    dd = request.get_json()
    data_new = Models[model]['schema'].load(request.get_json())
    # пошук запису для оновлення
    data = Models[model]['class'].query.get(pk)
    if not data:
        return jsonify([{'error': f"Запис з pk={pk} в моделі <{model}> не знайдено!"}]), 404

    #  -- перевірка, чи існує метод з іменем "update" у класі
    if 'update' in dir(Models[model]['class']):
        Models[model]['class'].update(data, request.json)
    else:
        dd = request.get_json()
        # Десеріалізуємо дані з JSON згідно схеми
        # data_new = Models[model]['schema'].load(request.get_json())

        # дані з item_data копіюємо до відповідних атрибутів об'єкту data
        for field in data_new:
            setattr(data, field, data_new[field])

        # # дані з request.json копіюємо до відповідних атрибутів об'єкту data
        # for field in request.json:
        #     setattr(data, field, request.json.get(field))

    db.session.commit()
    # повертаємо відредагований обєкт
    return Models[model]['schema'].jsonify(data), 200


##############################
# Delete
##############################
@app.route('/<string:model>/<pk>/', methods=['DELETE'])
def delete_data(model, pk):
    data = Models[model]['class'].query.get(pk)
    if not data:
        return jsonify([{'error': f"Запис з pk={pk} в моделі <{model}> не знайдено!"}]), 404

    db.session.delete(data)
    db.session.commit()
    return Models[model]['schema'].jsonify(data), 200

##############################
# Заповнення бази
##############################
# @app.route('/add_data/<string:model>/')
# def add_data(model):
#     data_list = [
#     ]
#     count = 0
#     for data in data_list:
#         try:
#             new_data = Models[model]['class'](**data)
#             print(new_data)
#         except Exception as e:
#             # обробка помилки переданих даних
#             print(str(e))
#             return jsonify({'errors': ['Bad data', str(e)]}), 400
#
#         # зберігаємо дані в таблиці
#         try:
#             db.session.add(new_data)
#             db.session.commit()
#             count +=1
#         except Exception as e:
#             # відкат при помилці
#             db.session().rollback()
#             return jsonify({'errors': ['Can not create', str(e)]}), 409
#
#     return jsonify({'info': f"Додано {count} записів"}), 200


'''
---- Пагінація. Сторінка #1, кількість рядків на сторінку: 5:
    http://localhost:5000/client/{"paginator":{"page":1,"limit":5}}

--------Сортування. Сортування по полю name, desc - сортування у зворотньому напрямку:
    http://localhost:5000/client/{"order":["name desc"]}

--- Пошук. Пошук по полю name, шукається "At", з використанням оператора LIKE. У прикладах реалізований тільки оператора LIKE. 
Але закладена можливість у майбутньому додати інші оператори > < = і т.д.:
    http://localhost:5000/client/{"search":[{"field":"name","value":"At","operator":"LIKE"}]}

Також пошук і сортування можна виконувати за декількома колонками.

-----Посторінковий + Сортування + Пошук
    http://localhost:5000/client/
    {"paginator":{"page":1,"limit":5},"order":["name"],"search":[{"field":"name","value":"At","operator":"LIKE"}]}

Зверніть увагу, що у разі посторінкового виводу даних, у результат додається рядок зі значенням _total_records_ - загальна кількість 
рядків на всіх сторінках відповідного запиту. Фронтенд використовує _total_records_ для коректного 
відображення навігації по сторінках (див. mixin crud_front)

'''