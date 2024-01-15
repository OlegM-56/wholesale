Vue.component('main-page', {
  template: `
<div>
  <h2 class="center-text">Про проект</h2>
  <p>
    Представляю Вашій увазі свій Pet-проект "Оптова торгівля".<br>
    Проект являє собою реалізацію тестового завдання для Python–програмістів, яке пропонувалося одним з роботодавйів на work.ua.<br>
    Проект реалізований у форматі WEB-додатка та опублікований на pythonanywhere.com.<br><br>
    В розділі <b>ІНФОРМАЦІЯ</b> Головного меню є опис Задачі та опис Реалізації задачі.<br>
    Решта розділів стосуються безпосередньо роботи додатка.
  </p>
  <hr>
  <p class="italic">
   Розробник:  Олег МИХАЙЛИК<br>
   e-mail:  mihaylik@gmail.com
  </p>
</div>`,
  mounted: function() {
    store.commit('title', 'Головна сторінка')
  }
})

app.componentsLoaded('main-page')


Vue.component('task_description', {
  template: `
<div>
  <h2 class="center-text">Тестове завдання</h2>
  <h5>Постановка задачі</h5>
  <p>
    Компанія займається оптовою торгівлею. Надходження товарів відображається документом "Прибуткова накладна", продаж - "Видаткова накладна". Крім продажу товару можуть надаватися додаткові послуги, наприклад, з доставки. І послуги, і товари зазначаються в одній табличній частині.
  </p>
  <p>
    При проведенні видаткової накладної при нестачі товару необхідно видавати відповідне попередження із зазначенням кількості нестачі та не дозволяти проводити документ.
  </p>
  <p>
     Списання собівартості має бути організоване за партіями по методу FIFO.
 </p>
  <p>
    Вважається, що документи заднім числом не запроваджуються, але старі документи можуть неоперативно переводитися.
  </p>
  <p>
    Необхідно побудувати звіт про продаж товарів за період, прибутки за період та залишки товару на зазначену дату.
  </p>
  <p>
    Зробити відео де розповісти про свій шлях вирішення задачі.</p>
  <h5>Виконання задачі</h5>
  <p>
    Потрібно побудувати структуру бази даних в графічному вигляді та продемонструвати її.<br>
    На основі графічної структури бази даних, створити SQL для створення таблиць для тієї базі даних, яку бажаєте використовувати для вирішення питання. Допускаються будь-які бази даних.<br>
    Веб-рішення можна будувати на тому фреймворку, який Вам найбільш зручний для виконання цієї задачі. Але обов’язково, щоб фреймворк був з відкритим похідним кодом.<br>
    Виконану роботу потрібно продемонструвати в вигляді веб-сторінки по доступному з інтернет URL.<br>
    При виконанні завдання використовувати об’єктно-орієнтований підхід.
  </p>
  <h5>Вимоги для варіанту Python–програмістів:</h5>
  <p>
    <ul>
        <li>Мова програмування: Python.
        <li>Flask.
        <li>ORM: Alchemy.
        <li>База даних (на вибір): SQLite, MySQL, Postgresql.
        <li>Frontend (на вибір): Vue, React, або подібні рішення.
        <li>В таблицях передбачати всі можливі операції: додавання, редагування, видалення. В формах - перевірку формату введення, списки, виклик довідників.
        <li>При проектуванні бази даних відштовхуватись від принципів побудови реляційної бази даних.
        <li>Побудова звітів - будь-яким засобом (на свій вибір).
    </ul>
  </p>

</div>`,
  mounted: function() {
    store.commit('title', 'Постановка задачі')
  }
})

app.componentsLoaded('task_description')


