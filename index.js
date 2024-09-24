const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash'); //Will use this later, but we haven't set much up yet 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const app = express(); 

//MODELS
//Serves static files from 'public' directory
app.use(express.static('public'));

//Models
const User = require('./models/user');
const Team = require('./models/team');

//MIDDLEWARE
//TO BE MODIFIED
const { isLoggedIn } = require('./middleware');

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

app.use(express.urlencoded({ extended: true })); //Helps with parsing the request body
app.use(methodOverride('_method')); //This helps with changing/naming the HTTP Requests

const sessionConfig = {
    secret: 'soen341',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig));
//app.use(flash()); //Need to set this up

app.use(passport.initialize());
app.use(passport.session()); //Be sure to 'use' this after we use 'session'
passport.use(new LocalStrategy(User.authenticate())); //Telling passport to use the passport-given authentication method for our User model

passport.serializeUser(User.serializeUser()); //How to store a user in the session i.e. log them in & keep them logged in
passport.deserializeUser(User.deserializeUser()); //How to remove a user from a session i.e. log them out

//Middleware that'll execute on every request to the server
app.use((req, res, next) => {
    res.locals.currentUser = req.user; //Has user info in the req session - Important !
    /* Setting this up, later, once we're more ahead.
    res.locals.success = req.flash('success'); //Flashes a message if the req succeeds (The specific messages are set up in the routes)
    res.locals.error = req.flash('error'); //Flashes a message if the req fails (The specific messages are set up in the routes)
    */ 
    next();
})

//ROUTES
//Note: Will move these into separate route folders, eventually*

app.get('/', isLoggedIn, (req, res) => {
    res.render('index')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        const { username, password, user_type } = req.body;
        const user = new User({ username, user_type });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            res.redirect('/secret');
        })
    } catch(e) {
        res.redirect('register');
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    //Login fix
    res.redirect('/');
})

//Passport logout requires a callback function, so it has a bit more code
app.post('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

//Test route for the user id with passport
app.post('/test', isLoggedIn, async (req, res) => {
    try {
    const testUser = await User.findById(req.user._id);
    console.log(testUser);
    console.log(testUser._id);
    console.log(testUser.username);
    console.log(testUser.user_type);
    } catch(e) {
    console.log("Almost exploded lol");
    }
res.redirect('/');
})

app.listen(3000, () => {
    console.log("SERVING YOUR APP!")
})