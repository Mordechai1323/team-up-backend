import { Request, Response } from 'express';
import { UserModel, generateAccessToken } from '../../models/userModel';
import logger  from '../../logger/logger.js';

const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.status(401).json({ err: 'fail validating token' });
    if (!user.refresh_tokens.includes(req.refreshToken)) {
      user.refresh_tokens = [];
      await user.save();
      return res.status(403).json({ err: 'fail validating token' });
    }
    const accessToken = generateAccessToken(user._id, user.role, user.email);
    res.json({ accessToken, name: user.name, role: user.role });
  } catch (err) {
    logger.error(err)
    res.status(502).json(err);
  }
};

export default { handleRefreshToken };
