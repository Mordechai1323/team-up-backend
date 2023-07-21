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
exports.validateHuman = exports.authRefresh = exports.authAdmin = exports.authTeamLeader = exports.auth = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ err: 'authentication missing' });
    // const token = authHeader;
    const token = authHeader.split(' ')[1];
    try {
        let decodeToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.tokenData = decodeToken;
        next();
    }
    catch (err) {
        return res.status(403).json({ err: 'fail validating token' });
    }
};
exports.auth = auth;
const authTeamLeader = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ err: 'authentication missing' });
    // const token = authHeader
    const token = authHeader.split(' ')[1];
    try {
        let decodeToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (decodeToken.role !== 'team_leader') {
            return res.status(401).json({ err: 'authentication missing!!!!!!!!!' });
        }
        req.tokenData = decodeToken;
        next();
    }
    catch (err) {
        return res.status(403).json({ err: 'fail validating token' });
    }
};
exports.authTeamLeader = authTeamLeader;
const authAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ err: 'authentication missing' });
    // const token = authHeader
    const token = authHeader.split(' ')[1];
    try {
        let decodeToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (decodeToken.role !== 'admin') {
            return res.status(401).json({ err: 'authentication missing!!!!!!!!!' });
        }
        req.tokenData = decodeToken;
        next();
    }
    catch (err) {
        return res.status(403).json({ err: 'fail validating token' });
    }
};
exports.authAdmin = authAdmin;
const authRefresh = (req, res, next) => {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.token))
        return res.status(401).json({ err: 'no cookies' });
    const refreshToken = cookies.token;
    try {
        let decodeToken = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        req.tokenData = decodeToken;
        req.refreshToken = refreshToken;
        next();
    }
    catch (err) {
        return res.status(403).json({ err: 'fail validating token' });
    }
};
exports.authRefresh = authRefresh;
const getTokenFromRequest = (req) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return null;
    return authHeader.split(' ')[1];
};
const validateHuman = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
    return response.data.success;
});
exports.validateHuman = validateHuman;
