import { Request, Response } from 'express';
import { GroupModel, validateEditGroup } from '../../models/groupModel';
import { TaskModel } from '../../models/taskModel';

const getGroups = async (req: Request, res: Response) => {
  const boardID = req.query.boardID;
  try {
    const groups = await GroupModel.find({ project_id: boardID });

    return res.json(groups);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const searchGroups = async (req: Request, res: Response) => {
  const boardID = req.query.boardID;
  const search = String(req.query.s);
  const searchExp = new RegExp(search, 'i');

  try {
    let groups = await GroupModel.find({ $and: [{ project_id: boardID }, { name: searchExp }] });

    return res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(502).json({ err });
  }
};

const addGroup = async (req: Request, res: Response) => {
  const boardID = req.query.boardID;
  try {
    const group = new GroupModel({ name: 'New Group', project_id: boardID });
    const tasks = new TaskModel({ group_id: group._id });
    await group.save();
    await tasks.save();

    return res.json(group);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const changeIsOpen = async (req: Request, res: Response) => {
  const groupID = req.query.groupID;
  try {
    const group = await GroupModel.findOne({ _id: groupID });
    if (!group) return res.sendStatus(400);
    group.is_open = !group.is_open;
    await group.save();

    return res.json(group);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const editGroup = async (req: Request, res: Response) => {
  const validBody = validateEditGroup(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  try {
    const groups = await GroupModel.updateOne({ _id: groupID }, req.body);

    return res.json(groups);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteGroup = async (req: Request, res: Response) => {
  const groupID = req.query.groupID;
  try {
    const groups = await GroupModel.deleteOne({ _id: groupID });
    const tasks = await TaskModel.deleteOne({ group_id: groupID });

    return res.json(groups);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

export default {
  getGroups,
  searchGroups,
  addGroup,
  changeIsOpen,
  editGroup,
  deleteGroup,
};
