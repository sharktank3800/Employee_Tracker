const mysql = require("mysql2");
const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_db"
});
db.connect((err) => {
    if(err) throw err;
    console.log("Successfully connected to database");

    // initialize app
    init();
})

module.exports = db;