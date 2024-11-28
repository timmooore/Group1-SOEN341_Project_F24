const express = require("express");
const { isLoggedIn, isInstructor } = require("../middlewares/middleware");
const Team = require("../models/team");
const User = require("../models/user");
const router = express.Router();

router.post("/teams/new", isLoggedIn, isInstructor, async (req, res) => {
  try {
    const { team_name } = req.body;

    // No need to fetch the user again, req.user already has the authenticated user info
    const newTeam = new Team({
      team_name: team_name,
      instructor_id: req.user._id, // Use req.user._id directly here
      student_ids: [],
    });

    await newTeam.save();
    res.redirect("/instructor_index");
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// View page for a given team (for students, to be honest)
router.get("/teams/:teamId", isLoggedIn, async (req, res) => {
  try {
    // Fetch the team by its ID and populate the students in the team
    const team = await Team.findById(req.params.teamId).populate("student_ids");
    res.render("student_team_management", {
      team,
      currentUserId: req.user._id,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get(
  "/teams/:teamId/edit",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      // Fetch the team by its ID and populate the students in the team
      const team = await Team.findById(req.params.teamId).populate(
        "student_ids",
      );

      // Fetch all users where user_type is 'student'
      const allStudents = await User.find({ user_type: "student" });

      // Render the 'edit_team' view, passing both the team and all students
      res.render("edit_team", { team, allStudents });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

//Add student to a team from the instructor team_edit page
router.post("/teams/:teamId/add-student", isInstructor, async (req, res) => {
  try {
    const { studentId } = req.body;
    const team = await Team.findById(req.params.teamId);

    // Add the student to the team's student_ids array
    if (!team.student_ids.includes(studentId)) {
      team.student_ids.push(studentId);
      await team.save();
    }

    res.status(200).json({ message: "Student added successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
