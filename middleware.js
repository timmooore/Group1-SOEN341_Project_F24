module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { 
        //Add flash here, later => *Advise user they need to be logged in to proceed
        console.log("Not authenticated");
        return res.redirect('/login');
    }
    next();
}