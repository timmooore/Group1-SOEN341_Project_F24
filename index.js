const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();

//Models
const User = require('./models/user');

//Connect to mongoose
mongoose.connect('mongodb://localhost:27017/soen341project');

//Mongoose's proposed db connection check
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); //Listens for "Error" event & triggers if found
db.once("open", () => { //Listens for "Open" event, i.e. an established connection with MongoDB & triggers if found
    console.log("Database connected");
});


//Remember to npm install path and ejs and ejs mate for this
app.engine('ejs', ejsMate); //Use ejsMate instead of default express engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) 

//This helps with parsing URL data - good to include for our forms
//Parses the request body
app.use(express.urlencoded({ extended: true }));

//Sessions provide statefullness & will help keep users logged in / logged out
app.use(session({secret : 'soen341'}));
//Remember to npm install method-override for this
//This helps with changing/naming the HTTP Requests
app.use(methodOverride('_method'));

//MIDDLEWARE
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

//ROUTES
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }
    else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    //req.session.destroy();
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.listen(3000, () => {
    console.log("SERVING YOUR APP!")
})