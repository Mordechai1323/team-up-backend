import mongoose from 'mongoose';
import Joi from 'joi';

interface ITeam {
  _id: string;
  team_leader_id: string;
  name: string;
  team_members: string[];
}

const teamSchema = new mongoose.Schema({
  team_leader_id: String,
  team_members: {
    type: [String],
  },
  name: String,
});

export const TeamModel = mongoose.model<ITeam>('teams', teamSchema);

export const validateTeam = (reqBody: { team_members: string[]; name: string }) => {
  const joiSchema = Joi.object({
    team_members: Joi.array().items(Joi.string().min(1).max(150).required()),
    name: Joi.string().min(1).max(150).required(),
  });

  return joiSchema.validate(reqBody);
};

export const validateTeamMember = (reqBody: { team_member: string }) => {
  const joiSchema = Joi.object({
    team_member: Joi.string().min(1).max(150).email().required(),
  });

  return joiSchema.validate(reqBody);
};
