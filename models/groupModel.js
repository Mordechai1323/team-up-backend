const mongoose = require('mongoose');
const Joi = require('joi');

const groupSchema = new mongoose.Schema({
  project_id: String,
  name: String,
  is_open: {
    type: Boolean,
    default: true,
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

exports.GroupModel = mongoose.model('groups', groupSchema);

exports.validateGroup = (reqBody) => {
  const joiSchema = Joi.object({
    project_id: Joi.string().min(2).max(150).required(),
    name: Joi.string().min(2).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

exports.validateGroupId = (reqBody) => {
  const joiSchema = Joi.object({
    project_id: Joi.string().min(2).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

exports.validateEditGroup = (reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};


