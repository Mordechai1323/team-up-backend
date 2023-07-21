"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = void 0;
const allowedOrigins_1 = require("../config/allowedOrigins");
const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins_1.allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
};
exports.credentials = credentials;
