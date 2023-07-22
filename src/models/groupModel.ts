import mongoose from 'mongoose';
import Joi from 'joi';

interface IGroup {
  board_id: string;
  name: string;
  is_open: boolean;
  date_created: Date;
}

const groupSchema = new mongoose.Schema({
  board_id: String,
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

export const GroupModel = mongoose.model<IGroup>('groups', groupSchema);

export const validateGroup = (reqBody: { board_id: string; name: string }) => {
  const joiSchema = Joi.object({
    board_id: Joi.string().min(2).max(150).required(),
    name: Joi.string().min(2).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateGroupId = (reqBody: { board_id: string }) => {
  const joiSchema = Joi.object({
    board_id: Joi.string().min(2).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateEditGroup = (reqBody: { name: string }) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};
