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
const auth_1 = require("../../middleware/auth");
const handleNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validBody = (0, userModel_1.validateUser)(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        const human = yield (0, auth_1.validateHuman)(req.body.recaptchaToken);
        if (!human)
            return res.sendStatus(400);
        const user = new userModel_1.UserModel(req.body);
        user.password = yield bcrypt_1.default.hash(user.password, 10);
        const accessToken = (0, userModel_1.generateAccessToken)(user._id, user.role, user.email);
        const refreshToken = (0, userModel_1.generateRefreshToken)(user._id, user.role);
        user.refresh_tokens = [refreshToken];
        yield user.save();
        user.password = '*****';
        res.cookie('token', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true, sameSite: 'none' });
        res.status(201).json({ accessToken, user });
    }
    catch (err) {
        if (err.code == 11000) {
            return res.status(401).json({ err: 'Email already in system, try log in', code: 11000 });
        }
        console.log(err);
        res.status(502).json(err);
    }
});
exports.default = { handleNewUser };
