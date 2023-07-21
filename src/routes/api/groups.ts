import express from 'express';
const router = express.Router();
import groupsController from'../../controllers/boards/groupsController'
import { auth } from'../../middleware/auth'

router
  .route('/')
  .get(auth, groupsController.getGroups)
  .post(auth, groupsController.addGroup)
  .put(auth, groupsController.editGroup)
  .delete(auth, groupsController.deleteGroup);

router.route('/searchGroups').get(auth, groupsController.searchGroups);
router.route('/changeIsOpen').post(auth, groupsController.changeIsOpen);

export = router;
