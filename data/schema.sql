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
