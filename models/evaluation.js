const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EvaluationSchema = new Schema({
  evaluator: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user giving the evaluation
    required: true
  },
  evaluatee: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user being evaluated
    required: true
  },
  cooperation: {
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: {type: String, required: false}
  },
  conceptual_contribution: {
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: {type: String, required: false}
  },
  practical_contribution: {
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: {type: String, required: false}
  },
  work_ethic: {
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: {type: String, required: false}
  },
  average_score: {
    type: Number, required: true, default: 0
  }
});

// Pre-save hook to calculate average_score
EvaluationSchema.pre('save', function (next) {
  // Calculate the average of the four ratings
  const total = this.cooperation.rating + this.conceptual_contribution.rating +
                this.practical_contribution.rating + this.work_ethic.rating;
  const average = total / 4;
  this.average_score = Math.round(average * 10) / 10;
  next();
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
