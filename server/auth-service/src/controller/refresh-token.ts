import { getUserByUsername, signToken } from '../services/auth.services';
import { IAuthDocument } from '@namdz608/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function token(req: Request, res: Response): Promise<void> {
  console.log('test')
  const existingUser: IAuthDocument | undefined = await getUserByUsername(req.params.username);
  const userJWT: string = signToken(existingUser!.id!, existingUser!.email!, existingUser!.username!);
  res.status(StatusCodes.OK).json({ message: 'Refresh token', user: existingUser, token: userJWT });
}