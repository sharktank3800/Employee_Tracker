USE employee_db;

INSERT INTO departments (name)
VALUES 
("IT"),
("Finance & Accounting"),       
("Sales & Marketing"),       
("Quality Assurance"),
("Engineering");

INSERT INTO role (title, salary, department_id)
VALUES
("IT Specialist", 65000, 1),
("Accountant", 80000, 2),
("Marketing coordindator", 75000, 3),
("Sales Specialist", 82000, 3),
("QA Specialist", 100000, 4),
("Full Stack Developer", 120000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Jane","Paterson", 1, 1),
("Kachbul","Singh", 2, 2),
("John","Cena", 3, 3),
("Gina","Dorothy", 3, 3),
("Linda","Beverly", 4, 4),
("George","Bernice", 5,5),
("Billy","Edmond", 5, 5);

