BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "customer" (
	"id"	INTEGER NOT NULL,
	"customer_name"	VARCHAR(70) NOT NULL,
	"customer_address"	VARCHAR(100) NOT NULL,
	"phone"	VARCHAR(20),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "unit" (
	"unit_code"	VARCHAR(10) NOT NULL,
	"unit_name"	VARCHAR(15) NOT NULL,
	PRIMARY KEY("unit_code")
);
CREATE TABLE IF NOT EXISTS "balance_item" (
	"party_id"	INTEGER NOT NULL,
	"item_id"	INTEGER NOT NULL,
	"date_receipt"	DATE NOT NULL,
	"cost"	FLOAT NOT NULL,
	"quantity"	FLOAT NOT NULL,
	CONSTRAINT "fk_balance_item" FOREIGN KEY("item_id") REFERENCES "item"("id"),
	PRIMARY KEY("party_id")
);
CREATE TABLE IF NOT EXISTS "pinvoice" (
	"num_doc"	INTEGER NOT NULL,
	"doc_date"	DATE NOT NULL,
	"doc_status"	INTEGER NOT NULL,
	"doc_date_approve"	DATE,
	"custom_numdoc"	VARCHAR(30),
	"customer_id"	INTEGER NOT NULL,
	CONSTRAINT "fk_pinvoice_customer" FOREIGN KEY("customer_id") REFERENCES "customer"("id"),
	PRIMARY KEY("num_doc")
);
CREATE TABLE IF NOT EXISTS "pinvoice_row" (
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
CREATE TABLE IF NOT EXISTS "einvoice" (
	"num_doc"	INTEGER NOT NULL,
	"customer_id"	INTEGER NOT NULL,
	"doc_date"	DATE NOT NULL,
	"doc_status"	INTEGER NOT NULL,
	"doc_date_approve"	DATE,
	CONSTRAINT "fk_einvoice_customer" FOREIGN KEY("customer_id") REFERENCES "customer"("id"),
	PRIMARY KEY("num_doc")
);
CREATE TABLE IF NOT EXISTS "einvoice_row" (
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
CREATE TABLE IF NOT EXISTS "warehouse_order_row" (
	"id"	INTEGER NOT NULL,
	"fk_einvoice_row_order"	INTEGER NOT NULL,
	"fk_balance_order_row"	INTEGER NOT NULL,
	"quantity"	FLOAT NOT NULL,
	"einvoice_id"	INTEGER NOT NULL,
	CONSTRAINT "fk_wh_einvoice_num_doc" FOREIGN KEY("einvoice_id") REFERENCES "einvoice"("num_doc"),
	FOREIGN KEY("fk_balance_order_row") REFERENCES "balance_item"("party_id"),
	FOREIGN KEY("fk_einvoice_row_order") REFERENCES "einvoice_row"("id"),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "group_item" (
	"id"	INTEGER NOT NULL,
	"group_name"	VARCHAR(50) NOT NULL,
	"group_description"	VARCHAR(150),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "item" (
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
CREATE TABLE IF NOT EXISTS "price_list" (
	"id"	INTEGER NOT NULL,
	"item_id"	INTEGER NOT NULL,
	"is_actual"	BOOLEAN NOT NULL,
	"price"	FLOAT NOT NULL,
	CONSTRAINT "fk_price_list_item" FOREIGN KEY("item_id") REFERENCES "item"("id"),
	PRIMARY KEY("id")
);
INSERT INTO "customer" VALUES (1,'Наше підприємство 2','Україна, Суми',NULL);
INSERT INTO "customer" VALUES (2,'Постачальник номер 1','Україна, Київ','(066)333-22-22');
INSERT INTO "customer" VALUES (3,'Покупець 1','Полтава',NULL);
INSERT INTO "customer" VALUES (4,'Покупець','Луцьк','(066)444-55-77');
INSERT INTO "customer" VALUES (5,'Постачальник наплічників','Київ',NULL);
INSERT INTO "customer" VALUES (6,'Atomuli Yadalato','Syracuse, 2528  Oak Street','+5010674373431');
INSERT INTO "customer" VALUES (7,'Sovseiduri Oherachu','2671  Oakmound Drive','+2290504407434');
INSERT INTO "customer" VALUES (8,'Matzal Cats','2172  Ella Street','+387664683394');
INSERT INTO "customer" VALUES (9,'Yatasuka Nakomode','163  Moore Avenue','+380504457494');
INSERT INTO "customer" VALUES (11,'Hans Trachenbürger','1008  Broadway Avenue','+210504455773');
INSERT INTO "customer" VALUES (12,'Bzdashek Zapadlovsky','1083  Woodland Terrace','+2265046234714');
INSERT INTO "customer" VALUES (13,'Thanos Slyunidopolu','2529  Briarhill Lane','+6840504670154');
INSERT INTO "customer" VALUES (14,'Kheranuka Poroyalu','4751  Corbin Branch Road','+855504456780');
INSERT INTO "customer" VALUES (15,'Ushat Pomoev','1960  Gore Street','(023)550-44-53');
INSERT INTO "customer" VALUES (16,'Harem Playboys','81  Monroe Avenue','+357504462859');
INSERT INTO "customer" VALUES (17,'Marazmus Nolemotsiy','1245  Duff Avenue','+620506379083');
INSERT INTO "customer" VALUES (18,'Orido Pota','2091  Braxton Street','');
INSERT INTO "customer" VALUES (19,'Olivier Ju yes Swallow','4940  Chardonnay Drive','+500453268901');
INSERT INTO "customer" VALUES (20,'Rucishchito Shirehari','4069  Austin Secret Lane','(000)534-56-28');
INSERT INTO "customer" VALUES (21,'Stoyana Rakova','349  Bombardier Way','+490345246783');
INSERT INTO "customer" VALUES (22,'Spiro Napolnasrakis','130  Smithfield Avenue','(055)412-32-43');
INSERT INTO "customer" VALUES (23,'111111111111111','1111111111111111','');
INSERT INTO "customer" VALUES (24,'222221111111111111','2222','');
INSERT INTO "unit" VALUES ('шт.','штука');
INSERT INTO "unit" VALUES ('ящ.','ящик');
INSERT INTO "unit" VALUES ('уп.','упаковка');
INSERT INTO "unit" VALUES ('пар.','пара');
INSERT INTO "unit" VALUES ('посл.','послуга');
INSERT INTO "balance_item" VALUES (3,9,'2023-12-01',4000.0,0.0);
INSERT INTO "balance_item" VALUES (4,9,'2023-12-06',4100.0,5.0);
INSERT INTO "balance_item" VALUES (5,3,'2023-12-11',500.0,0.0);
INSERT INTO "balance_item" VALUES (6,2,'2023-12-01',700.0,1.0);
INSERT INTO "balance_item" VALUES (7,7,'2023-12-01',540.0,0.0);
INSERT INTO "balance_item" VALUES (8,9,'2023-12-01',3900.0,0.0);
INSERT INTO "balance_item" VALUES (9,1,'2023-12-01',3000.0,0.0);
INSERT INTO "balance_item" VALUES (10,8,'2023-12-01',200.0,0.0);
INSERT INTO "balance_item" VALUES (11,6,'2023-12-01',150.0,0.0);
INSERT INTO "balance_item" VALUES (12,6,'2023-12-01',180.0,0.0);
INSERT INTO "balance_item" VALUES (13,1,'2023-12-06',2500.0,0.0);
INSERT INTO "balance_item" VALUES (14,6,'2023-12-06',200.0,0.0);
INSERT INTO "balance_item" VALUES (15,9,'2023-12-06',4200.0,10.0);
INSERT INTO "balance_item" VALUES (17,16,'2023-12-06',2900.0,0.0);
INSERT INTO "balance_item" VALUES (18,3,'2023-12-06',520.0,0.0);
INSERT INTO "balance_item" VALUES (19,3,'2023-12-01',530.0,0.0);
INSERT INTO "balance_item" VALUES (20,1,'2023-12-06',2900.0,10.0);
INSERT INTO "balance_item" VALUES (21,3,'2023-12-15',550.0,0.0);
INSERT INTO "balance_item" VALUES (22,8,'2023-12-15',190.0,9.0);
INSERT INTO "balance_item" VALUES (23,17,'2023-12-15',1000.0,0.0);
INSERT INTO "balance_item" VALUES (24,14,'2023-12-15',12000.0,0.0);
INSERT INTO "balance_item" VALUES (25,13,'2023-12-15',8500.0,0.0);
INSERT INTO "balance_item" VALUES (26,1,'2023-12-06',2000.0,1.0);
INSERT INTO "balance_item" VALUES (27,12,'2023-12-06',4500.0,10.0);
INSERT INTO "balance_item" VALUES (28,4,'2023-12-06',1500.0,95.0);
INSERT INTO "balance_item" VALUES (29,3,'2023-12-06',500.0,10.0);
INSERT INTO "balance_item" VALUES (30,13,'2023-12-15',8700.0,5.0);
INSERT INTO "balance_item" VALUES (31,14,'2023-12-15',12500.0,155.0);
INSERT INTO "balance_item" VALUES (32,15,'2023-12-15',7000.0,15.0);
INSERT INTO "balance_item" VALUES (33,6,'2023-12-15',190.0,500.0);
INSERT INTO "pinvoice" VALUES (1,'2023-11-10',1,'2023-12-01','',6);
INSERT INTO "pinvoice" VALUES (2,'2023-11-14',1,'2023-12-06','',12);
INSERT INTO "pinvoice" VALUES (3,'2023-11-09',1,'2023-12-11','65765765_hhh',14);
INSERT INTO "pinvoice" VALUES (4,'2023-11-07',1,'2023-12-01','',11);
INSERT INTO "pinvoice" VALUES (5,'2023-10-04',1,'2023-12-06','',2);
INSERT INTO "pinvoice" VALUES (6,'2023-11-28',1,'2023-12-06','',5);
INSERT INTO "pinvoice" VALUES (7,'2023-12-02',1,'2023-12-01','',2);
INSERT INTO "pinvoice" VALUES (8,'2023-12-13',1,'2023-12-15','',2);
INSERT INTO "pinvoice" VALUES (9,'2023-12-06',1,'2023-12-06',NULL,6);
INSERT INTO "pinvoice" VALUES (10,'2023-12-06',1,'2023-12-15',NULL,7);
INSERT INTO "pinvoice" VALUES (11,'2023-12-12',0,'2023-12-19',NULL,2);
INSERT INTO "pinvoice" VALUES (12,'2023-12-01',0,'2023-12-19',NULL,8);
INSERT INTO "pinvoice" VALUES (13,'2023-12-02',0,'2023-12-19',NULL,5);
INSERT INTO "pinvoice" VALUES (14,'2023-12-11',0,NULL,NULL,2);
INSERT INTO "pinvoice" VALUES (15,'2023-12-06',0,NULL,NULL,2);
INSERT INTO "pinvoice" VALUES (16,'2023-12-06',0,NULL,'',3);
INSERT INTO "pinvoice" VALUES (17,'2023-12-05',0,NULL,NULL,2);
INSERT INTO "pinvoice" VALUES (20,'2023-11-29',0,NULL,NULL,2);
INSERT INTO "pinvoice" VALUES (21,'2023-11-28',0,NULL,NULL,4);
INSERT INTO "pinvoice" VALUES (22,'2023-12-01',0,NULL,NULL,2);
INSERT INTO "pinvoice" VALUES (23,'2023-12-07',0,NULL,NULL,2);
INSERT INTO "pinvoice" VALUES (24,'2023-12-06',0,NULL,NULL,15);
INSERT INTO "pinvoice" VALUES (25,'2023-12-19',0,NULL,NULL,7);
INSERT INTO "pinvoice" VALUES (26,'2023-12-20',0,NULL,NULL,2);
INSERT INTO "pinvoice" VALUES (27,'2023-12-20',0,NULL,NULL,5);
INSERT INTO "pinvoice" VALUES (28,'2023-12-20',0,NULL,'',1);
INSERT INTO "pinvoice" VALUES (29,'2023-12-12',0,NULL,NULL,4);
INSERT INTO "pinvoice_row" VALUES (1,1,15.0,700.0,2,4);
INSERT INTO "pinvoice_row" VALUES (2,2,20.0,540.0,7,4);
INSERT INTO "pinvoice_row" VALUES (3,5,15.0,3900.0,9,4);
INSERT INTO "pinvoice_row" VALUES (4,1,5.0,500.0,3,3);
INSERT INTO "pinvoice_row" VALUES (5,6,20.0,3000.0,1,4);
INSERT INTO "pinvoice_row" VALUES (6,4,25.0,200.0,8,4);
INSERT INTO "pinvoice_row" VALUES (8,8,50.0,150.0,6,4);
INSERT INTO "pinvoice_row" VALUES (10,1,30.0,4000.0,9,1);
INSERT INTO "pinvoice_row" VALUES (11,9,25.0,180.0,6,4);
INSERT INTO "pinvoice_row" VALUES (12,1,10.0,530.0,3,7);
INSERT INTO "pinvoice_row" VALUES (13,1,1.0,1.0,2,12);
INSERT INTO "pinvoice_row" VALUES (14,1,100.0,900.0,2,22);
INSERT INTO "pinvoice_row" VALUES (15,1,11.0,11.0,7,23);
INSERT INTO "pinvoice_row" VALUES (17,1,20.0,4100.0,9,2);
INSERT INTO "pinvoice_row" VALUES (18,1,10.0,2900.0,1,6);
INSERT INTO "pinvoice_row" VALUES (19,1,10.0,2500.0,1,5);
INSERT INTO "pinvoice_row" VALUES (20,2,100.0,200.0,6,5);
INSERT INTO "pinvoice_row" VALUES (21,3,10.0,4200.0,9,5);
INSERT INTO "pinvoice_row" VALUES (22,2,100.0,3000.0,1,7);
INSERT INTO "pinvoice_row" VALUES (23,1,1.0,2000.0,1,9);
INSERT INTO "pinvoice_row" VALUES (24,1,2.0,550.0,3,8);
INSERT INTO "pinvoice_row" VALUES (25,2,20.0,190.0,8,8);
INSERT INTO "pinvoice_row" VALUES (26,2,10.0,4500.0,12,9);
INSERT INTO "pinvoice_row" VALUES (27,1,5.0,8700.0,13,10);
INSERT INTO "pinvoice_row" VALUES (28,2,155.0,12500.0,14,10);
INSERT INTO "pinvoice_row" VALUES (29,3,15.0,7000.0,15,10);
INSERT INTO "pinvoice_row" VALUES (30,1,50000.0,4000.0,15,11);
INSERT INTO "pinvoice_row" VALUES (31,2,10.0,5.0,8,12);
INSERT INTO "pinvoice_row" VALUES (32,1,55.0,55.0,12,13);
INSERT INTO "pinvoice_row" VALUES (33,2,7.0,77.0,14,13);
INSERT INTO "pinvoice_row" VALUES (34,3,1.0,77.0,4,13);
INSERT INTO "pinvoice_row" VALUES (35,4,1.0,333.0,15,13);
INSERT INTO "pinvoice_row" VALUES (36,2,20.0,2900.0,16,6);
INSERT INTO "pinvoice_row" VALUES (37,3,5.0,520.0,3,6);
INSERT INTO "pinvoice_row" VALUES (38,3,50.0,1000.0,17,8);
INSERT INTO "pinvoice_row" VALUES (39,4,10.0,12000.0,14,8);
INSERT INTO "pinvoice_row" VALUES (40,5,15.0,8500.0,13,8);
INSERT INTO "pinvoice_row" VALUES (41,3,100.0,1500.0,4,9);
INSERT INTO "pinvoice_row" VALUES (42,4,20.0,500.0,3,9);
INSERT INTO "pinvoice_row" VALUES (43,4,2000.0,190.0,6,10);
INSERT INTO "einvoice" VALUES (1,3,'2023-12-04',1,'2023-12-06');
INSERT INTO "einvoice" VALUES (2,8,'2023-12-05',1,'2023-12-15');
INSERT INTO "einvoice" VALUES (3,7,'2023-11-28',1,'2023-12-02');
INSERT INTO "einvoice" VALUES (4,18,'2023-12-19',1,'2023-12-28');
INSERT INTO "einvoice" VALUES (5,4,'2023-12-12',1,'2023-12-28');
INSERT INTO "einvoice" VALUES (6,4,'2023-12-12',1,'2024-01-02');
INSERT INTO "einvoice" VALUES (7,8,'2024-01-02',1,'2024-01-02');
INSERT INTO "einvoice_row" VALUES (1,1,1,1,10.0,4200.0);
INSERT INTO "einvoice_row" VALUES (2,1,2,6,55.0,250.0);
INSERT INTO "einvoice_row" VALUES (3,2,1,1,50.0,4200.0);
INSERT INTO "einvoice_row" VALUES (4,2,2,6,10.0,250.0);
INSERT INTO "einvoice_row" VALUES (5,3,1,3,1.0,750.0);
INSERT INTO "einvoice_row" VALUES (6,2,3,5,1.0,50.0);
INSERT INTO "einvoice_row" VALUES (7,3,2,9,40.0,4300.0);
INSERT INTO "einvoice_row" VALUES (8,2,4,7,10.0,950.0);
INSERT INTO "einvoice_row" VALUES (9,1,3,8,6.0,350.0);
INSERT INTO "einvoice_row" VALUES (10,3,3,2,2.0,950.0);
INSERT INTO "einvoice_row" VALUES (11,3,4,6,3.0,250.0);
INSERT INTO "einvoice_row" VALUES (12,3,5,6,6.0,250.0);
INSERT INTO "einvoice_row" VALUES (13,4,1,13,10.0,12500.0);
INSERT INTO "einvoice_row" VALUES (14,4,2,17,2.0,1400.0);
INSERT INTO "einvoice_row" VALUES (15,4,3,6,20.0,250.0);
INSERT INTO "einvoice_row" VALUES (16,4,4,3,2.0,750.0);
INSERT INTO "einvoice_row" VALUES (17,4,5,6,10.0,250.0);
INSERT INTO "einvoice_row" VALUES (18,5,1,13,5.0,12500.0);
INSERT INTO "einvoice_row" VALUES (19,5,2,14,10.0,22000.0);
INSERT INTO "einvoice_row" VALUES (20,5,3,9,20.0,4300.0);
INSERT INTO "einvoice_row" VALUES (21,5,4,2,12.0,950.0);
INSERT INTO "einvoice_row" VALUES (22,5,5,16,20.0,3700.0);
INSERT INTO "einvoice_row" VALUES (23,5,6,1,70.0,4200.0);
INSERT INTO "einvoice_row" VALUES (24,5,7,7,10.0,950.0);
INSERT INTO "einvoice_row" VALUES (25,5,8,8,30.0,350.0);
INSERT INTO "einvoice_row" VALUES (26,5,9,6,71.0,250.0);
INSERT INTO "einvoice_row" VALUES (27,5,10,17,48.0,1400.0);
INSERT INTO "einvoice_row" VALUES (28,5,11,3,19.0,750.0);
INSERT INTO "einvoice_row" VALUES (29,5,12,11,1.0,200.0);
INSERT INTO "einvoice_row" VALUES (30,5,13,5,10.0,50.0);
INSERT INTO "einvoice_row" VALUES (31,6,1,3,10.0,750.0);
INSERT INTO "einvoice_row" VALUES (32,6,2,4,5.0,2300.0);
INSERT INTO "einvoice_row" VALUES (33,6,3,5,20.0,50.0);
INSERT INTO "einvoice_row" VALUES (34,'undefined',1,6,1500.0,250.0);
INSERT INTO "einvoice_row" VALUES (35,7,1,6,1500.0,250.0);
INSERT INTO "warehouse_order_row" VALUES (8,1,9,10.0,1);
INSERT INTO "warehouse_order_row" VALUES (9,2,11,50.0,1);
INSERT INTO "warehouse_order_row" VALUES (10,2,12,5.0,1);
INSERT INTO "warehouse_order_row" VALUES (11,9,10,6.0,1);
INSERT INTO "warehouse_order_row" VALUES (12,3,9,50.0,2);
INSERT INTO "warehouse_order_row" VALUES (13,4,12,10.0,2);
INSERT INTO "warehouse_order_row" VALUES (14,8,7,10.0,2);
INSERT INTO "warehouse_order_row" VALUES (15,5,19,1.0,3);
INSERT INTO "warehouse_order_row" VALUES (16,7,3,30.0,3);
INSERT INTO "warehouse_order_row" VALUES (17,7,8,10.0,3);
INSERT INTO "warehouse_order_row" VALUES (18,10,6,2.0,3);
INSERT INTO "warehouse_order_row" VALUES (19,11,12,3.0,3);
INSERT INTO "warehouse_order_row" VALUES (20,12,12,6.0,3);
INSERT INTO "warehouse_order_row" VALUES (21,13,25,10.0,4);
INSERT INTO "warehouse_order_row" VALUES (22,14,23,2.0,4);
INSERT INTO "warehouse_order_row" VALUES (23,15,12,1.0,4);
INSERT INTO "warehouse_order_row" VALUES (24,15,14,19.0,4);
INSERT INTO "warehouse_order_row" VALUES (25,16,19,2.0,4);
INSERT INTO "warehouse_order_row" VALUES (26,17,14,10.0,4);
INSERT INTO "warehouse_order_row" VALUES (27,18,25,5.0,5);
INSERT INTO "warehouse_order_row" VALUES (28,19,24,10.0,5);
INSERT INTO "warehouse_order_row" VALUES (29,20,8,5.0,5);
INSERT INTO "warehouse_order_row" VALUES (30,20,4,15.0,5);
INSERT INTO "warehouse_order_row" VALUES (31,21,6,12.0,5);
INSERT INTO "warehouse_order_row" VALUES (32,22,17,20.0,5);
INSERT INTO "warehouse_order_row" VALUES (33,23,9,60.0,5);
INSERT INTO "warehouse_order_row" VALUES (34,23,13,10.0,5);
INSERT INTO "warehouse_order_row" VALUES (35,24,7,10.0,5);
INSERT INTO "warehouse_order_row" VALUES (36,25,10,19.0,5);
INSERT INTO "warehouse_order_row" VALUES (37,25,22,11.0,5);
INSERT INTO "warehouse_order_row" VALUES (38,26,14,71.0,5);
INSERT INTO "warehouse_order_row" VALUES (39,27,23,48.0,5);
INSERT INTO "warehouse_order_row" VALUES (40,28,19,7.0,5);
INSERT INTO "warehouse_order_row" VALUES (41,28,18,5.0,5);
INSERT INTO "warehouse_order_row" VALUES (42,28,5,5.0,5);
INSERT INTO "warehouse_order_row" VALUES (43,28,21,2.0,5);
INSERT INTO "warehouse_order_row" VALUES (44,31,29,10.0,6);
INSERT INTO "warehouse_order_row" VALUES (45,32,28,5.0,6);
INSERT INTO "warehouse_order_row" VALUES (46,35,33,1500.0,7);
INSERT INTO "group_item" VALUES (0,' Послуги з пакування та доставки','');
INSERT INTO "group_item" VALUES (1,'Луки рекурсивні','');
INSERT INTO "group_item" VALUES (2,'Луки блокові','');
INSERT INTO "group_item" VALUES (3,'Стріли для луків',' ');
INSERT INTO "group_item" VALUES (4,'Рюкзаки',NULL);
INSERT INTO "group_item" VALUES (5,'Сумки',NULL);
INSERT INTO "group_item" VALUES (6,'Аксесуари для луків',NULL);
INSERT INTO "item" VALUES (1,'Рюкзак Tatonka Cycle pack','шт.',0,'Tatonka Cycle Pack - велосипедний рюкзак',4);
INSERT INTO "item" VALUES (2,'Рюкзак  дитячий Pinguin','шт.',0,'Дитяча версія рюкзака Step для дорослих',4);
INSERT INTO "item" VALUES (3,'Сумка Lowe Alpine','шт.',0,'Легка, міцна і маневрена випускається в особливому розмірі',5);
INSERT INTO "item" VALUES (4,'Сумка Tatonka Baron','шт.',0,'Об`єм 10 л',5);
INSERT INTO "item" VALUES (5,'Послуга з упаковки товару','посл.',1,' ',0);
INSERT INTO "item" VALUES (6,'СТРІЛА MUSEN MSBJ-6001-30','шт.',0,'Довжина: 30". Перо: пластикове. Матеріал: фіберглас. Діаметр: 6 мм',3);
INSERT INTO "item" VALUES (7,'СТРІЛА B33 КОМПЛЕКТ 6 ШТУК','уп.',0,'Довжина: 33"  Перо: натуральне (колір пера може відрізнятися від фото)  Хвостовик: пластик',3);
INSERT INTO "item" VALUES (8,'СТРІЛА EASTON INSPIRE','шт.',0,'Довжина: 27"-31.5"  Перо: пластикове Матеріал: карбон',3);
INSERT INTO "item" VALUES (9,'Лук класичний Jandao 66/34','шт.',0,'Лук классический Jandao алюминиевая рукоять 66/34',1);
INSERT INTO "item" VALUES (10,'Доставка товара','посл.',1,NULL,0);
INSERT INTO "item" VALUES (11,'Доставка кур''ером','посл.',1,NULL,0);
INSERT INTO "item" VALUES (12,'Лук для стрільби Junxing f165','шт.',0,'Класичний розбірний лук  Кріплення плечей ILF',1);
INSERT INTO "item" VALUES (13,'Блоковий лук Junxing M121','шт.',0,NULL,2);
INSERT INTO "item" VALUES (14,'Блочно-рычажный лук PowerBow RMP Nitro','шт.',0,NULL,2);
INSERT INTO "item" VALUES (15,'Блоковий лук Man Kung MK-CB50','шт.',0,' ',2);
INSERT INTO "item" VALUES (16,'Рюкзак Jack Wolfskin Berkeley чорний','шт.',0,NULL,4);
INSERT INTO "item" VALUES (17,'Стабілізатор для лука','шт.',0,'Стабілізатор лучний. Підходить для блокових і класичних луків.',6);
INSERT INTO "item" VALUES (18,'Приціл Junxing для спортивного лука','шт.',0,'',6);
INSERT INTO "price_list" VALUES (1,1,1,4200.0);
INSERT INTO "price_list" VALUES (2,5,1,50.0);
INSERT INTO "price_list" VALUES (3,9,1,4300.0);
INSERT INTO "price_list" VALUES (4,2,1,950.0);
INSERT INTO "price_list" VALUES (5,3,1,750.0);
INSERT INTO "price_list" VALUES (6,6,1,250.0);
INSERT INTO "price_list" VALUES (7,16,1,3700.0);
INSERT INTO "price_list" VALUES (8,7,1,950.0);
INSERT INTO "price_list" VALUES (9,8,1,350.0);
INSERT INTO "price_list" VALUES (10,17,1,1400.0);
INSERT INTO "price_list" VALUES (11,14,1,22000.0);
INSERT INTO "price_list" VALUES (12,13,1,12500.0);
INSERT INTO "price_list" VALUES (13,4,1,2300.0);
COMMIT;
