from flask import render_template, jsonify, request, send_from_directory
from . import app
from .models import *
from .route_models import Models


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
    print(request.json)
    # створюємо обєкт моделі
    try:
        new_data = Models[model]['class'](**request.json)
        print(new_data)
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
@app.route('/<string:model>/<pk>/', methods=['GET'])
def get_data(model, pk=''):
    """ --- Отримання даних з будь-якої моделі (таблиці) ---
        model - модель/таблиця
        pk - значення primary key  """
    data = None
    print('get pk= ', pk)
    if model in Models:
        # ------- Видача одного запису ---------
        # пошук запису по primary key
        if pk:
            data = Models[model]['class'].query.get(pk)
            # переводимо в json згідно зі схемою
            if 'schema' in Models[model]:
                json_data = Models[model]['schema'].jsonify(data)
            else:
                # або без схеми
                json_data = jsonify(data)
        # -------- Видача декількох записів таблиці -------
        else:
            # виводимо всі записи
            data = Models[model]['class'].query.all()

            # переводимо в json згідно зі схемою
            if 'schemas' in Models[model]:
                json_data = Models[model]['schemas'].jsonify(data)
            else:
                # або без схеми
                json_data = jsonify(data)
    else:
        json_data = jsonify({'error': f"Невідома модель <{model}>"})

    return json_data #, 200 if data else 404


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
    # пошук запису для оновлення
    data = Models[model]['class'].query.get(pk)
    if not data:
        return jsonify([{'error': f"Запис з pk={pk} в моделі <{model}> не знайдено!"}]), 404

    #  -- перевірка, чи існує метод з іменем "update" у класі
    if 'update' in dir(Models[model]['class']):
        Models[model]['class'].update(data, request.json)
    else:
        # дані з request.json копіюємо до відповідних атрибутів об'єкту data
        for field in request.json:
            setattr(data, field, request.json.get(field))

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
