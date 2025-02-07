import { BadRequestError, isEmail } from '@namdz608/jobber-shared';
import { AuthModel } from '../models/auth.schema';
import { loginSchema } from '../schemes/signin';
import { getUserByEmail, getUserByUsername, signToken } from '../services/auth.services';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function read(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(loginSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'SignIn read() method error');
    }

    const { username, password } = req.body;
    const isValidEmail: boolean = isEmail(username);
    console.log('isValidEmail:  ',isValidEmail)
    const existingUser = !isValidEmail ? await getUserByUsername(username) : await getUserByEmail(username);

    if (!existingUser) {
        throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }
    const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(password, `${existingUser.password}`);
    if (!passwordsMatch) {
        throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }
    let userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);

    res.status(StatusCodes.OK).json({ user: existingUser, token: userJWT });
}