const express = require ('express');
const app = express()
const port = 3000;
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/', (req, res) => {
    res.render('homepage');
});

app.get('/aboutMe', (req, res) => {
    res.render('aboutMe');
});

app.get('/game1', (req, res) => {
    res.render('game1');
});

app.listen(3000, () => {
    console.log('Server started on PORT 3000.')
});