const express = require("express");
const { isLoggedIn, isInstructor } = require("../middlewares/middleware");
const User = require("../models/user");
const Evaluation = require("../models/evaluation");
const router = express.Router();

//Instructor Assessment View Page
router.get(
  "/assessments-instructor",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      // Fetch all users where user_type is 'student'
      const allStudents = await User.find({ user_type: "student" });

      res.render("instructor_assessments_view", { allStudents });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);
//See a particular student's assessment
router.get("/assessments/:studentId", isLoggedIn, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId); // Find the student
    if (!student) {
      return res.status(404).send("Student not found");
    }

    // Find all evaluations where the student is the evaluatee
    const evaluations = await Evaluation.find({ evaluatee: student._id });

    if (!evaluations || evaluations.length === 0) {
      return res.render("assessments_error", { student });
    }

    // Calculate the totals and count
    const totalScores = evaluations.reduce(
      (totals, evaluation) => {
        totals.cooperation += evaluation.cooperation.rating;
        totals.conceptualContribution +=
          evaluation.conceptual_contribution.rating;
        totals.practicalContribution +=
          evaluation.practical_contribution.rating;
        totals.workEthic += evaluation.work_ethic.rating;
        totals.averageScore += evaluation.average_score;
        totals.count += 1;
        return totals;
      },
      {
        cooperation: 0,
        conceptualContribution: 0,
        practicalContribution: 0,
        workEthic: 0,
        averageScore: 0,
        count: 0,
      },
    );

    // Compute the averages, rounded to 1 decimal place
    const averages = {
      cooperation: (totalScores.cooperation / totalScores.count).toFixed(1),
      conceptualContribution: (
        totalScores.conceptualContribution / totalScores.count
      ).toFixed(1),
      practicalContribution: (
        totalScores.practicalContribution / totalScores.count
      ).toFixed(1),
      workEthic: (totalScores.workEthic / totalScores.count).toFixed(1),
      averageScore: (totalScores.averageScore / totalScores.count).toFixed(1),
    };

    // Respond with the evaluations and their averages
    res.render("assessment_student", {
      currentUser: req.user,
      student,
      evaluations,
      averages,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

//Detailed Assessments
router.get(
  "/assessments-detailed",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      // Fetch all students
      const students = await User.find({ user_type: "student" });

      // Fetch evaluations for each student without populating evaluator
      const studentsWithEvaluations = await Promise.all(
        students.map(async (student) => {
          const evaluations = await Evaluation.find({ evaluatee: student._id });
          return { student, evaluations };
        }),
      );

      // Render the page with the students and evaluations
      res.render("assessments_detailed", { studentsWithEvaluations });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

//Summarized Assessments
router.get(
  "/assessments-summary",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      //Aggregate the average ratings and scores for each student
      const summary = await Evaluation.aggregate([
        {
          $group: {
            _id: "$evaluatee", // Group by evaluatee (student)
            averageCooperation: { $avg: "$cooperation.rating" },
            averageConceptual: { $avg: "$conceptual_contribution.rating" },
            averagePractical: { $avg: "$practical_contribution.rating" },
            averageWorkEthic: { $avg: "$work_ethic.rating" },
            overallAverageScore: { $avg: "$average_score" },
          },
        },
      ]);

      //Populate student data for the summary
      const populatedSummary = await Promise.all(
        summary.map(async (record) => {
          const student = await User.findById(record._id);
          return {
            studentName: student.username,
            averageCooperation: record.averageCooperation.toFixed(1),
            averageConceptual: record.averageConceptual.toFixed(1),
            averagePractical: record.averagePractical.toFixed(1),
            averageWorkEthic: record.averageWorkEthic.toFixed(1),
            overallAverageScore: record.overallAverageScore.toFixed(1),
          };
        }),
      );
      res.render("assessments_summary", { studentsSummary: populatedSummary });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },
);

module.exports = router;
