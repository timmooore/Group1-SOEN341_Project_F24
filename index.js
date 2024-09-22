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

//ROUTES
/* Note: Post routes are disabled until I get the basic functionality to work. 
Pushing & Committing so we can all have access to the html pages */

//Home Route - Currently routes you to the Login page
//Will change this soon **
app.get('/', (req, res) => {
    if(!req.session.user_id) {
        console.log("This user isn't logged in, so let's redirect them") //For bug testing, will delete later.
        res.render('login');
    }
    else {
        res.redirect('/');
    }
})

//Login Route
app.get('/login', (req, res) => {
    res.render('login');
})

/*
app.post('/login', async    (req, res) => {
    const { username, password } = req.body;
    const user = User.findOne({ username });
    const validPassword = await bcrypt.compare(password, user.password);
    //If user not found and/or password doesn't match
    if(validPassword) {
        req.session.user_id = user._id;
        res.redirect('/');
    }
    else {
        res.redirect('login');
    }
})
*/

//Register Routes
app.get('/register', (req, res) => {
    res.render('register')
})

/*
app.post('/register', async(req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password: hash
    })
    await user.save();
    //Change the redirect once we have a better route **
    req.session.user_id = user._id;
    res.redirect('/'); 
})
*/

//Runs server on port 3000
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})