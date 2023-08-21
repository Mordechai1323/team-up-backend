import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validateLogin, UserModel, generateAccessToken, generateRefreshToken } from'../../models/userModel'
import { validateHuman } from'../../middleware/auth'
import logger  from '../../logger/logger.js';

const handleLogin = async (req: Request, res: Response) => {
  const validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    if (process.env.MODE_ENV === 'production') {
      const human = await validateHuman(req.body.recaptchaToken);
      if (!human) return res.sendStatus(400);
    }

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.sendStatus(401);

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.sendStatus(401);

    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id, user.role);
    if (!user.refresh_tokens) user.refresh_tokens = [refreshToken];
    else user.refresh_tokens.push(refreshToken);
    await user.save();

    res.cookie('token', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true, sameSite: 'none' });
    res.json({ accessToken, name: user.name, role: user.role });
  } catch (err) {
    logger.error(err)
    res.sendStatus(502);
  }
};

export default { handleLogin };
