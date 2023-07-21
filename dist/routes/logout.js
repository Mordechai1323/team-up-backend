"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const logoutController_1 = __importDefault(require("../controllers/users/logoutController"));
const auth_1 = require("../middleware/auth");
router.get('/', auth_1.authRefresh, logoutController_1.default.handleLogout);
module.exports = router;
