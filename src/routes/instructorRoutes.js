const express = require("express");
const { isLoggedIn, isInstructor } = require("../middlewares/middleware");
const Team = require("../models/team");
const router = express.Router();

router.get("/instructor_index", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const teams = await Team.find({ instructor_id: req.user._id });
    res.render("instructor_index", { teams });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Will delete this, soon
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
