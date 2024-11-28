const express = require("express");
const { isLoggedIn, isStudent } = require("../middlewares/middleware");
const User = require("../models/user");
const Team = require("../models/team");
const Evaluation = require("../models/evaluation");
const router = express.Router();

router.get("/student_index", isLoggedIn, isStudent, async (req, res) => {
  try {
    const teams = await Team.find({ student_ids: req.user._id });
    res.render("student_index", { teams });
    //res.render('student_index', { teams });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Will delete this, soon
router.get(
  "/student_team_management",
  isLoggedIn,
  isStudent,
  async (req, res) => {
    try {
      const teams = await Team.find({ student_ids: req.user._id });
      res.render("student_team_management", { teams });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

// Student id - evaluator; student id - evaluatee
router.get(
  "/students/:evaluatorId/assessment/:evaluateeId",
  isLoggedIn,
  isStudent,
  async (req, res) => {
    try {
      const evaluatee = await User.findById(req.params.evaluateeId);
      res.render("assessment", { currentUser: req.user, evaluatee });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

router.post(
  "/students/:evaluatorId/assessment/:evaluateeId",
  isLoggedIn,
  isStudent,
  async (req, res) => {
    try {
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

      const newEvaluation = new Evaluation({
        evaluator: req.params.evaluatorId,
        evaluatee: req.params.evaluateeId,
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
      res.redirect("/student_index");
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

router.get(
  "/students/:evaluatorId/assessment/:evaluateeId/confirm",
  isLoggedIn,
  isStudent,
  (req, res) => {
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
    });
  },
);

module.exports = router;
