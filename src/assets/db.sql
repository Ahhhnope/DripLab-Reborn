create database CafeDB
go
use CafeDB
go

create table users (
	id int identity(1,1) primary key,
	full_name nvarchar(50) not null,
	email varchar(50) not null,
	password nvarchar(50) not null,
	phone varchar(10) not null
);

create table drinks (
	id int identity(1,1) primary key,
	name nvarchar(50) not null,
	description nvarchar(50),
	base_price float not null,
	image_url nvarchar(max)
);

create table promo_code (
	id int identity(1,1) primary key,
	name nvarchar(50) not null,
	code nvarchar(max) not null,
	description nvarchar(100)
);