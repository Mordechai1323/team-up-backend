const express = require('express');
const router = express.Router();
const groupsController = require('../../controllers/boards/groupsController');
const { auth } = require('../../middlewares/auth');

router
  .route('/')
  .get(auth, groupsController.getGroups)
  .post(auth, groupsController.addGroup)
  .put(auth, groupsController.editGroup)
  .delete(auth, groupsController.deleteGroup);

router.route('/searchGroups').get(auth, groupsController.searchGroups);
router.route('/changeIsOpen').post(auth, groupsController.changeIsOpen);

module.exports = router;
