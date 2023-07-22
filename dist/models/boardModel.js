"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserEmail = exports.validateBoard = exports.BoardModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const boardSchema = new mongoose_1.default.Schema({
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
exports.BoardModel = mongoose_1.default.model('boards', boardSchema);
const validateBoard = (reqBody) => {
    const joiSchema = joi_1.default.object({
        name: joi_1.default.string().min(2).max(150).required(),
        completion_date: joi_1.default.date().allow(null, ''),
    });
    return joiSchema.validate(reqBody);
};
exports.validateBoard = validateBoard;
const validateUserEmail = (reqBody) => {
    const joiSchema = joi_1.default.object({
        user_email: joi_1.default.string().min(2).max(150).email().required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateUserEmail = validateUserEmail;
