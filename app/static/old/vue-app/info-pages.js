Vue.component('main-page', {
  template: `
<div>
  <h2 class="center-text">Тестове завдання</h2>
  <h5>Текст задачі</h5>
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
    Зробити відео де розповісти про свій шлях вирішення питання та надіслати посилання на відео на Viber: +38 067 901-63-22</p>
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

app.componentsLoaded('main-page')


Vue.component('database', {
  template: `
<div>
  <h2 class="center-text">Формування бази даних</h2>
  <h5>Структира бази даних</h5>
  <p>
    <img src="/static/img/BD.svg">
  </p>
  <h5>SQL для створення таблиць бази даних</h5>
  <pre>
          -- Клієнти
        drop table if exists customer;
        create table customer (
          id integer primary key autoincrement,
          customer_name char(70) not null,
          customer_address char(100) not null
        );

        --  Одиниці виміру
         drop table if exists unit;
         create table unit (
           unit_code char(10) NOT NULL primary key,
           unit_name char(15) not null,
         );

        --  Товари та послуги
        drop table if exists item;
        create table item (
          id integer primary key autoincrement,
          item_name char(50) not null,
          unit char(10) default 'шт.',
          service boolean not null default false,
          item_description char(100) not null,
          FOREIGN KEY (unit)  REFERENCES unit (unit_code)
        );

        --  Прибуткова накладна
        drop table if exists pinvoice;
        create table pinvoice (
          num_doc integer primary key autoincrement,
          customer integer not null,
          doc_date date not null,
          doc_status integer not null default 0,
          doc_date_approve date,
          custom_numdoc varchar(30),
          FOREIGN KEY (customer)  REFERENCES customer (id)
        );

        --  Прибуткова накладна, рядки
        drop table if exists pinvoice_row;
        create table pinvoice_row (
          id integer primary key autoincrement,
          pinvoice integer not null,
          npp integer not null,
          item int not null,
          quantity numeric(12,2) NOT NULL default 0,
          price numeric(12,2) NOT NULL default 0,
          FOREIGN KEY (pinvoice)  REFERENCES pinvoice (num_doc),
          FOREIGN KEY (item)  REFERENCES item (id)
        );

        --  Видаткова накладна
        drop table if exists einvoice;
        create table einvoice (
          num_doc integer primary key autoincrement,
          customer integer not null,
          doc_date date not null,
          doc_status integer not null default 0,
          doc_date_approve date,
          FOREIGN KEY (customer)  REFERENCES customer (id)
        );

        --  Видаткова накладна, рядки
        drop table if exists einvoice_row;
        create table einvoice_row (
          id integer primary key autoincrement,
          einvoice integer not null,
          npp integer not null,
          item int not null,
          quantity numeric(12,2) NOT NULL default 0,
          price numeric(12,2) NOT NULL default 0,
          FOREIGN KEY (einvoice)  REFERENCES einvoice (num_doc),
          FOREIGN KEY (item)  REFERENCES item (id)
        );

        -- рядки складського ордеру (списання залишків по партіях)
        drop table if exists warehouse_order_row;
        create table warehouse_order_row (
          id integer primary key autoincrement,
          einvoice_row int NOT NULL,
          quantity numeric(12,2) NOT NULL default 0,
          cost numeric(12,2) NOT NULL default 0,
          FOREIGN KEY (einvoice_row)  REFERENCES einvoice_row (id)
        );

        -- залишки товарів по партіях.
        -- Партія =  код товару+дата приходу +ціна приходу
        drop table if exists balance_item;
        create table balance_item (
          party_id integer primary key autoincrement,
          item int not null,
          date_receipt date NOT NULL,
          cost numeric(12,2) NOT NULL default 0,
          quantity numeric(12,2) NOT NULL default 0,
          FOREIGN KEY (item)  REFERENCES item (id)
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
  <h5>База даних</h5>
  <pre>
    Для створення таблиць Бази даних використовував моделі SQLAlchemy та розширення Migrate.
    Це дозволяє автоматично створювати таблиці в БД на основі моделей SQLAlchemy та здійснювати міграцію бази даних при зміні моделей даних.
    Маємо інструменти для створення та керування версіями бази даних, щоб зберегти та відстежувати зміни без втрати даних.
    Міграція важлива при розвитку додатків, оскільки вона дозволяє оновлювати базу даних без необхідності перезавантаження чи втрати існуючої інформації.
  </pre>
  <p>
  </p>
  <p>
  </p>
  <p>
  </p>
</div>`,
  mounted: function() {
    store.commit('title', 'Особливості реалізації задачи')
  }
})

app.componentsLoaded('implementation')

