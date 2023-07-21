"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const loginController_1 = __importDefault(require("../controllers/users/loginController"));
router.post('/', loginController_1.default.handleLogin);
module.exports = router;