Vue.component('database', {
  template: `
<div>
  <h2 class="center-text">Формування бази даних</h2>
  <h5>Структура бази даних</h5>
  <p>
    <img src="/static/img/BD.svg">
  </p>
  <h5>SQL для створення таблиць бази даних</h5>
  <p>
   Використовуємо систему управління базами даних SQLite.
   </p>
  <pre>
        -- ===================  ДОВІДНИКИ ==================
          --- Клієнти ---
        CREATE TABLE "customer" (
            "id"	INTEGER NOT NULL,
            "customer_name"	VARCHAR(70) NOT NULL,
            "customer_address"	VARCHAR(100) NOT NULL,
            "phone"	VARCHAR(20),
            PRIMARY KEY("id")
        );
           --- Одиниці виміру ---
        CREATE TABLE "unit" (
            "unit_code"	VARCHAR(10) NOT NULL,
            "unit_name"	VARCHAR(15) NOT NULL,
            PRIMARY KEY("unit_code")
        );
          --- Групи товарів/послуг ---
        CREATE TABLE "group_item" (
            "id"	INTEGER NOT NULL,
            "group_name"	VARCHAR(50) NOT NULL,
            "group_description"	VARCHAR(150),
            PRIMARY KEY("id")
        );
          ---  Товари та послуги ---
        CREATE TABLE "item" (
            "id"	INTEGER NOT NULL,
            "item_name"	VARCHAR(50) NOT NULL,
            "unit"	VARCHAR(10) NOT NULL,
            "service"	BOOLEAN NOT NULL,
            "item_description"	VARCHAR(150),
            "group_id"	INTEGER NOT NULL,
            CONSTRAINT "fk_item_group" FOREIGN KEY("group_id") REFERENCES "group_item"("id"),
            FOREIGN KEY("unit") REFERENCES "unit"("unit_code"),
            PRIMARY KEY("id")
        );
          --- Актуальний Прайс-лист ---
        CREATE TABLE "price_list" (
            "id"	INTEGER NOT NULL,
            "item_id"	INTEGER NOT NULL,
            "is_actual"	BOOLEAN NOT NULL,
            "price"	FLOAT NOT NULL,
            CONSTRAINT "fk_price_list_item" FOREIGN KEY("item_id") REFERENCES "item"("id"),
            PRIMARY KEY("id")
        );
        -- ===================  ДОКУМЕНТИ ==================
          --- Прибуткова накладна ---"""
        CREATE TABLE "pinvoice" (
            "num_doc"	INTEGER NOT NULL,
            "doc_date"	DATE NOT NULL,
            "doc_status"	INTEGER NOT NULL,
            "doc_date_approve"	DATE,
            "custom_numdoc"	VARCHAR(30),
            "customer_id"	INTEGER NOT NULL,
            CONSTRAINT "fk_pinvoice_customer" FOREIGN KEY("customer_id") REFERENCES "customer"("id"),
            PRIMARY KEY("num_doc")
        );
          --- Прибуткова накладна, рядки ---
        CREATE TABLE "pinvoice_row" (
            "id"	INTEGER NOT NULL,
            "npp"	INTEGER NOT NULL,
            "quantity"	FLOAT NOT NULL,
            "price"	FLOAT NOT NULL,
            "item_id"	INTEGER NOT NULL,
            "pinvoice_id"	INTEGER NOT NULL,
            CONSTRAINT "fk_pinvoice_num_doc" FOREIGN KEY("pinvoice_id") REFERENCES "pinvoice"("num_doc"),
            CONSTRAINT "fk_pinvoice_row_item" FOREIGN KEY("item_id") REFERENCES "item"("id"),
            PRIMARY KEY("id")
        );
          --- Видаткова накладна ---
        CREATE TABLE "einvoice" (
            "num_doc"	INTEGER NOT NULL,
            "customer_id"	INTEGER NOT NULL,
            "doc_date"	DATE NOT NULL,
            "doc_status"	INTEGER NOT NULL,
            "doc_date_approve"	DATE,
            CONSTRAINT "fk_einvoice_customer" FOREIGN KEY("customer_id") REFERENCES "customer"("id"),
            PRIMARY KEY("num_doc")
        );
          --- Видаткова накладна, рядки ---
        CREATE TABLE "einvoice_row" (
            "id"	INTEGER NOT NULL,
            "einvoice_id"	INTEGER NOT NULL,
            "npp"	INTEGER NOT NULL,
            "item_id"	INTEGER NOT NULL,
            "quantity"	FLOAT NOT NULL,
            "price"	FLOAT NOT NULL,
            CONSTRAINT "fk_einvoice_num_doc" FOREIGN KEY("einvoice_id") REFERENCES "einvoice"("num_doc"),
            CONSTRAINT "fk_einvoice_row_item" FOREIGN KEY("item_id") REFERENCES "item"("id"),
            PRIMARY KEY("id")
        );
          --- Рядки Складського ордеру для списання залишків по партіях ---
        CREATE TABLE "warehouse_order_row" (
            "id"	INTEGER NOT NULL,
            "quantity"	FLOAT NOT NULL,
            "einvoice_id"	INTEGER NOT NULL,
            "einvoice_row_id" INTEGER NOT NULL,
            "party_id" INTEGER NOT NULL,
            CONSTRAINT "fk_wh_einvoice_num_doc" FOREIGN KEY("einvoice_id") REFERENCES "einvoice"("num_doc"),
            CONSTRAINT "fk_einvoice_row_order" FOREIGN KEY("einvoice_row_id") REFERENCES "einvoice_row"("id"),
            CONSTRAINT "fk_balance_order_row" FOREIGN KEY("party_id") REFERENCES "balance_item"("party_id"),
            PRIMARY KEY("id")
        );
          --- Залишки товарів по партіях ---
          -- Партія =  код товару+дата приходу +ціна приходу
        CREATE TABLE "balance_item" (
            "party_id"	INTEGER NOT NULL,
            "item_id"	INTEGER NOT NULL,
            "date_receipt"	DATE NOT NULL,
            "cost"	FLOAT NOT NULL,
            "quantity"	FLOAT NOT NULL,
            CONSTRAINT "fk_balance_item" FOREIGN KEY("item_id") REFERENCES "item"("id"),
            PRIMARY KEY("party_id")
        );
  </pre>
</div>`,
  mounted: function() {
    store.commit('title', 'База даних')
  }
})

