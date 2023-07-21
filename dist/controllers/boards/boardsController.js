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
const boardModel_1 = require("../../models/boardModel");
const groupModel_1 = require("../../models/groupModel");
const taskModel_1 = require("../../models/taskModel");
const teamModel_1 = require("../../models/teamModel");
const userModel_1 = require("../../models/userModel");
const getAllTeamBoards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield teamModel_1.TeamModel.findOne({ team_leader_id: req.tokenData._id });
        if (!team)
            return res.sendStatus(400);
        const allTeamProjects = yield Promise.all(team.team_members.map((teamMemberId) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield userModel_1.UserModel.findOne({ _id: teamMemberId });
            if (user) {
                const projects = yield boardModel_1.BoardModel.find({ user_id: user._id });
                return { name: user.name, projects };
            }
        })));
        res.json(allTeamProjects);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const getMyBoards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let search = req.query.s;
    let searchExp = new RegExp(search, 'i');
    try {
        const boards = yield boardModel_1.BoardModel.find({
            $and: [{ name: searchExp }, { share_with: { $elemMatch: { user_id: req.tokenData._id } } }],
        });
        // const allboards = await Promise.all(
        //   boards.map(async (project) => {
        //     if (project.user_id === req.tokenData._id || project.share_with.includes(req.tokenData._id)) return project;
        //   })
        // );
        res.json(boards);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const addBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, boardModel_1.validateProject)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const project = new boardModel_1.BoardModel(req.body);
        const user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id });
        if (!user)
            return res.sendStatus(400);
        project.share_with.push({ user_id: user._id, name: user.name, email: user.email, isOwner: true });
        project.user_id = req.tokenData._id;
        const group = new groupModel_1.GroupModel({ project_id: project._id, name: 'Group Title' });
        const defaultTasks = [
            { name: 'Item 1', status: { name: '', style: 'rgb(121, 126, 147)' } },
            { name: 'Item 2', status: { name: 'Working on it', style: 'rgb(253, 188, 100)' } },
            { name: 'Item 3', status: { name: 'Done', style: 'rgb(51, 211, 145)' } },
        ];
        const tasks = new taskModel_1.TaskModel({ group_id: group._id, tasks: defaultTasks });
        yield project.save();
        yield group.save();
        yield tasks.save();
        res.status(201).json(project);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const shareBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, boardModel_1.validateUserEmail)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const boardID = req.params.boardID;
        const user = yield userModel_1.UserModel.findOne({ email: req.body.user_email });
        if (!user)
            return res.sendStatus(400);
        const project = yield boardModel_1.BoardModel.findOne({ _id: boardID });
        if (!project)
            return res.sendStatus(400);
        const isUserFound = project.share_with.some((obj) => obj.user_id === user.id);
        if (!isUserFound) {
            project.share_with.push({ user_id: user._id, name: user.name, email: user.email });
            yield project.save();
        }
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const unshareBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, boardModel_1.validateUserEmail)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const boardID = req.params.boardID;
        const project = yield boardModel_1.BoardModel.findOne({ _id: boardID });
        if (!project)
            return res.sendStatus(400);
        project.share_with = project.share_with.filter((user) => user.email !== req.body.user_email || user.isOwner);
        yield project.save();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
        6;
    }
});
// const unshareBoard = async (req :Request, res: Response) => {
//   const validBody = validateUserEmail(req.body);
//   if (validBody.error) {
//     return res.status(400).json(validBody.error.details);
//   }
//   try {
//     const boardID = req.params.boardID;
//     const project = await BoardModel.findOne({ _id: boardID });
//     const user = await UserModel.findOne({ email: req.body.user_email });
//     const userIndex = project.share_with.indexOf(user._id);
//     if (userIndex === -1) return res.sendStatus(400);
//     project.share_with.splice(userIndex, 1);
//     await project.save();
//     return res.sendStatus(200);
//   } catch (err) {
//     console.log(err);
//     res.status(502).json({ err });
//   }
// };
const editBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, boardModel_1.validateProject)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const boardID = req.params.boardID;
        const update = yield boardModel_1.BoardModel.updateOne({ _id: boardID }, req.body);
        res.json(update);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const deleteBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boardID = req.params.boardID;
        let project = yield boardModel_1.BoardModel.findOne({ _id: boardID });
        if (!project)
            return res.sendStatus(401);
        if (project.user_id !== req.tokenData._id) {
            project.share_with = project.share_with.filter((user) => user.user_id !== req.tokenData._id);
            yield project.save();
            return res.sendStatus(401);
        }
        const groups = yield groupModel_1.GroupModel.find({ project_id: project._id });
        if (groups) {
            groups.forEach((group) => __awaiter(void 0, void 0, void 0, function* () {
                yield taskModel_1.TaskModel.deleteOne({ group_id: group._id });
                yield groupModel_1.GroupModel.deleteOne({ project_id: group.project_id });
            }));
        }
        const deleted = yield boardModel_1.BoardModel.deleteOne({ _id: boardID });
        res.status(200).json(deleted);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
exports.default = {
    getAllTeamBoards,
    getMyBoards,
    addBoard,
    shareBoard,
    unshareBoard,
    editBoard,
    deleteBoard,
};
