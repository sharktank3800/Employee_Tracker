const inquirer = require("inquirer");
const db = require("./db/connection.js");

db.connect((err) => {
    if (err) throw err;
    console.log("Successfully connected to the database");

    // Initialize the app
    init();
});

// Start SQL employee tracker
function init() {
    inquirer
        .prompt({
            type: "list",
            name: "option",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Add a manager",
                "Update an employee role",
                "View employees by department",
                "View employees by manager",
                "Delete departments, roles, employees",
                "Exit",
            ],
        })
        .then((selected) => {
            switch (selected.option) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Add a manager":
                    addManager();
                    break;
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                case "View employees by department":
                    viewEmployeeByDepartment();
                    break;
                case "View employees by manager":
                    viewEmployeeByManager();
                    break;
                case "Delete departments, roles, employees":
                    deleteDRE();
                    break;
                case "Exit":
                    db.end();
                    console.log("Thank you! Goodbye!");
                    break;
            }
        });
}

// View all Departments
function viewAllDepartments() {
    const query = "SELECT * FROM departments";
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // Reinitialize the app
        init();
    });
}

// View all roles
function viewAllRoles() {
    const query = "SELECT roles.title, roles.id, departments.name AS department_name, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id";

    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // Reinitialize the app
        init();
    });
}

// View all employees
function viewAllEmployees() {
    const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department_name, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
    `;
    
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        // Reinitialize the app
        init();
    });
}

// Add a department
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "Enter the new department name: ",
        })
        .then((selected) => {
            const query = `INSERT INTO departments (name) VALUES ("${selected.name}")`;
            db.query(query, (err, res) => {
                if (err) throw err;
                console.log(`Department "${selected.name}" added to the database!`);
                // Reinitialize the app
                init();
            });
        });
}

// Add a role
function addRole() {
    const query = "SELECT * FROM departments";
    db.query(query, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Please enter the title for the new role: ",
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Please enter the salary for the new role: ",
                },
                {
                    type: "list",
                    name: "department",
                    message: "Please select the department for the new role: ",
                    choices: res.map((department) => department.name),
                },
            ])
            .then((selected) => {
                const selectedDepartment = res.find((dept) => dept.name === selected.department);
                const query = "INSERT INTO roles SET ?";
                db.query(
                    query,
                    {
                        title: selected.title,
                        salary: selected.salary,
                        department_id: selectedDepartment.id,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`Role "${selected.title}" with salary "${selected.salary}" added to the "${selected.department}" department!`);
                        // Reinitialize the app
                        init();
                    }
                );
            });
    });
}

// Add an employee
function addEmployee() {
    // Pulling a list of roles from the database
    db.query("SELECT id, title FROM roles", (err, resRoles) => {
        if (err) {
            console.error(err);
            return;
        }

        const roles = resRoles.map(({ id, title }) => ({
            name: title,
            value: id,
        }));

        db.query(
            `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee`,
            (err, res) => {
                if (err) {
                    console.error(err);
                    return;
                }

                const managers = res.map(({ id, name }) => ({
                    name,
                    value: id,
                }));

                inquirer
                    .prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "Employee first name: ",
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "Employee last name: ",
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "Choose the employee role: ",
                            choices: roles,
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Choose the employee manager: ",
                            choices: [{ name: "none", value: null }, ...managers],
                        },
                    ])
                    .then((selected) => {
                        // Insert the employee
                        const query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                        const values = [
                            selected.firstName,
                            selected.lastName,
                            selected.roleId,
                            selected.managerId,
                        ];

                        db.query(query, values, (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }

                            console.log("Employee Added!");
                            // Reinitialize the app
                            init();
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        );
    });
}

// Add a manager
function addManager() {
    const queryDept = "SELECT * FROM departments";
    const queryEmply = "SELECT * FROM employee";
    db.query(queryDept, (err, resDept) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Choose the department:",
                    choices: resDept.map((department) => department.name),
                },
                {
                    type: "list",
                    name: "employee",
                    message: "Choose the employee to whom you're adding a manager:",
                    choices: resEmply.map((employee) => `${employee.first_name} ${employee.last_name}`),
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Choose the employee's manager:",
                    choices: resEmply.map((employee) => `${employee.first_name} ${employee.last_name}`),
                },
            ])
            .then((selected) => {
                const dept = resDept.find((department) => department.name === selected.department);
                const employee = resEmply.find((employee) => `${employee.first_name} ${employee.last_name}` === selected.employee);
                const manager = resEmply.find((employee) => `${employee.first_name} ${employee.last_name}` === selected.manager);

                const query = "UPDATE employee SET manager_id = ? WHERE id = ?";
                db.query(
                    query,
                    [manager.id, employee.id],
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            `Manager ${manager.first_name} ${manager.last_name} added to employee ${employee.first_name} ${employee.last_name} in the ${dept.name} department!`
                        );
                        // Reinitialize the app
                        init();
                    }
                );
            });
    });
}

// Update an employee role
function updateEmployeeRole() {
    const queryEmply = "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";
    const queryRoles = "SELECT * FROM roles";
    db.query(queryEmply, (err, resEmply) => {
        if (err) throw err;
        db.query(queryRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Choose the employee to update: ",
                        choices: resEmply.map((employee) => `${employee.first_name} ${employee.last_name}`),
                    },
                    {
                        type: "list",
                        name: "roles",
                        message: "Choose the new role: ",
                        choices: resRoles.map((role) => role.title),
                    },
                ])
                .then((selected) => {
                    const employee = resEmply.find(
                        (employee) => `${employee.first_name} ${employee.last_name}` === selected.employee
                    );
                    const roles = resRoles.find((roles) => roles.title === selected.roles);

                    const query = "UPDATE employee SET role_id = ? WHERE id = ?";
                    db.query(
                        query,
                        [roles.id, employee.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(`Updated ${employee.first_name} ${employee.last_name}'s role to ${roles.title} successfully!`);
                            // Reinitialize the app
                            init();
                        }
                    );
                });
        });
    });
}

process.on("exit", () => {
    db.end();
});
