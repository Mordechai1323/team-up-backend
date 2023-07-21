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
const userModel_1 = require("../../models/userModel");
const handleLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id });
        if (!user) {
            res.clearCookie('token', { httpOnly: true });
            return res.status(401);
        }
        if (!user.refresh_tokens.includes(req.refreshToken)) {
            res.clearCookie('token', { httpOnly: true });
            user.refresh_tokens = [];
            yield user.save();
            return res.status(401).json({ err: 'no token' });
        }
        user.refresh_tokens.splice(user.refresh_tokens.indexOf(req.refreshToken), 1);
        yield user.save();
        res.clearCookie('token', { httpOnly: true });
        res.sendStatus(200);
    }
    catch (err) {
        res.status(502).json(err);
    }
});
exports.default = { handleLogout };
