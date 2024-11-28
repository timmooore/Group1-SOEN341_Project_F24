const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();

// Render the registration page
router.get("/register", (req, res) => res.render("register"));

// Handle registration logic
router.post("/register", async (req, res, next) => {
  try {
    const { username, password, user_type } = req.body;
    const user = new User({ username, user_type });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        req.flash(
          "error",
          "An error occurred during login after registration.",
        );
        return next(err);
      }
      req.flash(
        "success",
        `Welcome, ${username}! You are successfully registered.`,
      );
      return res.redirect(
        req.user.user_type === "instructor"
          ? "/instructor_index"
          : "/student_index",
      );
    });
  } catch {
    req.flash("error", "Registration failed. Username might already be taken.");
    res.redirect("/register");
  }
});

// Render the login page
router.get("/login", (req, res) => res.render("login"));

// Handle login logic
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password.", // Flash message for failed login
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    res.redirect(
      req.user.user_type === "instructor"
        ? "/instructor_index"
        : "/student_index",
    );
  },
);

// Handle logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "An error occurred during logout.");
      return next(err);
    }
    req.flash("success", "You have successfully logged out.");
    res.redirect("/login");
  });
});

module.exports = router;
