SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;


CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(50) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  department_id INT, 
  PRIMARY KEY (id)
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR (50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role_id INT NOT NULL, 
  manager_id INT, 
  PRIMARY KEY (id)
);


INSERT INTO department
    (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Sales Lead', 9000, 1),
    ('Salesperson', 70000, 1),
    ('Lead Engineer', 300000, 2),
    ('Software Engineer', 240000, 2),
    ('Account Manager', 180000, 3),
    ('Accountant', 100000, 3),
    ('Legal Team Lead', 275000, 4),
    ('Lawyer', 150000, 4);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Darryl', 'Holmes', 1, NULL),
    ('Chris', 'Miller', 2, 1),
    ('Renee', 'Alo', 3, NULL),
    ('Ally', 'Kelt', 4, 3),
    ('Joe', 'Lane', 5, NULL),
    ('Sarah', 'Jacobs', 6, 5),
    ('Tisha', 'Brown', 7, NULL),
    ('Roy', 'Wilks', 8, 7);
