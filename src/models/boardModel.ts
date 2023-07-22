import mongoose from 'mongoose';
import Joi from 'joi';

interface IBoard {
  user_id: string;
  name: string;
  share_with: {
    user_id: string;
    name: string;
    email: string;
    isOwner?: boolean;
  }[];

  date_created: Date;
  completion_date?: Date;
}

const boardSchema = new mongoose.Schema({
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

export const BoardModel = mongoose.model<IBoard>('boards', boardSchema);

export const validateBoard = (reqBody: { name: string; completion_date?: Date }) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    completion_date: Joi.date().allow(null, ''),
  });

  return joiSchema.validate(reqBody);
};

export const validateUserEmail = (reqBody: {user_email: string}) => {
  const joiSchema = Joi.object({
    user_email: Joi.string().min(2).max(150).email().required(),
  });

  return joiSchema.validate(reqBody);
};
