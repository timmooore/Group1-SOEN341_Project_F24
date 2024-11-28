const express = require("express");
const { isLoggedIn, isStudent } = require("../middlewares/middleware");
const User = require("../models/user");
const Team = require("../models/team");
const Evaluation = require("../models/evaluation");
const Class = require("../models/class");
const router = express.Router();

router.get("/student_index", isLoggedIn, isStudent, async (req, res) => {
  try {
    // Find all classes where the student is part of at least one team
    const classes = await Class.find({
      _id: {
        $in: await Team.find({ student_ids: req.user._id }).distinct(
          "class_id",
        ),
      },
    });

    res.render("student_index", { classes });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "An error occurred while fetching your classes." });
  }
});

// Student index page to view all teams they are part of in a class
router.get(
  "/student/:classId/index",
  isLoggedIn,
  isStudent,
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Validate the class exists
      const currentClass = await Class.findById(classId);
      if (!currentClass) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Fetch teams the student is part of within this class
      const teams = await Team.find({
        class_id: classId,
        student_ids: req.user._id,
      });

      res.render("student_class_teams", {
        teams,
        classId,
        currentUser: req.user,
      });
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "An error occurred while fetching your teams." });
    }
  },
);

// Route for students to manage teams in a specific class
router.get(
  "/student/:classId/team_management",
  isLoggedIn,
  isStudent,
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Validate the class exists
      const currentClass = await Class.findById(classId);
      if (!currentClass) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Fetch teams the student is part of within this class
      const teams = await Team.find({
        class_id: classId,
        student_ids: req.user._id,
      });

      res.render("student_team_management", { teams, classId });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

// Route to render the assessment page for a student
router.get(
  "/student/:classId/assessment/:evaluatorId/:evaluateeId",
  isLoggedIn,
  isStudent,
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Validate the class exists
      const currentClass = await Class.findById(classId);
      if (!currentClass) {
        return res.status(404).json({ error: "Class not found" });
      }

      const evaluatee = await User.findById(req.params.evaluateeId);
      res.render("assessment", { currentUser: req.user, evaluatee, classId });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

// Route to submit an assessment
router.post(
  "/student/:classId/assessment/:evaluatorId/:evaluateeId",
  isLoggedIn,
  isStudent,
  async (req, res) => {
    try {
      const { classId, evaluatorId, evaluateeId } = req.params;

      // Validate the class exists
      const currentClass = await Class.findById(classId);
      if (!currentClass) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Extract ratings and feedback from the request body
      const {
        cooperation,
        cooperation_feedback,
        conceptual_contribution,
        conceptual_feedback,
        practical_contribution,
        practical_feedback,
        work_ethic,
        work_feedback,
      } = req.body;

      // Create a new evaluation
      const newEvaluation = new Evaluation({
        evaluator: evaluatorId,
        evaluatee: evaluateeId,
        class_id: classId, // Include classId in the evaluation
        cooperation: { rating: cooperation, feedback: cooperation_feedback },
        conceptual_contribution: {
          rating: conceptual_contribution,
          feedback: conceptual_feedback,
        },
        practical_contribution: {
          rating: practical_contribution,
          feedback: practical_feedback,
        },
        work_ethic: { rating: work_ethic, feedback: work_feedback },
      });

      await newEvaluation.save();

      // Redirect back to the student's dashboard for the class
      res.redirect(`/student/${classId}/index`);
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "An error occurred while submitting the assessment." });
    }
  },
);

// Route to confirm an assessment
router.get(
  "/student/:classId/assessment/:evaluatorId/:evaluateeId/confirm",
  isLoggedIn,
  isStudent,
  (req, res) => {
    const { classId } = req.params;

    const {
      cooperation,
      cooperation_feedback,
      conceptual_contribution,
      conceptual_feedback,
      practical_contribution,
      practical_feedback,
      work_ethic,
      work_feedback,
    } = req.query;

    res.render("confirm", {
      evaluateeId: req.params.evaluateeId,
      evaluatorId: req.params.evaluatorId,
      cooperation,
      cooperation_feedback,
      conceptual_contribution,
      conceptual_feedback,
      practical_contribution,
      practical_feedback,
      work_ethic,
      work_feedback,
      classId,
    });
  },
);

module.exports = router;
