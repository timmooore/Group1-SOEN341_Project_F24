const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  team_name: {
    type: String,
    required: true,
  },
  instructor_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  student_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  class_id: {
    type: Schema.Types.ObjectId,
    ref: "Class", // Reference to the class this team belongs to
    required: true,
  },
});

module.exports = mongoose.model("Team", TeamSchema);
