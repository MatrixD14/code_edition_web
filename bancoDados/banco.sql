create database login;
use login;
create table usuario(id_usuario int primary key auto_increment,nome varchar(100),email varchar(200),senha varchar(255));
create table admins(id_admin int primary key auto_increment,email varchar(200),senha varchar(255));