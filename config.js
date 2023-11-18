const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: "localhost",
    user: "nodejs",
    password: "1234",
    database: "nodedb",
    waitForConnections: true,
    connectionLimit: 10,
})

module.exports = db