app.componentsLoaded('database')


Vue.component('implementation', {
  template: `
<div>
  <h2 class="center-text">Виконання завдання</h2>
  <h3>Backend</h3>
  <p>
    Реалізовано на <b>FLASK</b>, який є Python-фреймворком з відкритим кодом.
  </p>
  <h5>Робота з Базою даних</h5>
  <p>
    Для роботи з БД використовував ORM (Object Relational Mapping) <b>SQLAlchemy</b>, яка зв'язує об'єкти PYTHON з обєктами бази даних,
    створюючи «віртуальну об'єктну базу даних». В результаті в своїй програмі ми оперуємо тільки об'єктами PYTHON, напряму не звертаємося до БД.
    SQLAlchemy автоматично виконує всі необхідні операції з БД.<br>
    Якщо нам буде потрібно змінити СУБД, то вносити зміни в програму не потрібно.
  </p>
  <p>
    Для створення таблиць Бази даних використовував моделі SQLAlchemy та розширення Migrate.<br>
    Це дозволяє автоматично створювати таблиці в БД на основі моделей SQLAlchemy та здійснювати міграцію бази даних при зміні моделей даних.<br>
    Маємо інструменти для створення та керування версіями бази даних, щоб зберегти та відстежувати зміни без втрати даних.<br>
    Міграція важлива при розвитку додатків, оскільки вона дозволяє оновлювати базу даних без необхідності перезавантаження чи втрати існуючої інформації.
    <br><br>
    Моделі БД - це об'єкти SQLAlchemy, пов'язані з базою даних, які також містять додаткові методи обробки.<br>
    Наприклад:<br>
    Модель 'Залишки товарів по партіях' містить метод коригування залишків при проведенні накладних.<br>
    Моделі Прибуткової та Видаткової накладних містять метод видалення рядків накладної перед видаленням заголовка накладної.
    <br><br>
    Моделі в файлах - це об'єкти Python, пов'язані з структурованими даними, які зберігаються в текстових файлах у форматі JSON.<br>
    Такі моделі дозволяють тільки читання даних. Для цього вони мають такі ж методи, як і моделі SQLAlchemy, та обробляються так само.<br>
    Таким чином реалізовано 'Головне меню' та довідник 'Статус накладної'.
  </p>
  <h5>Маршрути (Routes)</h5>
  <p>
    Для головної сторінки використовуємо функцію, яка передає клієнту із каталогу 'static' файл index.html з необхідними файлами Frontend.<br>
    Далі керування сторінками додатку здійснює Frontend.
    <br><br>
    Для обробки запитів к даним реалізовані універсальні роути CRUD:  Create, Read, Update, Delete.<br>
    В запитах CRUD викорустовуються http-методи:  POST, GET, PUT, DELETE.<br>
    В запиті передається назва моделі та пераметри, необхідні для обробки -  '/model/options'.<br>
    Є масив 'Models', який містить всю необхідну інформацію для автоматичної обробки запитів CRUD дл всіх моделей.
    <br><br>
    Для виконання додаткових операцій для будь-якої моделі використовуємо запит з http-методом PATCH.<br>
    Так реалізовано запит на проведення накладних.
    <br><br>
    Для отримання звітів створено універсальний роут '/report/rep_model/options' з http-методом GET.<br>
    В запиті передається назва моделі Звіту та необхідні пераметри.<br>
    Для кожного звіту створено об'єкт (модель) з методом 'get_report'.<br>
    Моделі для звітів також містяться в масиві 'Models', що дозволяє автоматично обробляти їх в універсальному роуті.
    <br><br>
    Обмін інформацією з Frontend здійснюється в форматі JSON. Для цього використовується <b>flask_marshmallow</b>.
    <br>Всі моделі Даних мають схеми, які визначають правила серилізації та десеріалізації даних.<br>
  </p>

  <h3>Frontend</h3>
  <p>
    Реалізовано на <b>VUE.js</b> ( v2.6.10 ), який є фреймворком, який працює на JavaScript, створений для розробки користувацьких інтерфейсів.<br>
    Всі ресурси для роботи Vue розміщені в каталозі проекту 'static/':<br>
    Системні файли Vue 'static/vue/':<br>
    <ul>
      <li><b>css</b> - таблиці стилів Vue
      <li><b>js</b> - бібліотеки та програмні модулі
    </ul>
    Користувацьки файли проекту 'static/vue-app/':<br>
    <ul>
      <li><b>app.js</b> - головний файл проекту, визначення роутів, та глобальних даних
      <li><b>app-components.js</b> - основні компоненти проекту, що містять візуалізацію інтерфейсу.
      <li><b>app-mixins.js</b> -  компоненти, які містять програмні методи і функції та використовуються в основних компонентах
      <li><b>info-pages.js</b> -  компоненти, які містять статичні сторінки
    </ul>
    Всі необхідні файли завантажуються з сервера при зверненні до головної сторінки 'index.html'.
  </p>
  <p>
    Головне меню додатку дає доступ до функцій, розбитих на розділи:
    <ul>
      <li>ДОВІДНИКИ
      <li>ДОКУМЕНТИ
      <li>ЗВІТИ
      <li>ІНФОРМАЦІЯ
    </ul>

    Створені окремі роути для всіх статичних сторінок та універсальні роути.<br>
    Всі інші функції запускаються за допомогою універсальних роутів.<br>
    В структурі об'єкту 'appDataset' описані параметри всіх екземплярів об'єктів даних (instance), з якими працює додаток.<br>
    Універсальні роути запускають універсальні компоненти, які на базі цих даних для кожного 'instance' дозволяють:
    <ul>
     <li>отримати з Backend актуальні дані
     <li>вивести дані в таблицю з можливістю пошуку, сортування, додавання рядка даних та редагування/видалення кожного рядка даних
     <li>всі дані виводяться з розбивкою по сторінках, для чого реалізовано 'Пагінатор серверний'
    </ul>
    Для редагування накладних реалізовано окремий компонент, який дозволяє редагувати Заголовок накладної та Рядки накадної та виконувати додаткові операції (проведення, перегляд складського ордеру).
    <br><br>
    Для отримання Звітів реалізовано окремий компонент, який дозволяє задавати параметри для формування Звітів та використовувати Пагінатор на боці клієнта.<br>
    При цьому використовувався стандартний набір компонентів, який є спільним для всього додатку.
  </p>
  <p>
  <b>Доступ до Backend</b> реалізовано за допомогою двох компонентів:
    <ul>
      <li><b>crud</b> - відповідає тільки за формування та відправку запитів до Backend.
      <li><b>crud_front</b> - отримує результати запитів від 'crud', відповідає за обробку та передачу даних в інші компоненти для візуалізації
    </ul>
    Такий підхід дає змогу при зміні Backend обмежитися коригуванням тільки компоненту 'crud'. Це дозволяє отримати більш універсальний додаток.
  </p>
</div>`,
  mounted: function() {
    store.commit('title', 'Особливості реалізації задачи')
  }
})

app.componentsLoaded('implementation')

