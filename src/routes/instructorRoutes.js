const express = require("express");
const { isLoggedIn, isInstructor } = require("../middlewares/middleware");
const Team = require("../models/team");
const Class = require('../models/class');
const router = express.Router();

router.get("/instructor_index", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const teams = await Team.find({ instructor_id: req.user._id });
    res.render("instructor_index", { teams });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Display the class creation form
router.get('/instructor/classes/new', isInstructor, (req, res) => {
  res.render('new-class');
});

// Create a new class
router.post('/instructor/classes/new', isInstructor, async (req, res) => {
  try {
      const { class_name } = req.body;

      // Create the new class
      const newClass = new Class({
          class_name,
          instructor_id: req.user._id,
      });
      await newClass.save();

      res.redirect('/instructor/classes'); // Redirect to the list of classes
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

// Display the list of all classes
router.get('/instructor/classes', isInstructor, async (req, res) => {
  try {
      const classes = await Class.find({ instructor_id: req.user._id });
      res.render('classes', { classes });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

// Route added for the team_management.ejs file accessed from instructor_index.ejs
router.get("/team_management", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const teams = await Team.find({ instructor_id: req.user._id });
    res.render("team_management", { teams });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Route added for the course_roster.ejs file accessed from instructor_index.ejs
router.get("/course_roster", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const teams = await Team.find({ instructor_id: req.user._id });
    res.render("course_roster", { teams });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
