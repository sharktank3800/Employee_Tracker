const mysql = require("mysql2");
const inquirer = require("inquirer");
const db = require("./db/connection");

// start sql employee tracker
function init(){
    inquirer.createPromptModule({
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
            case "Delete Departments | Roles | Employees":
                deleteDRE();
                break;
            case "Exit":
                connection.end();
                console.log("Thank you GoodBye!");
                break; 
        }
    });
}


// View all Departments
