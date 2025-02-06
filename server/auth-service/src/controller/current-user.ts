import crypto from 'crypto';

import { getAuthUserById, getUserByEmail, updateVerifyEmailField } from '../services/auth.services';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, lowerCase } from '@namdz608/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
require('dotenv').config();
import { publishDirectMessage } from '../queues/auth.producer';
import { authChannel } from '../server';

export async function read_user(req: Request, res: Response): Promise<void> {
  let user = null;
  let existingUser = await getAuthUserById(req.currentUser!.id);
  if (Object.keys(existingUser!).length) {
    user = existingUser;
  }
  res.status(StatusCodes.OK).json({ message: 'Authenticated user', user });
}

export async function resendEmail(req: Request, res: Response): Promise<void> {
  const { email, userId } = req.body;
  const checkIfUserExist: IAuthDocument | undefined = await getUserByEmail(lowerCase(email));
  if (!checkIfUserExist) {
    throw new BadRequestError('Email is invalid', 'CurrentUser resentEmail() method error');
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  const verificationLink = `${process.env.CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;
  await updateVerifyEmailField(parseInt(userId), 0, randomCharacters);
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service.'
  );
  const updatedUser = await getAuthUserById(parseInt(userId));
  res.status(StatusCodes.OK).json({ message: 'Email verification sent', user: updatedUser });
}