import mongoose from 'mongoose';
import Joi from 'joi';

interface IGroup {
  project_id: string;
  name: string;
  is_open: boolean;
  date_created: Date;
}

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

export const GroupModel = mongoose.model<IGroup>('groups', groupSchema);

export const validateGroup = (reqBody: any) => {
  const joiSchema = Joi.object({
    project_id: Joi.string().min(2).max(150).required(),
    name: Joi.string().min(2).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateGroupId = (reqBody: any) => {
  const joiSchema = Joi.object({
    project_id: Joi.string().min(2).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateEditGroup = (reqBody: any) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};
