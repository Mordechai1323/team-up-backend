import { Request, Response } from 'express';
import { GroupModel, validateEditGroup, validateEditStatus, validateTask } from '../../models/groupModel';
import { validateUserEmail } from '../../models/boardModel';

//Groups
const getGroups = async (req: Request, res: Response) => {
  const boardID = req.query.boardID;
  try {
    const groups = await GroupModel.find({ board_id: boardID });
    // if (filterByPerson && tasks?.tasks) {
    //   tasks.tasks = tasks?.tasks?.filter((task) => task?.in_care?.includes(filterByPerson));
    // }

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
    let groups = await GroupModel.find({ $and: [{ board_id: boardID }, { name: searchExp }] });

    return res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(502).json({ err });
  }
};

const addGroup = async (req: Request, res: Response) => {
  const boardID = req.query.boardID;
  try {
    const group = new GroupModel({ name: 'New Group', board_id: boardID });
    await group.save();

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

    return res.json(groups);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

//Tasks
const addTask = async (req: Request, res: Response) => {
  const validBody = validateTask(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  try {
    const group = await GroupModel.findOne({ _id: groupID });
    if (!group) return res.sendStatus(400);

    group.tasks.push({
      name: req.body.name,
      status: { name: '', style: 'rgb(121, 126, 147)' },
    });
    await group.save();

    return res.json(group);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addInCare = async (req: Request, res: Response) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  const taskID = req.query.taskID;
  try {
    const group = await GroupModel.findOne({ _id: groupID });
    if (!group) return res.sendStatus(400);
    group?.tasks.forEach((task) => {
      if (task?.id === taskID) {
        if (!task?.in_care?.includes(req?.body?.user_email)) task?.in_care?.push(req?.body?.user_email);
      }
    });
    await group.save();

    return res.status(201).json(group);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteInCare = async (req: Request, res: Response) => {
  const validBody = validateUserEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  const taskID = req.query.taskID;
  try {
    const group = await GroupModel.findOne({ _id: groupID });
    if (!group) return res.sendStatus(400);
    group.tasks.forEach((task) => {
      if (task.id === taskID) {
        const index = task.in_care?.indexOf(req.body.user_email);
        if (index !== undefined && index !== -1) task.in_care?.splice(index, 1);
      }
    });
    await group.save();

    return res.status(201).json(group);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const changeStatus = async (req: Request, res: Response) => {
  const validBody = validateEditStatus(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const groupID = req.query.groupID;
  const taskID = req.query.taskID;
  try {
    const group = await GroupModel.findOne({ _id: groupID });
    if (!group) return res.sendStatus(400);
    group.tasks.forEach((task) => {
      if (task.id === taskID) {
        task.status.name = req.body.name;
        task.status.style = req.body.style;
      }
    });
    await group.save();

    return res.status(201).json(group);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const editTask = async (req: Request, res: Response) => {
  const validBody = validateEditGroup(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const groupID = req.query.groupID;
    const taskID = req.query.taskID;
    const group = await GroupModel.findOne({ _id: groupID });
    if (!group) return res.sendStatus(400);
    group.tasks.forEach((task) => {
      if (task.id === taskID) task.name = req.body.name;
    });
    await group.save();

    return res.json(group);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteTask = async (req: Request, res: Response) => {
  try {
    const groupID = req.query.groupID;
    const taskID = req.query.taskID;
    const group = await GroupModel.findOne({ _id: groupID });
    if (!group) return res.status(400).json({ err: 'group not found' });
    group.tasks = group?.tasks?.filter((task) => task?.id !== taskID);
    await group.save();

    return res.json(group);
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
  addTask,
  addInCare,
  deleteInCare,
  changeStatus,
  editTask,
  deleteTask,
};
