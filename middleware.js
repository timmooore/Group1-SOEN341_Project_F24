isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { 
        //Add flash here, later => *Advise user they need to be logged in to proceed
        console.log("Not authenticated"); //For testing purposes
        return res.redirect('/login');
    }
    next();
}
isInstructor = (req, res, next) => {
    if (req.isAuthenticated() && req.user.user_type === 'instructor') {
      return next();
    }
    res.status(403).json({ message: 'Access restricted to instructors only' });
  }
isStudent = (req, res, next) => {
    if (req.isAuthenticated() && req.user.user_type === 'student') {
      return next();
    }
    res.status(403).json({ message: 'Access restricted to students only' });
  }

module.exports = {
    isLoggedIn,
    isInstructor,
    isStudent
};
  