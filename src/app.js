const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");

// MODELS
const User = require("./models/user");

// Initialize Express App
const app = express();

//Serves static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

//Remember to npm install path and ejs and ejs mate for this
// View Engine Setup
app.engine("ejs", ejsMate); //Use ejsMate instead of default express engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); //Helps with parsing the request body
app.use(methodOverride("_method")); //This helps with changing/naming the HTTP Requests
app.use(express.json()); // Parses JSON data (from API requests)

const sessionConfig = {
  secret: "soen341",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
//app.use(flash()); //Need to set this up

app.use(passport.initialize());
app.use(passport.session()); //Be sure to 'use' this after we use 'session'
// Middleware for flash messages
app.use(flash());

// Telling passport to use the passport-given authentication
passport.use(new LocalStrategy(User.authenticate()));

// How to store a user in the session i.e. log them in & keep them logged in
passport.serializeUser(User.serializeUser());

//How to remove a user from a session i.e. log them out
passport.deserializeUser(User.deserializeUser());

// Global Middleware for Current User
// Middleware that'll execute on every request to the server
app.use((req, res, next) => {
  //Note that res.locals is meant for data passed to the "views" folder. It's not automatically
  // available in all routes!
  res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); //Flashes a message if the req succeeds (The specific messages are set up in the routes)
    res.locals.error = req.flash('error'); //Flashes a message if the req fails (The specific messages are set up in the routes)
  next();
});

// ROUTES
app.use("/", require("./routes/index")); // Home Route
app.use("/", require("./routes/authRoutes")); // Authentication Routes
app.use("/", require("./routes/studentRoutes")); // STUDENT ROUTES
app.use("/", require("./routes/instructorRoutes")); //INSTRUCTOR ROUTES
app.use("/", require("./routes/teamsRoutes")); //TEAMS ROUTES
app.use("/", require("./routes/assessmentRoutes")); //ASSESSMENT ROUTES
app.use("/", require("./routes/miscRoutes")); // MISCELLANEOUS ROUTES

module.exports = app;
