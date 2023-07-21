"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const refreshTokenController_1 = __importDefault(require("../controllers/users/refreshTokenController"));
const auth_1 = require("../middleware/auth");
router.get('/', auth_1.authRefresh, refreshTokenController_1.default.handleRefreshToken);
module.exports = router;
