
const connection = mysql.createConnection({
    host: "localhost",
    port: 3333,
    user: "root",
    password: "",
    database: "employeeTracker_db"
})

module.exports = connection;