const mongoose = require('mongoose');
const Joi = require('joi');

const projectSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  share_with: {
    type: [{ user_id: String, name: String, email: String, isOwner: Boolean }],
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
  completion_date: Date,
});

exports.ProjectModel = mongoose.model('projects', projectSchema);

exports.validateProject = (reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    completion_date: Joi.date().allow(null, ''),
  });

  return joiSchema.validate(reqBody);
};

exports.validateUserEmail = (reqBody) => {
  const joiSchema = Joi.object({
    user_email: Joi.string().min(2).max(150).email().required(),
  });

  return joiSchema.validate(reqBody);
};
