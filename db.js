const mysql = require("mysql2/promise");
const config = require("./config");

async function query(sql, params) {
    const conn = await mysql.createConnection(config.db);
    const [rows] = await conn.query(sql, params);
    return rows;
}

module.exports = { query }
