const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
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

//Fix this session with sessionConfig - TO DO LATER**
app.use(session({secret : 'soen341'})); //Sessions provide statefullness & will help keep users logged in / logged out
app.use(express.urlencoded({ extended: true })); //Helps with parsing the request body
app.use(methodOverride('_method')); //This helps with changing/naming the HTTP Requests

app.use(passport.initialize());
app.use(passport.session()); //Be sure to 'use' this after we use 'session'
passport.use(new LocalStrategy(User.authenticate())); //Telling passport to use the passport-given authentication method for our User model
passport.serializeUser(User.serializeUser()); //How to store a user in the session i.e. log them in & keep them logged in
passport.deserializeUser(User.deserializeUser()); //How to remove a user from a session i.e. log them out

//ROUTES
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password, user_type } = req.body;
    const user = new User({ username, user_type });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    res.redirect('/secret');
})

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', (req, res) => {
    res.redirect('/secret');
})

app.post('/logout', (req, res) => {
    //Changing this to implement passport
    res.redirect('/login');
})

app.get('/secret', (req, res) => {
    res.render('secret')
})

app.listen(3000, () => {
    console.log("SERVING YOUR APP!")
})