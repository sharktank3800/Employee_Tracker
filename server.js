const inquirer = require("inquirer");
const db = require("./db/connection.js");

// start sql employee tracker
function init(){
    inquirer.prompt({
        type: "list",
        name: "option",
        message: "What would you want to do?",
        choices: [
            "View all Departments",
            "View all Roles",
            "View all Employees",
            "Add a Department",
            "Add a Role",
            "Add a Employee",
            "Add a Manager",
            "Update an Employee Role",
            "View Employees by Department",
            "View Employees by Manager",
            "Delete Departments | Roles | Employees",
            "Exit"
        ]
    }).then((selected) => {
        switch(selected.option){
            case "View all Departments":
                viewAllDepartments();
                break;
            case "View all Roles":
                viewAllRoles();
                break;
            case "View all Employees":
                viewAllEmployees();
                break;
            case "Add a Department":
                addDepartment();
                break;
            case "Add a Role":
                addRole();
                break;
            case "Add an Employee":
                addEmployee();
                break;
            case "Add a Manager":
                addManager();
                break;
            case "Update an Employee Role":
                updateEmployeeRole();
                break;
            case "View Employees by Department":
                viewEmployeeByDepartment();
                break;
            case "View Employees by Manager":
                viewEmployeeByManager();
                break;
            case "Delete | Departments | Roles | Employees":
                deleteDRE();
                break;
            case "Exit":
                db.end();
                console.log("Thank you GoodBye!");
                break; 
        }
    });
}



// View all Departments
function viewAllDepartments(){
    const query = "SELECT * FROM departments";
    db.query(query, (err, res) => {
        if(err) throw err;
        console.table(res);

        // reinitialize app
        init();
    });
};


// view all roles
function viewAllRoles(){
    const query = "SELECT roles.title, roles.id, departments.department_name, roles.salary from roles oin departments on roles.department_id = departments.id";
    db.query(query, (err, res) => {
        if(err) throw err;
        console.table(res);

        // reinitialize app
        init();
    })
}

