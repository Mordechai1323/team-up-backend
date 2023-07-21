"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTeamMember = exports.validateTeam = exports.TeamModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const teamSchema = new mongoose_1.default.Schema({
    team_leader_id: String,
    team_members: {
        type: [String],
    },
    name: String,
});
exports.TeamModel = mongoose_1.default.model('teams', teamSchema);
const validateTeam = (reqBody) => {
    const joiSchema = joi_1.default.object({
        team_members: joi_1.default.array().items(joi_1.default.string().min(1).max(150).required()),
        name: joi_1.default.string().min(1).max(150).required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateTeam = validateTeam;
const validateTeamMember = (reqBody) => {
    const joiSchema = joi_1.default.object({
        team_member: joi_1.default.string().min(1).max(150).email().required(),
    });
    return joiSchema.validate(reqBody);
};
exports.validateTeamMember = validateTeamMember;
