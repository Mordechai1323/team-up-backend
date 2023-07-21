"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const teamModel_1 = require("../../models/teamModel");
const userModel_1 = require("../../models/userModel");
const getTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const team = yield teamModel_1.TeamModel.findOne({ team_leader_id: req.tokenData._id });
    if (!team)
        return res.sendStatus(400);
    const teamMembers = yield Promise.all(team.team_members.map((teamMemberId) => __awaiter(void 0, void 0, void 0, function* () { return yield userModel_1.UserModel.findOne({ _id: teamMemberId }, { password: 0, refresh_tokens: 0, one_time_code: 0 }); })));
    res.json(teamMembers);
});
const createTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, teamModel_1.validateTeam)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const team = new teamModel_1.TeamModel({ name: req.body.name });
        let usersNotFound = [];
        let teamMembers = [];
        for (const teamMemberEmail of req.body.team_members) {
            const teamMember = yield userModel_1.UserModel.findOne({ email: teamMemberEmail });
            if (!teamMember)
                usersNotFound.push(teamMemberEmail);
            else
                teamMembers.push(teamMember._id);
        }
        team.team_members = teamMembers;
        team.team_leader_id = req.tokenData._id;
        yield team.save();
        const user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id });
        if (!user)
            return res.sendStatus(400);
        user.role = 'team_leader';
        yield user.save();
        const accessToken = (0, userModel_1.generateAccessToken)(user._id, user.role, user.email);
        if (usersNotFound.length > 0) {
            const err = { err: `Some or all of the team members were not found, The users not found ${usersNotFound} ` };
            return res.status(400).json({ team, accessToken, err });
        }
        return res.json({ team, accessToken });
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const addTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, teamModel_1.validateTeamMember)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const team = yield teamModel_1.TeamModel.findOne({ team_leader_id: req.tokenData._id });
        if (!team)
            return res.sendStatus(400);
        const user = yield userModel_1.UserModel.findOne({ email: req.body.team_member });
        if (!user)
            return res.status(400).json(`${req.body.team_member} not found`);
        if (team.team_members.includes(user._id))
            return res.sendStatus(400);
        team.team_members.push(user._id);
        yield team.save();
        return res.json(team);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const removeTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, teamModel_1.validateTeamMember)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const team = yield teamModel_1.TeamModel.findOne({ team_leader_id: req.tokenData._id });
        if (!team)
            return res.sendStatus(400);
        const user = yield userModel_1.UserModel.findOne({ email: req.body.team_member });
        if (!user)
            return res.sendStatus(400);
        const teamMemberIndex = team.team_members.indexOf(user._id);
        if (teamMemberIndex === -1)
            return res.sendStatus(400);
        team.team_members.splice(teamMemberIndex, 1);
        yield team.save();
        return res.json(team);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield teamModel_1.TeamModel.deleteOne({ team_leader_id: req.tokenData._id });
        if (!team)
            return res.sendStatus(400);
        const user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id });
        if (!user)
            return res.sendStatus(400);
        user.role = 'user';
        yield user.save();
        const accessToken = (0, userModel_1.generateAccessToken)(user._id, user.role, user.email);
        return res.json({ team, accessToken });
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
exports.default = {
    getTeam,
    createTeam,
    addTeamMember,
    removeTeamMember,
    deleteTeam,
};