// view all employees
function viewAllEmployees(){
    const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, "" , m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;`;

    db.query(query, (err, res) => {
        if(err) throw err;
        console.table(res);

        // reinitialize app
        init();
    })
}

// add a department
function addDepartment(){
    inquirer.prompt({
        type: "input",
        name: "name",
        message: "Enter the new department name: ",
    }).then((selected) => {
        console.log(selected.name);
        
        const query = `INSERT INTO departments (department_name) VALUES ("${selected.name}")`;
        db.query(query, (err, res) => {
            if(err) throw err;
            console.log(`Department ${selected.name} to the database!`);

            // reinitialize app
            init();
            console.log(selected.name);
        });
    });
}

// add a role
function addRole(){
    const query = "SELECT * FROM departments";

    db.query(query, (err, res) => {
        if(err) throw err;
        inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Please Enter the title for the new role: "
            },

            {
                type: "input",
                name: "salary",
                message: "Please Enter the salary for the new role: "
            },

            {
                type: "list",
                name: "department",
                message: "Please Select the department for the new role: ",
                choices: res.map((department) => department.department_name)
            }
        ])

        .then((selected) => {
            const selectedDepartment = res.find((dept) => dept.department.name === selected.department);

            const query = "INSERT INTO roles SET?";
            db.query(query, 
                {
                    title: selected.title,
                    salary: selected.salary,
                    department_id: selectedDepartment
                },
                (err, res) => {
                    if(err) throw err;
                    console.log(`Role ${selected.title} with salary ${selected.salary} added to the ${selected.department_id} department!`);
                    
                    // reinitialize app
                    init();
            });
        });
    });
}

// add an employee
function addEmployee(){

    // pulling list of roles from db
    db.query("SELECT id, title FROM roles", (err, res) => {
        if(err){
            console.error(err);
            return;
        }

        const roles = res.map(({id, title}) => ({
            name:  title,
            value: id,
        }));


        db.query(
            `SELECT id, CONCAT(first_name, "", last_name) AS name FROM employee`,
            (err, res) => {
                if(err){
                    console.error(err);
                    return;
                }

                const managers = res.map(({id, name}) => ({
                    name,
                    value: id
                }));


                inquirer.prompt([
                    {
                        type: "input",
                        name: "firstName",
                        message: "Employee first name: "
                    },

                    {
                        type: "input",
                        name: "lastName",
                        message: "Employee last name: "
                    },

                    {
                        type: "list",
                        name: "roleId",
                        message: "Choose the employee role: ",
                        choices: roles
                    },

                    {
                        type: "list",
                        name: "managerId",
                        message: "Choose the employee manager: ",
                        choices: [{name: "none", value: null}, managers]
                    }
                ])
                .then((selected) => {
                    // insert the employee

                    const query = "INSERT INTO employee (first_name, last_name, role_id, managerr_id) VALUES (?,?,?,?)";
                    const values = [
                        selected.firstName,
                        selected.lastName,
                        selected.roleId,
                        selected.managerId
                    ];

                    db.query(query, values, (err) => {
                        if(err){
                            console.error(err);
                            return;
                        }

                        console.log("Employee Added !");

                        // reninitialize app
                        init();
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
            }
        );

    });
};

// add a manager

function addManager(){

    const queryDept = "SELECT * FROM departments";
    const queryEmply = "SELECT * FROM employee";
    
    
    db.query(queryDept, (err, res) => {
        if(err)throw err;
        inquirer.prompt([
            {
                type: "list",
                name: "department",
                message: "Choose the department:",
                choices: res.map((department) => department.department_name)
            },

            {
                type: "list",
                name: "employee",
                message: "choose the employee whom adding a manager to: ",
                choices: res.map((employee) => `${employee.first_name} ${employee.last_name}`)
            },

            {
                type: "list",
                name: "manager",
                message: "Choose the employee's manager: ",
                choices: res.map((employee) => `${employee.first_name} ${employee.last_name}`)
            }
        ]).then((selected) => {
            const dept = res.find((department) => department.department_name === selected.department)
            const employee = res.find((employee) => `$${employee.first_name} ${employee.last_name}` === selected.employee);
            const manager = res.find((employee) => `${employee.first_name} ${employee.last_name}` === selected.manager);

            const query = "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
            db.query(query,
                [manager.id, employee.id, dept.id],
                (err, res) => {
                    if(err) throw err;
                    console.log(`Manager ${manager.first_name} ${manager.last_name} added to employee ${employee.first_name} ${employee.last_name} in ${dept.department_name} department!`);

                    // reinitialize app
                    init();
                })
        });
    });
};

// update an employee role
function updateEmployeeRole(){
    const queryEmply = "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";
    const queryRoles = "SELECT * FROM roles";
    db.query(queryEmply, (err, res) => {
        if(err) throw err;
        db.query(queryRoles, (err, res) => {
            if(err) throw err;
            inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Choose the employee to update: ",
                    choices: res.map((employee) => `${employee.first_name} ${employee.last_name}`)
                },

                {
                    type: "list",
                    name: "role",
                    message: "Choose the new role: ",
                    choices: resRoles.map((role) => role.title)
                }
            ])
            .then((selected) => {
                const employee = res.find((employee) => `${employee.first_name} ${employee.last_name}` === selected.employee);
                const role = res.find((role) => role.title === selected.role);

                const query = "UPDATE employee set role_id = ? WHERE id = ?";
                db.query(query,
                    [role.id, employee.id],
                    (err,res) => {
                        if(err) throw err;
                        console.log(`Updated successfully ${employee.first_name} ${employee.last_name}'s role to ${role.title} !`);

                        // reinitialize app
                        init();
                    })
            })
        })
    })
}


process.on("exit", () => {
    db.end();
});