const express = require("express");
const { isLoggedIn, isInstructor } = require("../middlewares/middleware");
const User = require("../models/user");
const Evaluation = require("../models/evaluation");
const Class = require("../models/class");
const router = express.Router();

//Instructor Assessment View Page
router.get(
  "/assessments-instructor/:classId",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Validate the class exists
      const currentClass = await Class.findById(classId);
      if (!currentClass) {
        return res.status(404).send("Class not found");
      }

      // Ensure the class is linked to the current instructor
      if (!currentClass.instructor_id.equals(req.user._id)) {
        return res.status(403).send("You are not authorized to view this class.");
      }

      // Fetch unique evaluatees from evaluations for the class
      const evaluations = await Evaluation.find({ class_id: classId });
      const studentIds = [...new Set(evaluations.map((eval) => eval.evaluatee))];

      // Fetch student details for those evaluatees
      const allStudents = await User.find({
        _id: { $in: studentIds },
        user_type: "student",
      });

      res.render("instructor_assessments_view", { allStudents, classId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "An error occurred while loading the page." });
    }
  },
);

// See a particular student's assessments for a specific class
router.get("/assessments/:classId/:studentId", isLoggedIn, async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    // Validate the class exists
    const currentClass = await Class.findById(classId);
    if (!currentClass) {
      return res.status(404).send("Class not found");
    }

    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).send("Student not found");
    }

    // Find all evaluations for the student within the current class
    const evaluations = await Evaluation.find({
      evaluatee: student._id,
      class_id: classId,
    });

    if (!evaluations || evaluations.length === 0) {
      return res.render("assessments_error", { student, classId });
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

    // Render the assessments page
    res.render("assessment_student", {
      currentUser: req.user,
      student,
      evaluations,
      averages,
      classId,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});


//Detailed Assessments
router.get(
  "/assessments-detailed/:classId",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Validate the class exists
      const currentClass = await Class.findById(classId);
      if (!currentClass) {
        return res.status(404).send("Class not found");
      }

      // Fetch unique evaluatees from evaluations for the class
      const evaluations = await Evaluation.find({ class_id: classId });
      const studentIds = [...new Set(evaluations.map((eval) => eval.evaluatee))];

      // Fetch student details for those evaluatees
      const students = await User.find({
        _id: { $in: studentIds },
        user_type: "student",
      });

      // Fetch evaluations for each student
      const studentsWithEvaluations = await Promise.all(
        students.map(async (student) => {
          const studentEvaluations = evaluations.filter(
            (eval) => eval.evaluatee.toString() === student._id.toString(),
          );
          return { student, evaluations: studentEvaluations };
        }),
      );

      res.render("assessments_detailed", { studentsWithEvaluations, classId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  },
);

//Summarized Assessments
router.get(
  "/assessments-summary/:classId",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Validate the class exists
      const currentClass = await Class.findById(classId);
      if (!currentClass) {
        return res.status(404).send("Class not found");
      }

      // Ensure the class is linked to the current instructor
      if (!currentClass.instructor_id.equals(req.user._id)) {
        return res.status(403).send("You are not authorized to view this class.");
      }

      // Fetch unique evaluatee IDs from evaluations for the class
      const evaluations = await Evaluation.find({ class_id: classId });
      const studentIds = [...new Set(evaluations.map((eval) => eval.evaluatee))];

      // Fetch detailed student records
      const students = await User.find({
        _id: { $in: studentIds },
        user_type: "student",
      });

      // Aggregate average ratings and scores for each student
      const summary = await Promise.all(
        students.map(async (student) => {
          const studentEvaluations = evaluations.filter(
            (eval) => eval.evaluatee.toString() === student._id.toString(),
          );

          // Calculate average scores for the student
          const totalScores = studentEvaluations.reduce(
            (totals, evaluation) => {
              totals.cooperation += evaluation.cooperation.rating;
              totals.conceptualContribution += evaluation.conceptual_contribution.rating;
              totals.practicalContribution += evaluation.practical_contribution.rating;
              totals.workEthic += evaluation.work_ethic.rating;
              totals.overallScore += evaluation.average_score;
              totals.count += 1;
              return totals;
            },
            {
              cooperation: 0,
              conceptualContribution: 0,
              practicalContribution: 0,
              workEthic: 0,
              overallScore: 0,
              count: 0,
            },
          );

          const averages = {
            studentName: student.username,
            averageCooperation: (totalScores.cooperation / totalScores.count).toFixed(1),
            averageConceptual: (totalScores.conceptualContribution / totalScores.count).toFixed(1),
            averagePractical: (totalScores.practicalContribution / totalScores.count).toFixed(1),
            averageWorkEthic: (totalScores.workEthic / totalScores.count).toFixed(1),
            overallAverageScore: (totalScores.overallScore / totalScores.count).toFixed(1),
          };

          return averages;
        }),
      );

      res.render("assessments_summary", { studentsSummary: summary, classId });
    } catch (e) {
      console.error("Error fetching summary assessments:", e);
      res.status(500).json({ error: "An error occurred while loading the page." });
    }
  },
);

module.exports = router;
