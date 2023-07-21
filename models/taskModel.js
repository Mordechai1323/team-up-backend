const mongoose = require('mongoose');
const Joi = require('joi');

const taskSchema = new mongoose.Schema({
  group_id: String,

  tasks: {
    type: [
      {
        name: String,
        in_care: [String],
        status: {
          name: { type: String, default: '' },
          style: { type: String, default: 'rgb(121, 126, 147)' },
        },
      },
    ],
  },
});

exports.TaskModel = mongoose.model('tasks', taskSchema);

exports.validateTask = (reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

exports.validateEditStatus = (reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(0).max(150).required(),
    style: Joi.string().min(0).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};
