import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validateUser, UserModel, generateAccessToken, generateRefreshToken } from '../../models/userModel';
import { validateHuman } from '../../middleware/auth';

const handleNewUser = async (req: Request, res: Response) => {
  const validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const human = await validateHuman(req.body.recaptchaToken);
    if (!human) return res.sendStatus(400);

    const user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);

    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refresh_tokens = [refreshToken];

    await user.save();

    user.password = '*****';

    res.cookie('token', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true,  sameSite: 'none'});
    res.status(201).json({ accessToken, user });
  } catch (err: any) {
    if (err.code == 11000) {
      return res.status(401).json({ err: 'Email already in system, try log in', code: 11000 });
    }
    console.log(err);
    res.status(502).json(err);
  }
};

export default { handleNewUser };
