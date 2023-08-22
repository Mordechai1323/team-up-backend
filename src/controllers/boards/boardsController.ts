import { Request, Response } from 'express';
import { BoardModel, validateBoard, validateUserEmail } from '../../models/boardModel';
import { GroupModel } from '../../models/groupModel';
import { TeamModel } from '../../models/teamModel';
import { UserModel } from '../../models/userModel';
import logger from '../../logger/logger.js';

interface MyRequest extends Request {
  query: {
    s: string;
  };
}

const getAllTeamBoards = async (req: MyRequest, res: Response) => {
  let search = req.query.s;
  let searchExp = new RegExp(search, 'i');
  try {
    const team = await TeamModel.findOne({ team_leader_id: req.tokenData._id });
    if (!team) return res.sendStatus(400);
    const allTeamBoards = await Promise.all(
      team.team_members.map(async (teamMemberId: string) => {
        const user = await UserModel.findOne({ _id: teamMemberId });
        if (user) {
          const boards = await BoardModel.find({ $and: [{ user_id: user._id }, { name: searchExp }] });
          return { name: user.name, boards };
        }
      })
    );

    res.json(allTeamBoards);
  } catch (err) {
    logger.error(err);
    res.status(502).json({ err });
  }
};

const getMyBoards = async (req: MyRequest, res: Response) => {
  let search = req.query.s;
  let searchExp = new RegExp(search, 'i');

  try {
    const boards = await BoardModel.find({
      $and: [{ name: searchExp }, { share_with: { $elemMatch: { user_id: req.tokenData._id } } }],
    });

    // const allBoards = await Promise.all(
    //   boards.map(async (board) => {
    //     if (board.user_id === req.tokenData._id || board.share_with.includes(req.tokenData._id)) return board;
    //   })
    // );

    res.json(boards);
  } catch (err) {
    logger.error(err);
    res.status(502).json({ err });
  }
};

const addBoard = async (req: Request, res: Response) => {
  const validBody = validateBoard(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const board = new BoardModel(req.body);
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(400);
    board.share_with.push({ user_id: user._id, name: user.name, email: user.email, isOwner: true });
    board.user_id = req.tokenData._id;
    const group = new GroupModel({ board_id: board._id, name: 'Group Title' });
    const defaultTasks = [
      { name: 'Item 1', status: { name: '', style: 'rgb(121, 126, 147)' } },
      { name: 'Item 2', status: { name: 'Working on it', style: 'rgb(253, 188, 100)' } },
      { name: 'Item 3', status: { name: 'Done', style: 'rgb(51, 211, 145)' } },
    ];
    group.tasks = defaultTasks;
    await board.save();
    await group.save();

    res.status(201).json(board);
  } catch (err) {
    logger.error(err);
    res.status(502).json({ err });
  }
};

const shareBoard = async (req: Request, res: Response) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const user = await UserModel.findOne({ email: req.body.user_email });
    if (!user) return res.sendStatus(400);
    const board = await BoardModel.findOne({ _id: boardID });
    if (!board) return res.sendStatus(400);
    const isUserFound = board.share_with.some((obj) => obj.user_id === user.id);
    if (!isUserFound) {
      board.share_with.push({ user_id: user._id, name: user.name, email: user.email });
      await board.save();
    }

    return res.sendStatus(200);
  } catch (err) {
    logger.error(err);
    res.status(502).json({ err });
  }
};

const unshareBoard = async (req: Request, res: Response) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    const board = await BoardModel.findOne({ _id: boardID });
    if (!board) return res.sendStatus(400);
    board.share_with = board.share_with.filter((user) => user.email !== req.body.user_email || user.isOwner);
    await board.save();

    return res.sendStatus(200);
  } catch (err) {
    logger.error(err);
    res.status(502).json({ err });
    6;
  }
};

const editBoard = async (req: Request, res: Response) => {
  const validBody = validateBoard(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const boardID = req.params.boardID;
    if (!boardID) return res.sendStatus(400);
    const update = await BoardModel.updateOne({ _id: boardID }, req.body);

    res.json(update);
  } catch (err) {
    logger.error(err);
    res.status(502).json({ err });
  }
};

const deleteBoard = async (req: Request, res: Response) => {
  try {
    const boardID = req.params.boardID;
    if (!boardID) return res.sendStatus(400);
    let board = await BoardModel.findOne({ _id: boardID });
    if (!board) return res.sendStatus(400);
    if (board.user_id !== req.tokenData._id) {
      board.share_with = board.share_with.filter((user) => user.user_id !== req.tokenData._id);
      await board.save();
      return res.sendStatus(401);
    }
    const groups = await GroupModel.find({ board_id: board._id });
    if (groups) {
      groups.forEach(async (group) => {
        await GroupModel.deleteOne({ board_id: group.board_id });
      });
    }
    const deleted = await BoardModel.deleteOne({ _id: boardID });

    res.status(200).json(deleted);
  } catch (err) {
    logger.error(err);
    res.status(502).json({ err });
  }
};

export default {
  getAllTeamBoards,
  getMyBoards,
  addBoard,
  shareBoard,
  unshareBoard,
  editBoard,
  deleteBoard,
};
