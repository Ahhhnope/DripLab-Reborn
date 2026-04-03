create database CafeDB
go
use CafeDB
go

--USE master;
--ALTER DATABASE CafeDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
--DROP DATABASE CafeDB;


------------------------------------------
create table users (
	id int identity(1,1) primary key,
	full_name nvarchar(50),
	email varchar(50),
	password nvarchar(max),
	phone varchar(10),
	default_address nvarchar(50),
	avatar nvarchar(max),
	role nvarchar(20) default 'USER'
);

create table customers (
	id int identity(1,1) primary key,
	full_name nvarchar(50),
	loyalty_point float,
	date_of_birth date,
	phone varchar(10),
	created_at date default getdate(),
	user_id int foreign key references users (id)
);

create table workers (
    id int identity(1,1) primary key,
    full_name nvarchar(50) not null,
    account varchar(50) not null unique,
    password nvarchar(50) not null,
    created_at date default getdate()
);

create table promo_codes (
	id int identity(1,1) primary key,
	code nvarchar(max),
	name nvarchar(100),
	description nvarchar(100),
	category nvarchar(50),
	value decimal(10, 2),
	quantity int,
	start_date datetime,
	end_date datetime,
	status bit default 0,
	created_at datetime default getdate()
);


-------------------------------------------
create table toppings (
	id int identity(1,1) primary key,
	name nvarchar(50) not null,
	price decimal(10, 2) not null default 0,
	quantity int,
	created_at datetime default getdate()
);

create table coffee_beans (
	id int primary key identity(1,1),
	name nvarchar(255) not null,
	price decimal(10, 2) not null default 0,
	quantity int,
	created_at date default getdate()
);

create table milks (
	id int primary key identity(1,1),
	name nvarchar(255) not null,
	price decimal(10, 2) not null default 0,
	quantity int,
	created_at date default getdate()
);

create table heavy_creams (
	id int primary key identity(1,1),
	name nvarchar(255) not null,
	price decimal(10, 2) not null default 0,
	quantity int,
	created_at date default getdate()
);

create table ice_creams (
	id int primary key identity(1,1),
	name nvarchar(255) not null,
	price decimal(10, 2) not null default 0,
	quantity int,
	created_at date default getdate()
);

create table instructions (
	id int primary key identity(1,1),
	name nvarchar(255) not null,
	instructions nvarchar(max),
	created_at date default getdate()
);

create table drinks (
	id int identity(1,1) primary key,
	name nvarchar(50),
	category nvarchar(50) default N'Cà phê',
	
	coffee_bean_id int foreign key references coffee_beans (id),
	milk_id int foreign key references milks (id),
	heavy_cream_id int foreign key references heavy_creams (id),
	ice_cream_id int foreign key references ice_creams (id),
	instruction_id int foreign key references instructions (id),
	
	description nvarchar(50),
	base_price decimal(10, 2),
	image_url nvarchar(max),
	active bit default 1
);

create table sizes (
    id int identity(1,1) primary key,
    name nvarchar(10) not null,
    price decimal(10, 2) default 0,
    created_at datetime default getdate()
);

-------------------------------------------
create table carts (
	id int identity(1,1) primary key,
	user_id int unique foreign key references users (id)
);

create table cart_items (
	id int identity(1,1) primary key,
	cart_id int foreign key references carts (id),
	product_id int foreign key references drinks (id),
	size_id int foreign key references sizes (id),
	quantity int
);

create table cart_item_toppings (
	id int identity(1,1) primary key,
	cart_item_id int foreign key references cart_items (id),
	topping_id int foreign key references toppings (id)
);

-------------------------------------------
create table orders (
	id int identity(1,1) primary key,
	order_number int,
	order_date datetime default getdate(),

	original_price decimal(10, 2),
	discount_amount decimal(10, 2) default 0,
	shipping_fee decimal(10, 2) default 0,
	tax_amount decimal(10, 2) default 0,
	final_price decimal(10, 2),

	shipping_address nvarchar(max),
	note nvarchar(100),
	status nvarchar(50) default N'Chờ xác nhận',

	created_at datetime default getdate(),
	updated_at datetime default getdate(),
	customer_id int foreign key references customers (id)
);

create table order_items (
	id int identity(1,1) primary key,
	order_id int foreign key references orders (id),
	drink_id int foreign key references drinks (id),
	size_id int foreign key references sizes (id),
	quantity int,
	base_price_at_purchase float --base price of items (not like after tax and discounts or something ;-;)
);


create table order_item_toppings (
	id int identity(1,1) primary key,
	order_item_id int foreign key references order_items (id),
	topping_id int foreign key references toppings (id),
	base_price_at_purchase float --same as above table but toppings now
);


create table invoices (
	id int identity(1,1) primary key,
	invoice_number int,
	invoice_date datetime default getdate(),

	shipping_address nvarchar(max),
	
	original_price decimal(10, 2),
	discount_amount decimal(10, 2),
	shipping_fee decimal(10, 2),
	tax_amount decimal(10, 2),
	final_price decimal(10, 2),

	payment_method nvarchar(50),
	receipt_type nvarchar(50),

	created_at datetime default getdate(),
	order_id int foreign key references orders (id),
	customer_id int foreign key references customers (id)
);
-------------------------------------------
insert into workers (full_name, account, password) values
(N'americano', 'abc123', 'lmao'),
(N'robusta', 'kikiki', 'lol')


