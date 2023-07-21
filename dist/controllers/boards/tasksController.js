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
const boardModel_1 = require("../../models/boardModel");
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupID = req.query.groupID;
    try {
        const tasks = yield taskModel_1.TaskModel.findOne({ group_id: groupID });
        if (!tasks) {
            return res.sendStatus(400);
        }
        return res.json(tasks);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const addTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, taskModel_1.validateTask)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    const groupID = req.query.groupID;
    try {
        const tasks = yield taskModel_1.TaskModel.findOne({ group_id: groupID });
        if (!tasks)
            return res.sendStatus(400);
        tasks.tasks.push({
            name: req.body.name,
            status: { name: '', style: 'rgb(121, 126, 147)' },
        });
        yield tasks.save();
        return res.json(tasks);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const addInCare = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, boardModel_1.validateUserEmail)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    const groupID = req.query.groupID;
    const taskID = req.query.taskID;
    try {
        const tasks = yield taskModel_1.TaskModel.findOne({ group_id: groupID });
        if (!tasks)
            return res.sendStatus(400);
        tasks === null || tasks === void 0 ? void 0 : tasks.tasks.forEach((task) => {
            var _a, _b;
            if (task.id === taskID) {
                if (!((_a = task.in_care) === null || _a === void 0 ? void 0 : _a.includes(req.body.user_email)))
                    (_b = task.in_care) === null || _b === void 0 ? void 0 : _b.push(req.body.user_email);
            }
        });
        yield tasks.save();
        return res.status(201).json(tasks);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const deleteInCare = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, boardModel_1.validateUserEmail)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    const groupID = req.query.groupID;
    const taskID = req.query.taskID;
    try {
        const tasks = yield taskModel_1.TaskModel.findOne({ group_id: groupID });
        if (!tasks)
            return res.sendStatus(400);
        tasks.tasks.forEach((task) => {
            var _a, _b;
            if (task.id === taskID) {
                const index = (_a = task.in_care) === null || _a === void 0 ? void 0 : _a.indexOf(req.body.user_email);
                if (index && index !== -1)
                    (_b = task.in_care) === null || _b === void 0 ? void 0 : _b.splice(index, 1);
            }
        });
        yield tasks.save();
        return res.status(201).json(tasks);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, taskModel_1.validateEditStatus)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    const groupID = req.query.groupID;
    const taskID = req.query.taskID;
    try {
        const tasks = yield taskModel_1.TaskModel.findOne({ group_id: groupID });
        if (!tasks)
            return res.sendStatus(400);
        tasks.tasks.forEach((task) => {
            if (task.id === taskID) {
                task.status.name = req.body.name;
                task.status.style = req.body.style;
            }
        });
        yield tasks.save();
        return res.status(201).json(tasks);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const editTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, groupModel_1.validateEditGroup)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const groupID = req.query.groupID;
        const taskID = req.query.taskID;
        const tasks = yield taskModel_1.TaskModel.findOne({ group_id: groupID });
        if (!tasks)
            return res.sendStatus(400);
        tasks.tasks.forEach((task) => {
            if (task.id === taskID)
                task.name = req.body.name;
        });
        yield tasks.save();
        return res.json(tasks);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupID = req.query.groupID;
        const taskID = req.query.taskID;
        const tasks = yield taskModel_1.TaskModel.findOne({ group_id: groupID });
        if (!tasks)
            return res.status(400).json({ err: 'tasks not found' });
        tasks.tasks = tasks.tasks.filter((task) => task.id !== taskID);
        yield tasks.save();
        return res.json(tasks);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});
exports.default = {
    getTasks,
    addTask,
    addInCare,
    deleteInCare,
    changeStatus,
    editTask,
    deleteTask,
};
