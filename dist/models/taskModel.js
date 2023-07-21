"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEditStatus = exports.validateTask = exports.TaskModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const taskSchema = new mongoose_1.default.Schema({
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
exports.TaskModel = mongoose_1.default.model('tasks', taskSchema);
const validateTask = (reqBody) => {
    const joiSchema = joi_1.default.object({
        name: joi_1.default.string().min(1).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateTask = validateTask;
const validateEditStatus = (reqBody) => {
    const joiSchema = joi_1.default.object({
        name: joi_1.default.string().min(0).max(150).required(),
        style: joi_1.default.string().min(0).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateEditStatus = validateEditStatus;
