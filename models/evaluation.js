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
  }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
