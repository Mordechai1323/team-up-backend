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
const groupModel_1 = require("../../models/groupModel");
const taskModel_1 = require("../../models/taskModel");
const getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boardID = req.query.boardID;
    try {
        const groups = yield groupModel_1.GroupModel.find({ board_id: boardID });
        return res.json(groups);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const searchGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boardID = req.query.boardID;
    const search = String(req.query.s);
    const searchExp = new RegExp(search, 'i');
    try {
        let groups = yield groupModel_1.GroupModel.find({ $and: [{ board_id: boardID }, { name: searchExp }] });
        return res.json(groups);
    }
    catch (err) {
        console.error(err);
        res.status(502).json({ err });
    }
});
const addGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boardID = req.query.boardID;
    try {
        const group = new groupModel_1.GroupModel({ name: 'New Group', board_id: boardID });
        const tasks = new taskModel_1.TaskModel({ group_id: group._id });
        yield group.save();
        yield tasks.save();
        return res.json(group);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const changeIsOpen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupID = req.query.groupID;
    try {
        const group = yield groupModel_1.GroupModel.findOne({ _id: groupID });
        if (!group)
            return res.sendStatus(400);
        group.is_open = !group.is_open;
        yield group.save();
        return res.json(group);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const editGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, groupModel_1.validateEditGroup)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    const groupID = req.query.groupID;
    try {
        const groups = yield groupModel_1.GroupModel.updateOne({ _id: groupID }, req.body);
        return res.json(groups);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupID = req.query.groupID;
    try {
        const groups = yield groupModel_1.GroupModel.deleteOne({ _id: groupID });
        const tasks = yield taskModel_1.TaskModel.deleteOne({ group_id: groupID });
        return res.json(groups);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
exports.default = {
    getGroups,
    searchGroups,
    addGroup,
    changeIsOpen,
    editGroup,
    deleteGroup,
};
