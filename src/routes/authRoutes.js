const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();

router.get("/register", (req, res) => res.render("register"));
router.post("/register", async (req, res, next) => {
  try {
    const { username, password, user_type } = req.body;
    const user = new User({ username, user_type });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err); //Callback function if an error occurs
      // If they're an instructor, go to the instructor dashboard; otherwise, go to the student
      // dashboard
      return res.redirect(
        req.user.user_type === "instructor"
          ? "/instructor_index"
          : "/student_index",
      );
    });
  } catch {
    res.redirect("register"); //Something hrouterened, so go back to the register page
  }
});

router.get("/login", (req, res) => res.render("login"));
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    // Login fix
    res.redirect(
      req.user.user_type === "instructor"
        ? "/instructor_index"
        : "/student_index",
    );
  },
);

// Passport logout requires a callback function, so it has a bit more code
router.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/login");
  });
});

module.exports = router;
