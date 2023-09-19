import mongoose from 'mongoose';
import Joi from 'joi';

interface IGroup {
  board_id: string;
  name: string;
  is_open: boolean;
  date_created: Date;
  tasks: {
    name: string;
    id?: string;
    in_care?: string[];
    status: {
      name: string;
      style: string;
    };
  }[];
}

const groupSchema = new mongoose.Schema({
  board_id: String,
  name: String,
  is_open: {
    type: Boolean,
    default: true,
  },
  tasks: {
    type: [
      {
        name: String,
        in_care: [String],
        status: {
          name: { type: String, default: '' },
          style: { type: String, default: 'rgb(121, 126, 147)' },
        },
        date_created: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

export const GroupModel = mongoose.model<IGroup>('groups', groupSchema);
export const validateEditGroup = (reqBody: { name: string }) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateTask = (reqBody: { name: string }) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateEditStatus = (reqBody: { name: string; style: string }) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(0).max(150).required(),
    style: Joi.string().min(0).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};
