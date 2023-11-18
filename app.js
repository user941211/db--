const express = require("express");
const session = require("express-session");
const dao = require("./service/dao");
const mysql = require('mysql2/promise');
const db = require("./config");
const app = express();
app.set("views", __dirname + "/view");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: "My Secret",
    resave: false,
    saveUninitialized: false
}))


app.get("/", async (req, res) => {
    try {
        const query = 'SELECT bid, title, writer, publisher FROM book'
        const [results, fields] = await db.execute(query);
        console.log(req.session.login)
        if (!req.session.login) {
            user = req.session.login
            res.render("list", { books: results })
        } else {
            obj = {};
            user = req.session.login;
            //obj.login = req.session.login;
            obj.records = results;
            res.render("list", { books: results, user })
        }
    } catch (err) {
        console.error('쿼리 실행 오류:', err);
        res.status(500).send('서버 오류');
    }
});

app.get("/login", async (req, res) => {
    res.render("login", { error: null })
})

app.post("/login", async (req, res) => {
    console.log(req.body)

    try {
        const email = req.body.email
        const password = req.body.password
        const user = await dao.getUserByEmail(email)

        if (user) {
            if (user.password === password) {
                req.session.login = { cid: user.cid, username: user.name }
                res.redirect("/")
            } else {
                res.render("login", { error: "비밀번호가 올바르지 않습니다!!!" })
            }
        } else {
            res.render("login", { error: "존재하지 않는 사용자입니다.^^" })
        }
    } catch (err) {
        console.error("로그인 오류:", err)
        res.status(500).send("서버 오류")
    }
})

app.post("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("로그아웃 오류:", err)
            res.status(500).send("서버 오류")
        } else {
            res.redirect("/")
        }
    })
})
app.get("/book", async (req, res) => {
    const connection = await mysql.createConnection(config)
    const [rows] = await connection.query('SELECT title, writer, publisher FROM book')

    res.render('list', { books: rows })
})

app.get('/book/:id', async (req, res) => {
    const bookId = req.params.id;

    try {
        const query = `SELECT bid, title, writer, description, available FROM book WHERE bid = ${bookId}`
        const [results, fields] = await db.execute(query);
        console.log(req.session.login)
        if (!req.session.login) {
            user = req.session.login
            res.render("detail", { books: results, user })
        } else {
            obj = {};
            obj.login = req.session.login;
            obj.records = results;
            res.render("detail", { books: results })
        }
    } catch (err) {
        console.error('쿼리 실행 오류:', err);
        res.status(500).send('서버 오류');
    }
});

app.post("/rent/:id", async (req, res) => {
    console.log(req.params)
    const bookId = req.params.id
    if (!req.session.login) {
        return res.render("alert")
    } else {
        const bookId = req.params.id;
        const user = req.session.login;

        try {
            const update = `UPDATE book SET available = 'N' WHERE bid = ${bookId}`;
            await db.execute(update);
            const insert = `INSERT INTO rental (bid, cid, due) VALUES (${bookId}, ${user.cid}, '2023-12-31')`;
            await db.execute(insert);
            const select = 'SELECT bid, title, writer, publisher, available FROM book';
            const [results, fields] = await db.execute(select);
            const userQuery = `SELECT * FROM customer WHERE cid = ${user.cid}`;
            const [userResults, userFields] = await db.execute(userQuery);
            const updatedUser = userResults[0];
            res.redirect(`/book/${bookId}`);
        } catch (error) {
            console.error("대출 오류:", error);
            res.status(500).send("서버 오류");
        }
    }

})

app.get('/library', async (req, res) => {
    const user = req.session.login;
    try {
        const query = `
            SELECT book.title, rental.due
            FROM rental
            JOIN book ON rental.bid = book.bid;
        `;
        const [results, fields] = await db.execute(query);
        console.log(results)
        res.render('library', { user, library: results });
    } catch (err) {
        console.error('쿼리 실행 오류:', err);
        res.status(500).send('서버 오류');
    }
   // res.render('library', { user })
})

app.listen(3000, () => {
    console.log("3000번 포트에서 대기중~~");
})