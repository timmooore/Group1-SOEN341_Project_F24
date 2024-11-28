const express = require("express");
const { isLoggedIn, isInstructor, isStudent } = require("../middlewares/middleware");
const Team = require("../models/team");
const User = require("../models/user");
const Class = require("../models/class"); // Import the Class model
const router = express.Router();

// Route to create a new team for a specific class
router.post("/classes/:classId/teams/new", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const { team_name } = req.body;
    const { classId } = req.params;

    // Validate that the class exists and is managed by the current instructor
    const currentClass = await Class.findOne({ _id: classId, instructor_id: req.user._id });
    if (!currentClass) {
      return res.status(403).json({ error: "Unauthorized to manage this class" });
    }

    // Create the new team and associate it with the class
    const newTeam = new Team({
      team_name,
      instructor_id: req.user._id,
      class_id: classId, // Associate the team with the class
      student_ids: [],
    });

    await newTeam.save();
    res.redirect(`/classes/${classId}/teams`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Route to view teams for a specific class (index page)
router.get("/classes/:classId/teams", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const { classId } = req.params;

    // Validate that the class exists and is managed by the current instructor
    const currentClass = await Class.findOne({ _id: classId, instructor_id: req.user._id });
    if (!currentClass) {
      return res.status(403).json({ error: "Unauthorized to manage this class" });
    }

    // Fetch all teams for the specified class
    const teams = await Team.find({ class_id: classId }).populate("student_ids");

    res.render("class-teams", { teams, classId, currentUser: req.user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// View page for a specific team (students can view the team they are in)
router.get("/teams/:classId/:teamId", isLoggedIn, async (req, res) => {
  try {
    const { classId, teamId } = req.params;

    // Validate the class exists
    const currentClass = await Class.findById(classId);
    if (!currentClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Fetch the team details
    const team = await Team.findById(teamId).populate("student_ids");
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.render("student_team_management", { team, classId, currentUserId: req.user._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while loading the team page." });
  }
});



// Route to edit a specific team
router.get("/teams/:classId/:teamId/edit", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const { classId, teamId } = req.params;

    // Validate the class exists and the instructor has access
    const currentClass = await Class.findOne({ _id: classId, instructor_id: req.user._id });
    if (!currentClass) {
      return res.status(403).json({ error: "Unauthorized to edit teams in this class" });
    }

    // Fetch the team details
    const team = await Team.findOne({ _id: teamId, class_id: classId }).populate("student_ids");
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Fetch all students
    const allStudents = await User.find({ user_type: "student" });

    res.render("edit_team", { team, allStudents, classId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while loading the edit team page." });
  }
});


// Add student to a specific team from the edit team page
router.post("/teams/:teamId/add-student", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const { studentId } = req.body;
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Ensure the instructor has access to this team
    const currentClass = await Class.findOne({ _id: team.class_id, instructor_id: req.user._id });
    if (!currentClass) {
      return res.status(403).json({ error: "Unauthorized to add students to this team" });
    }

    // Add the student to the team's student_ids array
    if (!team.student_ids.includes(studentId)) {
      team.student_ids.push(studentId);
      await team.save();
    }

    res.status(200).json({ message: "Student added successfully", classId: team.class_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
