const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  class_name: {
    type: String,
    required: true,
  },
  instructor_id: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the instructor teaching the class
    required: true,
  },
  student_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "User", // References to students in the class
    },
  ],
});

module.exports = mongoose.model("Class", ClassSchema);
