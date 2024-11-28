const express = require("express");
const path = require("path");
const { isLoggedIn, isInstructor } = require("../middlewares/middleware");
const User = require("../models/user");
const Team = require("../models/team");
const router = express.Router();
// This stuff is for the csv/file upload functionality
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

// Multer Configuration for File Uploads. Points to uploads folder for temporary storage of file
// uploads
const upload = multer({ dest: path.join(__dirname, "../uploads") });

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

//Generate teams page
router.get("/generate-teams", isLoggedIn, isInstructor, (req, res) => {
  res.render("generate_teams");
});

// Route to handle team generation
router.post("/generate-teams", upload.single("csvFile"), async (req, res) => {
  try {
    const teamSize = parseInt(req.body.teamSize);
    const filePath = req.file.path; // Use Multer's generated file path

    const students = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv({ headers: ["firstName", "lastName"] }))
      .on("data", (row) => {
        students.push(row);
      })
      .on("end", async () => {
        // Calculate the number of teams needed
        // Excess students means there'll be teams with more students (not less)
        const numberOfTeams = Math.floor(students.length / teamSize);

        // Create empty teams
        const teams = [];
        for (let i = 0; i < numberOfTeams; i++) {
          const newTeam = new Team({
            team_name: `Team ${i + 1}`,
            instructor_id: req.user._id, // Assuming instructor is logged in
            student_ids: [],
          });
          await newTeam.save();
          teams.push(newTeam);
        }

        // Check if user exists or create a new user, and assign them to teams
        for (let i = 0; i < students.length; i++) {
          const student = students[i];
          const username = `${student.firstName.toLowerCase()}_${student.lastName.toLowerCase()}`;

          // Use passport-local-mongoose's built-in findByUsername
          let existingUser = await User.findByUsername(username);

          if (!existingUser) {
            // If user does not exist, create a new user
            const newUser = new User({
              username,
              user_type: "student",
            });
            await newUser.setPassword("password"); // Set default password
            await newUser.save();
            existingUser = newUser; // Set the new user as the existing user
          }

          // Assign the user (new or existing) to a team
          const teamIndex = i % numberOfTeams; // Round-robin team assignment
          teams[teamIndex].student_ids.push(existingUser._id);
          await teams[teamIndex].save();
        }

        // Clean up uploaded CSV file
        fs.unlinkSync(filePath);
        res.redirect("/instructor_index");
      });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "An error occurred while generating teams." });
  }
});

module.exports = router;