insert into users (full_name, email, password, phone, default_address, avatar, role) values
('admin', 'admin@gmail.com', '12345a', '0123456789', 'Hà Nội', N'nah', 'ADMIN'),
('POS system', 'posSystem@gmail.com', '$2a$12$pFOPW6MiM8N9ctlwN0SoPehWv.NLB1/A5QMnJegidMUU2Ucj.umzu', null, 'POS', N'no', 'ADMIN'),
(N'Nguyễn Văn A', 'a@gmail.com', '$2a$12$8fKVVkzn7BVFBA2cKIH.D.9QZUf9vWK2KdmUcuIAsWPlY07bbNToW', '0988888888', N'Hà Nội', 'avatar_a.png', 'ADMIN')

insert into customers (full_name, loyalty_point, date_of_birth, phone, user_id) values
('admin', 200000000, '2024-11-21', '0123457689', 1),
('POS system', 0, null, null, 2),
(N'Nguyễn Văn A', 150.0, '2026-03-20', '0988888888', 3)

insert into carts (user_id) values ('2') -- 2 là hệ thống POS


insert into instructions (name, instructions) values
(N'Pha Máy', N'Chiết xuất Espresso tiêu chuẩn 30ml'),
(N'Pha Phin', N'Ủ 2 phút với 20ml nước, sau đó rót thêm 40ml'),
(N'Ủ Lạnh', N'Ủ bột cà phê trong nước lạnh 16 tiếng')

insert into coffee_beans (name, price, quantity) values
(N'Arabica Highland', 0, 500),
(N'Robusta Special', 0, 500)

insert into heavy_creams (name, price, quantity) values 
(N'Kem Béo Rich', 0, 50);

insert into ice_creams (name, price, quantity) values 
(N'Cream', 10, 220),
(N'SUPAAAAAAAA', 30, 50),
(N'Creammmmm', 11, 50)



insert into milks (name, price, quantity, created_at) values 
(N'Sữa Đặc Larosee', 0, 100, GETDATE()),
(N'Sữa Tươi Vinamilk', 0, 100, GETDATE());

insert into sizes (name, price) values
('S', 0),
('M', 5000),
('L', 10000)


insert into drinks (name, category, base_price, image_url, coffee_bean_id, instruction_id, milk_id, active) values
(N'Matcha Latte', N'Trà', 45000, N'/IMG/MistakesWereMade.jpg', null, null, 2, 1),
(N'Trà Đào', N'Trà', 25000, N'/IMG/MistakesWereMade.jpg', null, null, null, 1),
(N'Cà Phê Sữa Đá', N'Cà phê', 35000, N'/IMG/MistakesWereMade.jpg', 2, 2, 1, 1),
(N'Cà Phê Muối', N'Cà phê', 45000, N'/IMG/MistakesWereMade.jpg', 1, 1, 1, 1),
(N'Bạc Xỉu', N'Cà phê', 55000, N'/IMG/MistakesWereMade.jpg', 2, 1, 1, 1)

insert into toppings (name, price) values
(N'Trân châu đen', 5000),
(N'Thạch cà phê', 5000),
(N'Kem cheese', 8000),
(N'Pudding trứng', 8000),
(N'Kem béo', 6000),
(N'Whipping cream', 8000),
(N'Lmao special', 10000)


insert into promo_codes (code, category, name, value, quantity, start_date, end_date, status) values
('VOUCHER10', N'PHẦN TRĂM', N'Giảm 10%', 10.00, 1, '2025-12-25', '2026-01-25', 1),
('VIP30', N'PHẦN TRĂM', N'VIP giảm 30%', 30.00, 19, '2025-12-22', '2026-01-22', 1),
('LMAO200', N'PHẦN TRĂM', N'Giảm 200k', 200000, 216, '2026-1-11', '2026-02-11', 1)

--Bật lại tất cả sản phẩm
update drinks set active = 1

insert into orders (order_number, customer_id, original_price, final_price, status, order_date) values
(719523346, 1, 55000, 55000, N'Chờ xác nhận', '2026-03-20 13:36:00'),
(719523347, 1, 50000, 45000, N'Đã giao', '2026-03-20 13:38:00')

insert into orders (order_number, customer_id, final_price, status) values
(750602738, 1, 218000, N'Đang xử lý'),
(781602731, 1, 220000, N'Đã huỷ')

insert into invoices (invoice_number, order_id, customer_id, payment_method, receipt_type, original_price, discount_amount, final_price) values
(1, 2, 1, N'Tiền mặt', N'Tại Quầy', 50000, 5000, 45000),
(2, 1, 1, N'Chuyển khoản', N'Online', 70000, 5000, 65000)


select * FROM cart_items 
WHERE cart_id = (SELECT id FROM carts WHERE user_id = 2);


select * from carts
select * from drinks
select * from milks
select * from users
select * from orders
select * from invoices
select * from instructions
select * from coffee_beans
select * from users


--chart test
INSERT INTO orders (order_number, customer_id, final_price, status, order_date) VALUES
(1001, 1, 450000, N'Đã giao', '2026-03-28 10:00:00'),
(1002, 1, 320000, N'Đã giao', '2026-03-29 14:30:00'),
(1003, 1, 580000, N'Đã giao', '2026-03-30 09:15:00'),
(1004, 1, 210000, N'Đã giao', '2026-03-31 11:45:00'),
(1005, 1, 750000, N'Đã giao', '2026-04-01 16:20:00'),
(1006, 1, 420000, N'Đã giao', '2026-04-02 13:10:00'),
(1007, 1, 600000, N'Đã giao', '2026-04-03 10:00:00'),
(1007, 1, 99999999, N'Đã giao', '2026-04-03 11:00:00')
