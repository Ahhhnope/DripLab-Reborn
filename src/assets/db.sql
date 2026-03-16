create database CafeDB
go
use CafeDB
go

--use master
--go
--drop database CafeDB


------------------------------------------
create table users (
	id int identity(1,1) primary key,
	full_name nvarchar(50) not null,
	email varchar(50) not null,
	password nvarchar(50) not null,
	phone varchar(10) not null
);

create table promo_codes (
	id int identity(1,1) primary key,
	name nvarchar(50) not null,
	code nvarchar(max) not null,
	description nvarchar(100)
);



-------------------------------------------
create table drinks (
	id int identity(1,1) primary key,
	name nvarchar(50) not null,
	description nvarchar(50),
	base_price float not null,
	quantity int,
	image_url nvarchar(max)
);

create table toppings (
	id int identity(1,1) primary key,
	name nvarchar(50) not null,
	price float not null
);

create table carts (
	id int identity(1,1) primary key,
	user_id int unique foreign key references users (id)
);

create table cart_items (
	id int identity(1,1) primary key,
	cart_id int foreign key references carts (id),
	product_id int foreign key references drinks (id),
	quantity int not null
);

create table cart_item_toppings (
	id int identity(1,1) primary key,
	cart_item_id int foreign key references cart_items (id),
	topping_id int foreign key references toppings (id)
);

create table orders (
	id int identity(1,1) primary key,
	
);

create table invoices (
	id int identity(1,1) primary key,
	invoice_number int,
	invoice_date date,
	customer_name nvarchar(50),
	customer_phone varchar(10),
	customer_adress nvarchar(50),
	original_price float,
	discount_amount float,
	shipping_fee float,
	tax_amount float,
	final_price float,
	payment_method nvarchar(50),
	payment_status nvarchar(50),
	created_at default getdate(),
	order_id int,
	customer_id int,
);
-------------------------------------------
insert into users (full_name, email, password, phone) values ('admin', 'admin@gmail.com', '12345', '0123456789')

insert into carts (user_id) values ('1')

insert into drinks (name, description, base_price, quantity, image_url) values
('Matcha Tea', null, 45000, 100, '/IMG/tên_ảnh.png'),
('Tea 1', null, 25000, 100, '/IMG/tên_ảnh.png'),
('Tea 2', null, 35000, 100, '/IMG/tên_ảnh.png'),
('Tea 3', null, 45000, 100, '/IMG/tên_ảnh.png'),
('Tea 4', null, 55000, 100, '/IMG/tên_ảnh.png')

insert into toppings (name, price) values
('Trân châu đen', 5000),
('Thạch cà phê', 5000),
('Kem cheese', 8000),
('Pudding trứng', 8000),
('Kem béo', 6000),
('Whipping cream', 8000)

select * from drinks

