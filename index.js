const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const app = express();

//Connect to mongoose
/* MODIFY THIS LINE BELOW FOR THE SOEN 341 PROJECT DB */
//mongoose.connect('mongodb://localhost:27017/soen341project');

/* **DISABLED UNTIL I GET THE DATABASE RUNNING**
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); //Listens for "Error" event & triggers if found
db.once("open", () => { //Listens for "Open" event, i.e. an established connection with MongoDB & triggers if found
    console.log("Database connected");
});
*/

//Remember to npm install path and ejs and ejs mate for this
app.engine('ejs', ejsMate); //Use ejsMate instead of default express engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//This helps with parsing URL data - good to include for our forms
app.use(express.urlencoded({ extended: true }));

//Remember to npm install method-override for this
//This helps with changing/naming the HTTP Requests
app.use(methodOverride('_method'));

//ROUTES
//Home/Login Page
app.get('/', (req, res) => {
    res.render('login')
});

//Runs server on port 3000
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})