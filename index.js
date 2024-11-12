const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash'); //Will use this later, but we haven't set much up yet 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const app = express(); 
// This stuff is for the csv/file upload functionality
const fs = require('fs');
const multer = require('multer');
const csv = require('csv-parser');

const upload = multer({ dest: path.join(__dirname, 'uploads')});  // Points to uploads folder for temporary storage of file uploads 

//Serves static files from 'public' directory
app.use(express.static('public'));

//MODELS
const User = require('./models/user');
const Team = require('./models/team');
const Evaluation = require('./models/evaluation');

//MIDDLEWARE
//TO BE MODIFIED
const { isLoggedIn, isInstructor, isStudent } = require('./middleware');

//Connect to mongoose
mongoose.connect('mongodb://localhost:27017/soen341project');

//Mongoose's proposed db connection check
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); //Listens for "Error" event & triggers if found
db.once("open", () => { //Listens for "Open" event, i.e. an established connection with MongoDB & triggers if found
    console.log("Database connected");
});


//Remember to npm install path and ejs and ejs mate for this
app.engine('ejs', ejsMate); //Use ejsMate instead of default express engine
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true })); //Helps with parsing the request body
app.use(methodOverride('_method')); //This helps with changing/naming the HTTP Requests
app.use(express.json()); // Parses JSON data (from API requests)

const sessionConfig = {
    secret: 'soen341',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig));
//app.use(flash()); //Need to set this up

app.use(passport.initialize());
app.use(passport.session()); //Be sure to 'use' this after we use 'session'
passport.use(new LocalStrategy(User.authenticate())); //Telling passport to use the passport-given authentication method for our User model

passport.serializeUser(User.serializeUser()); //How to store a user in the session i.e. log them in & keep them logged in
passport.deserializeUser(User.deserializeUser()); //How to remove a user from a session i.e. log them out

//Middleware that'll execute on every request to the server
app.use((req, res, next) => {
    res.locals.currentUser = req.user; //Note that res.locals is meant for data passed to the "views" folder. It's not automatically available in all routes!
    /* Setting this up, later, once we're more ahead.
    res.locals.success = req.flash('success'); //Flashes a message if the req succeeds (The specific messages are set up in the routes)
    res.locals.error = req.flash('error'); //Flashes a message if the req fails (The specific messages are set up in the routes)
    */ 
    next();
})

//ROUTES
//Note: Will move these into separate route folders, eventually*

app.get('/', isLoggedIn, (req, res) => {
    res.render('index')
})

app.get('/register', (req, res) => {
    res.render('register')
})


app.post('/register', async (req, res) => {
    try {
        const { username, password, user_type } = req.body;
        const user = new User({ username, user_type });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err); //Callback function if an error occurs
            //If they're an instructor, go to the instructor dashboard; otherwise, go to the student dashboard
            if (req.user.user_type == 'instructor') {
                res.redirect('/instructor_index');
            }
            else {
                res.redirect('/student_index')
            }
        })
    } catch(e) {
        res.redirect('register'); //Something happened, so go back to the register page
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    //Login fix
    if (req.user.user_type == 'instructor') {
        res.redirect('/instructor_index');
    }
    else {
        res.redirect('/student_index')
    }
})

