const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  user_type: {
    type: String,
    enum: ["student", "instructor"], // Only allows users to be "students" or "instructors"
    required: true,
  },
  classes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Class", // References to the classes the user belongs to
    },
  ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
