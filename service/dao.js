const db = require("../config");

async function getAll() {
    const sql = "select * from customer";
    const results = await db.query(sql);
    if (!results)
        return [];
    else
        return results;
}

async function getUserByEmail(email){
    const query = `SELECT * FROM customer WHERE email = '${email}'`;
    const [results, fields] = await db.execute(query);
    return results.length > 0? results[0]:null
}


module.exports = { getAll, getUserByEmail}