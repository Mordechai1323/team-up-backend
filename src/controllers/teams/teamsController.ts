import { Request, Response } from 'express';
import { TeamModel, validateTeam, validateTeamMember } from '../../models/teamModel';
import { UserModel, generateAccessToken } from '../../models/userModel';

const getTeam = async (req: Request, res: Response) => {
  const team = await TeamModel.findOne({ team_leader_id: req.tokenData._id });
  if (!team) return res.sendStatus(400);
  const teamMembers = await Promise.all(
    team.team_members.map(
      async (teamMemberId) => await UserModel.findOne({ _id: teamMemberId }, { password: 0, refresh_tokens: 0, one_time_code: 0 })
    )
  );

  res.json(teamMembers);
};

const createTeam = async (req: Request, res: Response) => {
  const validBody = validateTeam(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const team = new TeamModel({ name: req.body.name });
    let usersNotFound = [];
    let teamMembers = [];
    for (const teamMemberEmail of req.body.team_members) {
      const teamMember = await UserModel.findOne({ email: teamMemberEmail });
      if (!teamMember) usersNotFound.push(teamMemberEmail);
      else teamMembers.push(teamMember._id);
    }
    team.team_members = teamMembers;
    team.team_leader_id = req.tokenData._id;
    await team.save();

    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(400);
    user.role = 'team_leader';
    await user.save();
    const accessToken = generateAccessToken(user._id, user.role, user.email);
    if (usersNotFound.length > 0) {
      const err = { err: `Some or all of the team members were not found, The users not found ${usersNotFound} ` };
      return res.status(400).json({ team, accessToken, err });
    }

    return res.json({ team, accessToken });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const addTeamMember = async (req: Request, res: Response) => {
  const validBody = validateTeamMember(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const team = await TeamModel.findOne({ team_leader_id: req.tokenData._id });
    if (!team) return res.sendStatus(400);
    const user = await UserModel.findOne({ email: req.body.team_member });
    if (!user) return res.status(400).json(`${req.body.team_member} not found`);
    if (team.team_members.includes(user._id)) return res.sendStatus(400);
    team.team_members.push(user._id);
    await team.save();

    return res.json(team);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const removeTeamMember = async (req: Request, res: Response) => {
  const validBody = validateTeamMember(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const team = await TeamModel.findOne({ team_leader_id: req.tokenData._id });
    if (!team) return res.sendStatus(400);
    const user = await UserModel.findOne({ email: req.body.team_member });
    if (!user) return res.sendStatus(400);

    const teamMemberIndex = team.team_members.indexOf(user._id);
    if (teamMemberIndex === -1) return res.sendStatus(400);
    team.team_members.splice(teamMemberIndex, 1);
    await team.save();

    return res.json(team);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

const deleteTeam = async (req: Request, res: Response) => {
  try {
    const team = await TeamModel.deleteOne({ team_leader_id: req.tokenData._id });
    if (!team) return res.sendStatus(400);
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(400);
    user.role = 'user';
    await user.save();
    const accessToken = generateAccessToken(user._id, user.role, user.email);
    return res.json({ team, accessToken });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
};

export default {
  getTeam,
  createTeam,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
};
