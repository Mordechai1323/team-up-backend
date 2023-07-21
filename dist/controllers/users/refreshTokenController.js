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
const handleRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.UserModel.findOne({ _id: req.tokenData._id });
        if (!user)
            return res.status(401).json({ err: 'fail validating token' });
        if (!user.refresh_tokens.includes(req.refreshToken)) {
            user.refresh_tokens = [];
            yield user.save();
            return res.status(403).json({ err: 'fail validating token' });
        }
        const accessToken = (0, userModel_1.generateAccessToken)(user._id, user.role, user.email);
        res.json({ accessToken, name: user.name, role: user.role });
    }
    catch (err) {
        return res.status(403).json({ err: 'fail validating token' });
    }
});
exports.default = { handleRefreshToken };
