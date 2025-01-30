const express = require ('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const session = require('express-session');
const { log } = require('console');

const app = express()
const port = 3000;
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs');
app.use(express.static('public'));

const db = new sqlite3.Database('data/userData.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/', (req, res) => {
    res.render('homepage');
});

app.get('/aboutMe', (req, res) => {
    res.render('aboutMe');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/game1', (req, res) => {
    res.render('game1');
});

//Login doesn't work yet i'll get to fixing it then

app.post('/login', (req, res) => {
    console.log(req.body.user);
    console.log(req.body.pass);
    if(req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("There was an error:\n" +err);
            } else if (!row) {
                //create a new salt for this user
                const salt = crypto.randomBytes(16).toString('hex');
                
                //use the salt to hash the password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send("Database error:\n" + err);
                            } else {
                                res.send("Created new user!");
                            }
                        });
                    }
                });
            } else {
                //Compare stored password with provided passwor
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password:" + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');

                        if (row.password === hashedPassword) {
                            req.session.user = req.body.user;
                            res.redirect('/home');

                        } else {
                            res.send("Incorrect Password.")
                        }
                    }
                });
            }
        });
    } else {
        res.send("You need a username and password!")
    }
});

app.listen(3000, () => {
    console.log('Server started on PORT 3000.')
});