//Passport logout requires a callback function, so it has a bit more code
app.post('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

//Test route for the user id with passport
//Deleting this once testing's done.
app.post('/test', isLoggedIn, async (req, res) => {
    try {
    console.log(req.user);
    console.log(req.user._id);
    console.log(req.user.username);
    console.log(req.user.user_type);
    } catch(e) {
    console.log("Almost exploded lol"); 
    }
res.redirect('/');
})

//STUDENT ROUTES
app.get('/student_index', isLoggedIn, isStudent, async (req, res) => {
    try {
        const teams = await Team.find({ student_ids: req.user._id });
        res.render('student_index', { teams });
        //res.render('student_index', { teams });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// Will delete this, soon
app.get('/student_team_management', isLoggedIn, isStudent, async (req, res) => {
    try {
        const teams = await Team.find({ student_ids: req.user._id });
        res.render('student_team_management', { teams });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Student id - evaluator; student id - evaluatee
app.get('/students/:evaluatorId/assessment/:evaluateeId', isLoggedIn, isStudent, async (req, res) => {
    try {
      const evaluatee = await User.findById(req.params.evaluateeId);
      res.render('assessment', { currentUser: req.user, evaluatee });
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
});

app.post('/students/:evaluatorId/assessment/:evaluateeId', isLoggedIn, isStudent, async (req, res) => {
  try {
    const {
      cooperation,
      cooperation_feedback,
      conceptual_contribution,
      conceptual_feedback,
      practical_contribution,
      practical_feedback,
      work_ethic,
      work_feedback
    } = req.body;

    const newEvaluation = new Evaluation({
      evaluator: req.params.evaluatorId,
      evaluatee: req.params.evaluateeId,
      cooperation: { rating: cooperation, feedback: cooperation_feedback },
      conceptual_contribution: { rating: conceptual_contribution, feedback: conceptual_feedback },
      practical_contribution: { rating: practical_contribution, feedback: practical_feedback },
      work_ethic: { rating: work_ethic, feedback: work_feedback }
    });

    await newEvaluation.save();
    res.redirect('/student_index');
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/students/:evaluatorId/assessment/:evaluateeId/confirm', isLoggedIn, isStudent, (req, res) => {
  const { cooperation, cooperation_feedback, conceptual_contribution, conceptual_feedback, practical_contribution, practical_feedback, work_ethic, work_feedback } = req.query;
  
  res.render('confirm', {
    evaluateeId: req.params.evaluateeId,
    evaluatorId: req.params.evaluatorId,
    cooperation,
    cooperation_feedback,
    conceptual_contribution,
    conceptual_feedback,
    practical_contribution,
    practical_feedback,
    work_ethic,
    work_feedback
  });
});


//INSTRUCTOR ROUTES
app.get('/instructor_index', isLoggedIn, isInstructor, async (req, res) => {
    try {
      const teams = await Team.find({ instructor_id: req.user._id });
      res.render('instructor_index', { teams });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

//Will delete this, soon
// Route added for the team_management.ejs file accessed from instructor_index.ejs
app.get('/team_management', isLoggedIn, isInstructor, async (req, res) => {
    try {
        const teams = await Team.find({ instructor_id: req.user._id });
        res.render('team_management', { teams });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Route added for the course_roster.ejs file accessed from instructor_index.ejs
app.get('/course_roster', isLoggedIn, isInstructor, async (req, res) => {
    try {
        const teams = await Team.find({ instructor_id: req.user._id });
        res.render('course_roster', { teams });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
  
//TEAMS ROUTES
app.post('/teams/new', isLoggedIn, isInstructor, async (req, res) => {
    try {
      const { team_name } = req.body;
  
      // No need to fetch the user again, req.user already has the authenticated user info
      const newTeam = new Team({
        team_name: team_name,
        instructor_id: req.user._id,  // Use req.user._id directly here
        student_ids: []
      });
  
      await newTeam.save();
      res.redirect('/instructor_index');
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

// View page for a given team (for students, to be honest)
app.get('/teams/:teamId', isLoggedIn, async (req, res) => {
  try {
    // Fetch the team by its ID and populate the students in the team
    const team = await Team.findById(req.params.teamId).populate('student_ids');
    res.render('student_team_management', { team, currentUserId: req.user._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
  
app.get('/teams/:teamId/edit', isLoggedIn, isInstructor, async (req, res) => {
  try {
    // Fetch the team by its ID and populate the students in the team
    const team = await Team.findById(req.params.teamId).populate('student_ids');
    
    // Fetch all users where user_type is 'student'
    const allStudents = await User.find({ user_type: 'student' });

    // Render the 'edit_team' view, passing both the team and all students
    res.render('edit_team', { team, allStudents });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Add student to a team from the instructor team_edit page
app.post('/teams/:teamId/add-student', isInstructor, async (req, res) => {
  try {
    const { studentId } = req.body;
    const team = await Team.findById(req.params.teamId);

    // Add the student to the team's student_ids array
    if (!team.student_ids.includes(studentId)) {
      team.student_ids.push(studentId);
      await team.save();
    }

    res.status(200).json({ message: 'Student added successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Instructor routes to see student assessments
//Detailed Assessments
app.get('/assessments-detailed', isInstructor, async (req, res) => {
  try {
    // Fetch all students
    const students = await User.find({ user_type: 'student' });

    // Fetch evaluations for each student without populating evaluator
    const studentsWithEvaluations = await Promise.all(students.map(async (student) => {
        const evaluations = await Evaluation.find({ evaluatee: student._id });
        return { student, evaluations };
    }));

    // Render the page with the students and evaluations
    res.render('assessments_detailed', { studentsWithEvaluations });
  } catch(e) {
    res.status(500).json({error : e.message });
  }
})

//Summarized Assessments
app.get('/assessments-summary', async (req, res) => {
  try {
      // Step 1: Aggregate the average ratings and scores for each student
      const summary = await Evaluation.aggregate([
          {
              $group: {
                  _id: '$evaluatee', // Group by evaluatee (student)
                  averageCooperation: { $avg: '$cooperation.rating' },
                  averageConceptual: { $avg: '$conceptual_contribution.rating' },
                  averagePractical: { $avg: '$practical_contribution.rating' },
                  averageWorkEthic: { $avg: '$work_ethic.rating' },
                  overallAverageScore: { $avg: '$average_score' }
              }
          }
      ]);

      // Step 2: Populate student data for the summary
      const populatedSummary = await Promise.all(
          summary.map(async (record) => {
              const student = await User.findById(record._id);
              return {
                  studentName: student.username,
                  averageCooperation: record.averageCooperation.toFixed(1),
                  averageConceptual: record.averageConceptual.toFixed(1),
                  averagePractical: record.averagePractical.toFixed(1),
                  averageWorkEthic: record.averageWorkEthic.toFixed(1),
                  overallAverageScore: record.overallAverageScore.toFixed(1)
              };
          })
      );

      // Step 3: Render the summary page with the aggregated data
      res.render('assessments_summary', { studentsSummary: populatedSummary });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});



//Search route for the edit team page (and more, later)
app.get('/search-students', isInstructor, async (req, res) => {
  const query = req.query.query;

  try {
    const students = await User.find({
      username: { $regex: query, $options: 'i' }, //Look for all students with a matching prefix (regex)
      user_type: 'student'  // Hardcoded to only search for students
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

//Generate teams page
app.get('/generate-teams', isLoggedIn, isInstructor, (req, res) => {
  res.render('generate_teams');
})

// Route to handle team generation
app.post('/generate-teams', upload.single('csvFile'), async (req, res) => {
  try {
    const teamSize = parseInt(req.body.teamSize);
    const filePath = req.file.path; // Use Multer's generated file path

    const students = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv({ headers: ['firstName', 'lastName'] }))
      .on('data', (row) => {
        students.push(row);
      })
      .on('end', async () => {
        // Calculate the number of teams needed
        // Excess students means there'll be teams with more students (not less)
        const numberOfTeams = Math.floor(students.length / teamSize); 

        // Create empty teams
        const teams = [];
        for (let i = 0; i < numberOfTeams; i++) {
          const newTeam = new Team({
            team_name: `Team ${i + 1}`,
            instructor_id: req.user._id, // Assuming instructor is logged in
            student_ids: []
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
              user_type: 'student'
            });
            await newUser.setPassword('password'); // Set default password
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
        res.redirect('/instructor_index');
      });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'An error occurred while generating teams.' });
  }
});
  
  
app.listen(3000, () => {
    console.log("SERVING YOUR APP!")
})