const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  instructor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student_ids: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Team', TeamSchema);
