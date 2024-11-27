const mongoose = require("mongoose");
const app = require("./app");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/soen341project", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Mongoose's proposed db connection check
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); //Listens for "Error" event & triggers if found
db.once("open", () => {
  // Listens for "Open" event, i.e. an established connection with MongoDB & triggers if found
  console.log("Database connected");
});

// Start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`SERVING YOUR APP ON PORT ${PORT}!`);
  });
}

module.exports = {
  app, // Export the Express app
  mongooseConnection: db, // Export the Mongoose connection
};
