import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  refresh_tokens: string[];
  role: string;
  one_time_code?: string;
  date_created: Date;
}

interface IValidateUser {
  name: string;
  email: string;
  password: string;
  recaptchaToken: string;
}

interface IValidateLogin {
  email: string;
  password: string;
  recaptchaToken: string;
}

const userSchema: Schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  refresh_tokens: {
    type: [String],
  },
  role: {
    type: String,
    default: 'user',
  },
  one_time_code: { type: String, default: 0 },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.model<IUser>('users', userSchema);

export const validateUser = (reqBody: IValidateUser) => {
  const developmentSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(6).max(150).required(),
  });

  const productionSchema = Joi.object({
    ...developmentSchema,
    recaptchaToken: Joi.string().min(6).max(50000).required(),
  });

  const joiSchema = process.env.NODE_ENV === 'production' ? productionSchema : developmentSchema;

  return joiSchema.validate(reqBody);
};

export const validateLogin = (reqBody: IValidateLogin) => {
  const developmentSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(6).max(150).required(),
  });

  const productionSchema = Joi.object({
    ...developmentSchema,
    recaptchaToken: Joi.string().min(6).max(50000).required(),
  });

  const joiSchema = process.env.NODE_ENV === 'production' ? productionSchema : developmentSchema;

  return joiSchema.validate(reqBody);
};

export const validateUserEdit = (reqBody: { name: string; email: string }) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
  });
  return joiSchema.validate(reqBody);
};

export const validatePassword = (reqBody: { oldPassword: string; password: string }) => {
  let joiSchema = Joi.object({
    oldPassword: Joi.string().min(6).max(150).required(),
    password: Joi.string().min(6).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

export const validateEmail = (reqBody: { email: string }) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    // recaptchaToken: Joi.string().min(6).max(5000).required(),
  });
  return joiSchema.validate(reqBody);
};

export const validateOneTimeCode = (reqBody: { code: number }) => {
  let joiSchema = Joi.object({
    code: Joi.number().min(100000).max(999999).required(),
  });
  return joiSchema.validate(reqBody);
};

export const validatePasswordOneTimeCode = (reqBody: { password: string }) => {
  let joiSchema = Joi.object({
    password: Joi.string().min(6).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

export const generateAccessToken = (userId: String, role: string, email: string) => {
  return jwt.sign({ _id: userId, role, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
};

export const generateRefreshToken = (userId: string, role: string) => {
  return jwt.sign({ _id: userId, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
};

export const generateOneTimeCodeToken = (userId: string) => {
  return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ONE_TIME_CODE_TOKEN_EXPIRATION });
};
