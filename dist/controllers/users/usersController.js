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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../../models/userModel");
// interface MyRequest extends Request {
//   query: {
//     s: string;
//   };
// }
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let perPage = Number(req.query.perPage) || 10;
    let page = Number(req.query.page) || 1;
    let sort = String(req.query.sort) || '_id';
    let reverse = req.query.reverse == 'true' ? -1 : 1;
    let search = String(req.query.s);
    let searchExp = new RegExp(search, 'i');
    try {
        let users = yield userModel_1.UserModel.find({ name: searchExp }, { password: 0, refresh_tokens: 0, one_time_code: 0 })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort(sort);
        res.json(users);
    }
    catch (err) {
        console.log(err);
        res.status(502).json(err);
    }
});
const getMyInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id }, { password: 0, refresh_tokens: 0, one_time_code: 0 });
        res.json(user);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
const count = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const perPage = Number(req.query.perPage) || 10;
    try {
        const count = yield userModel_1.UserModel.countDocuments({});
        const pages = Math.ceil(count / perPage);
        res.json({ count, pages });
    }
    catch (err) {
        console.log(err);
        res.status(502).json(err);
    }
});
const editUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, userModel_1.validateUserEdit)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const user = yield userModel_1.UserModel.updateOne({ _id: req.tokenData._id }, req.body);
        res.json(user);
    }
    catch (err) {
        console.log(err);
        res.status(502).json(err);
    }
});
const editPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, userModel_1.validatePassword)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id });
        if (!user)
            return res.sendStatus(400);
        const validPassword = yield bcrypt_1.default.compare(req.body.oldPassword, user.password);
        if (!validPassword)
            return res.sendStatus(401);
        req.body.password = yield bcrypt_1.default.hash(req.body.password, 10);
        const updateUser = yield userModel_1.UserModel.updateOne({ _id: req.tokenData._id }, req.body);
        res.json(updateUser);
    }
    catch (err) {
        console.log(err);
        res.status(502).json(err);
    }
});
//TODO delete board user and groups and tasks
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id });
        const deleteUser = yield userModel_1.UserModel.deleteOne({ _id: req.tokenData._id });
        res.json(deleteUser);
    }
    catch (err) {
        console.log(err);
        res.status(502).json(err);
    }
});
//TODO change id of admin
const changeRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user_id = req.query.user_id;
        let role = req.query.role;
        if (!user_id || !role) {
            return res.status(400).json({ err: 'user_id and role are required parameters' });
        }
        if (user_id == req.tokenData._id || user_id == '6483a9bc8c88e56dcfbf0148') {
            return res.status(401).json({ err: 'You try to change yourself or the super admin' });
        }
        let data = yield userModel_1.UserModel.updateOne({ _id: user_id }, { role });
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json(err);
    }
});
exports.default = {
    getAllUsers,
    getMyInfo,
    count,
    editUserDetails,
    editPassword,
    changeRole,
    deleteUser,
};
