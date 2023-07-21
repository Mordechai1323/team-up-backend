const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  // phone: String,
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

exports.UserModel = mongoose.model('user', userSchema);

exports.validateUser = (reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(6).max(150).required(),
    recaptchaToken: Joi.string().min(6).max(50000).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validateLogin = (reqBody) => {
  const joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(6).max(150).required(),
    recaptchaToken: Joi.string().min(6).max(50000).required(),
  });

  return joiSchema.validate(reqBody);
};

exports.validateUserEdit = (reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validatePassword = (reqBody) => {
  let joiSchema = Joi.object({
    oldPassword: Joi.string().min(6).max(150).required(),
    password: Joi.string().min(6).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validateEmail = (reqBody) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    // recaptchaToken: Joi.string().min(6).max(5000).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validateOneTimeCode = (reqBody) => {
  let joiSchema = Joi.object({
    code: Joi.number().min(100000).max(999999).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validatePasswordOneTimeCode = (reqBody) => {
  let joiSchema = Joi.object({
    password: Joi.string().min(6).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.generateAccessToken = (userId, role, email) => {
  return jwt.sign({ _id: userId, role, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
};

exports.generateRefreshToken = (userId, role) => {
  return jwt.sign({ _id: userId, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
};

exports.generateOneTimeCodeToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ONE_TIME_CODE_TOKEN_EXPIRATION });
};
