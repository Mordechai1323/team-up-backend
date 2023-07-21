"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOneTimeCodeToken = exports.generateRefreshToken = exports.generateAccessToken = exports.validatePasswordOneTimeCode = exports.validateOneTimeCode = exports.validateEmail = exports.validatePassword = exports.validateUserEdit = exports.validateLogin = exports.validateUser = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userSchema = new mongoose_1.default.Schema({
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
exports.UserModel = mongoose_1.default.model('users', userSchema);
const validateUser = (reqBody) => {
    const joiSchema = joi_1.default.object({
        name: joi_1.default.string().min(2).max(150).required(),
        email: joi_1.default.string().min(2).max(150).email().required(),
        password: joi_1.default.string().min(6).max(150).required(),
        recaptchaToken: joi_1.default.string().min(6).max(50000).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateUser = validateUser;
const validateLogin = (reqBody) => {
    const joiSchema = joi_1.default.object({
        email: joi_1.default.string().min(2).max(150).email().required(),
        password: joi_1.default.string().min(6).max(150).required(),
        recaptchaToken: joi_1.default.string().min(6).max(50000).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateLogin = validateLogin;
const validateUserEdit = (reqBody) => {
    let joiSchema = joi_1.default.object({
        name: joi_1.default.string().min(2).max(150).required(),
        email: joi_1.default.string().min(2).max(150).email().required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateUserEdit = validateUserEdit;
const validatePassword = (reqBody) => {
    let joiSchema = joi_1.default.object({
        oldPassword: joi_1.default.string().min(6).max(150).required(),
        password: joi_1.default.string().min(6).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validatePassword = validatePassword;
const validateEmail = (reqBody) => {
    let joiSchema = joi_1.default.object({
        email: joi_1.default.string().min(2).max(150).email().required(),
        // recaptchaToken: Joi.string().min(6).max(5000).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateEmail = validateEmail;
const validateOneTimeCode = (reqBody) => {
    let joiSchema = joi_1.default.object({
        code: joi_1.default.number().min(100000).max(999999).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateOneTimeCode = validateOneTimeCode;
const validatePasswordOneTimeCode = (reqBody) => {
    let joiSchema = joi_1.default.object({
        password: joi_1.default.string().min(6).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validatePasswordOneTimeCode = validatePasswordOneTimeCode;
const generateAccessToken = (userId, role, email) => {
    return jsonwebtoken_1.default.sign({ _id: userId, role, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ _id: userId, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
};
exports.generateRefreshToken = generateRefreshToken;
const generateOneTimeCodeToken = (userId) => {
    return jsonwebtoken_1.default.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ONE_TIME_CODE_TOKEN_EXPIRATION });
};
exports.generateOneTimeCodeToken = generateOneTimeCodeToken;
