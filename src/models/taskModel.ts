import mongoose from 'mongoose';
import Joi from 'joi';

interface ITask {
  group_id: string;
  tasks: {
    name: string;
    id?: string
    in_care?: string[];
    status: {
      name: string;
      style: string;
    };
  }[];
}

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

export const TaskModel = mongoose.model<ITask>('tasks', taskSchema);

export const validateTask = (reqBody: any) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateEditStatus = (reqBody: any) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(0).max(150).required(),
    style: Joi.string().min(0).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};
