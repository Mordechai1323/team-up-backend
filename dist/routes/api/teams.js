"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const teamsController_1 = __importDefault(require("../../controllers/teams/teamsController"));
const auth_1 = require("../../middleware/auth");
router.route('/').get(auth_1.auth, teamsController_1.default.getTeam).post(auth_1.auth, teamsController_1.default.createTeam).delete(auth_1.auth, teamsController_1.default.deleteTeam);
router.route('/addTeamMember').post(auth_1.auth, teamsController_1.default.addTeamMember);
router.route('/removeTeamMember').post(auth_1.auth, teamsController_1.default.removeTeamMember);
module.exports = router;
