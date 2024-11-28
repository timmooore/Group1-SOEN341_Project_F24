const express = require("express");
const router = express.Router();
const { isLoggedIn, isInstructor } = require("../middlewares/middleware");
const Team = require("../models/team");
const User = require("../models/user");
const Class = require("../models/class");
const path = require("path");
const multer = require("multer");
const csv = require("csv-parser"); // CSV parsing library
const fs = require("fs");

// Multer Configuration for File Uploads. Points to uploads folder for temporary storage of file
// uploads
const upload = multer({ dest: path.join(__dirname, "../uploads") });

// Generate teams page for a specific class
router.get(
  "/classes/:classId/generate-teams",
  isLoggedIn,
  isInstructor,
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Validate that the class exists and is managed by the instructor
      const currentClass = await Class.findOne({
        _id: classId,
        instructor_id: req.user._id,
      });
      if (!currentClass) {
        return res
          .status(403)
          .json({ error: "Unauthorized to manage this class." });
      }

      res.render("generate_teams", { classId });
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "An error occurred while accessing this page." });
    }
  },
);

// Handle team generation for a specific class
router.post(
  "/classes/:classId/generate-teams",
  isLoggedIn,
  isInstructor,
  upload.single("csvFile"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const teamSize = parseInt(req.body.teamSize);
      const filePath = req.file.path; // Use Multer's generated file path

      // Validate that the class exists and is managed by the instructor
      const currentClass = await Class.findOne({
        _id: classId,
        instructor_id: req.user._id,
      });
      if (!currentClass) {
        fs.unlinkSync(filePath); // Clean up uploaded file
        return res
          .status(403)
          .json({ error: "Unauthorized to manage this class." });
      }

      const students = [];

      // Read and parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csv({ headers: ["firstName", "lastName"] }))
        .on("data", (row) => {
          students.push(row);
        })
        .on("end", async () => {
          try {
            // Calculate the number of teams needed
            const numberOfTeams = Math.floor(students.length / teamSize);

            // Create empty teams for the class
            const teams = [];
            for (let i = 0; i < numberOfTeams; i++) {
              const newTeam = new Team({
                team_name: `Team ${i + 1}`,
                instructor_id: req.user._id,
                class_id: classId, // Associate team with the class
                student_ids: [],
              });
              await newTeam.save();
              teams.push(newTeam);
            }

            // Check if user exists or create a new user, and assign them to teams
            for (let i = 0; i < students.length; i++) {
              const student = students[i];
              const username = `${student.firstName.toLowerCase()}_${student.lastName.toLowerCase()}`;

              let existingUser = await User.findOne({ username });

              if (!existingUser) {
                // If user does not exist, create a new user
                const newUser = new User({
                  username,
                  user_type: "student",
                });
                await newUser.setPassword("password"); // Set default password
                await newUser.save();
                existingUser = newUser;
              }

              // Assign the user (new or existing) to a team
              const teamIndex = i % numberOfTeams; // Round-robin team assignment
              teams[teamIndex].student_ids.push(existingUser._id);
              await teams[teamIndex].save();
            }

            // Clean up uploaded CSV file
            fs.unlinkSync(filePath);
            res.redirect(`/classes/${classId}/teams`);
          } catch (error) {
            console.error(error);
            fs.unlinkSync(filePath);
            res
              .status(500)
              .json({ error: "An error occurred while generating teams." });
          }
        });
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .json({ error: "An error occurred while processing the request." });
    }
  },
);

//Search route for the edit team page (and more, later)
router.get("/search-students", isInstructor, async (req, res) => {
  const query = req.query.query;

  try {
    const students = await User.find({
      username: { $regex: query, $options: "i" }, //Look for all students with a matching prefix (regex)
      user_type: "student", // Hardcoded to only search for students
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

router.get("/profile", isLoggedIn, async (req, res) => {
  const currentUser = req.user;
  res.render("profile", { currentUser }); //Don't need this, but just in case yk
});

router.post("/user/updatePassword", isLoggedIn, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Ensure the new password and confirmation match
  if (newPassword !== confirmPassword) {
    req.flash("error", "New passwords do not match!");
    return res.redirect("back");
  }

  try {
    const user = await User.findById(req.user._id);
    // Check current password
    const isMatch = await user.authenticate(currentPassword);
    if (!isMatch) {
      req.flash("error", "Current password is incorrect!");
      return res.redirect("back");
    }

    // Set the new password
    await user.setPassword(newPassword);
    await user.save();

    req.flash("success", "Password updated successfully!");
    if (req.user.user_type === "student") {
      res.redirect("/student_index");
    } else {
      res.redirect("/instructor_index");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("back");
  }
});

module.exports = router;
