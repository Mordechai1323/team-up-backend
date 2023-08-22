import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel, validateUserEdit, validatePassword } from '../../models/userModel';
import { BoardModel } from '../../models/boardModel';
import { GroupModel } from '../../models/groupModel';
import logger from '../../logger/logger.js';

interface MyRequest extends Request {
  query: {
    s: string;
    page: string;
    perPage: string;
    sort: string;
    reverse: string;
  };
}

const getAllUsers = async (req: MyRequest, res: Response) => {
  let perPage = Number(req.query.perPage) || 10;
  let page = Number(req.query.page) || 1;
  let sort = String(req.query.sort) || '_id';
  let reverse = req.query.reverse == 'true' ? -1 : 1;
  let search = req.query.s;
  let searchExp;
  if (search) {
    searchExp = new RegExp(search, 'i');
  }

  try {
    let users = await UserModel.find({ name: searchExp }, { password: 0, refresh_tokens: 0, one_time_code: 0 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse } as { [key: string]: 1 | -1 });

    res.json(users);
  } catch (err) {
    logger.error(err);
    res.status(502).json(err);
  }
};

const getMyInfo = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0, refresh_tokens: 0, one_time_code: 0 });
    res.json(user);
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
};

const count = async (req: Request, res: Response) => {
  const perPage = Number(req.query.perPage) || 10;
  try {
    const count = await UserModel.countDocuments({});
    const pages = Math.ceil(count / perPage);
    res.json({ count, pages });
  } catch (err) {
    logger.error(err);
    res.status(502).json(err);
  }
};

const editUserDetails = async (req: Request, res: Response) => {
  const validBody = validateUserEdit(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const user = await UserModel.updateOne({ _id: req.tokenData._id }, req.body);
    res.json(user);
  } catch (err) {
    logger.error(err);
    res.status(502).json(err);
  }
};

const editPassword = async (req: Request, res: Response) => {
  const validBody = validatePassword(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(400);
    const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!validPassword) return res.sendStatus(401);
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const updateUser = await UserModel.updateOne({ _id: req.tokenData._id }, req.body);
    res.json(updateUser);
  } catch (err) {
    logger.error(err);
    res.status(502).json(err);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleteUser = await UserModel.deleteOne({ _id: req.tokenData._id });
    const boards = await BoardModel.find({ user_id: req.tokenData._id });
    boards.forEach(async (board) => {
      await GroupModel.deleteMany({ board_id: board._id });
      await BoardModel.deleteOne({ _id: board._id });
    });
    res.json(deleteUser);
  } catch (err) {
    logger.error(err);
    res.status(502).json(err);
  }
};

//TODO change id of admin
const changeRole = async (req: Request, res: Response) => {
  try {
    let user_id = req.query.user_id;
    let role = req.query.role;

    if (!user_id || !role) {
      return res.status(400).json({ err: 'user_id and role are required parameters' });
    }
    if (user_id === req.tokenData._id || user_id == '6483a9bc8c88e56dcfbf0148') {
      return res.status(401).json({ err: 'You try to change yourself or the super admin' });
    }
    let data = await UserModel.updateOne({ _id: user_id }, { role });
    res.json(data);
  } catch (err) {
    logger.error(err);
    res.status(502).json(err);
  }
};

export default {
  getAllUsers,
  getMyInfo,
  count,
  editUserDetails,
  editPassword,
  changeRole,
  deleteUser,
};
