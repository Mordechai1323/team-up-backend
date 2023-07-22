"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEditGroup = exports.validateGroupId = exports.validateGroup = exports.GroupModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const groupSchema = new mongoose_1.default.Schema({
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
exports.GroupModel = mongoose_1.default.model('groups', groupSchema);
const validateGroup = (reqBody) => {
    const joiSchema = joi_1.default.object({
        board_id: joi_1.default.string().min(2).max(150).required(),
        name: joi_1.default.string().min(2).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateGroup = validateGroup;
const validateGroupId = (reqBody) => {
    const joiSchema = joi_1.default.object({
        board_id: joi_1.default.string().min(2).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateGroupId = validateGroupId;
const validateEditGroup = (reqBody) => {
    const joiSchema = joi_1.default.object({
        name: joi_1.default.string().min(1).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateEditGroup = validateEditGroup;
