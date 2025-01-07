import { Request, Response } from "express";
import crypto from 'crypto';
import { v4 as uuidV4 } from 'uuid';
import { signupSchema } from "@notifications/schemes/signup";
import { BadRequestError, firstLetterUppercase, IAuthDocument, IEmailMessageDetails, lowerCase, uploads } from "@namdz608/jobber-shared";
import { UploadApiResponse } from 'cloudinary';
import { createAuthUser, getUserByUsernameOrEmail, signToken } from "@notifications/services/auth.services";
import { publishDirectMessage } from "@notifications/queues/auth.producer";
import { authChannel } from "@notifications/server";
import { StatusCodes } from "http-status-codes";

export async function create(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(signupSchema.validate(req.body));// kiểm tra các điều kiện validate của req.body gửi lên
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'Signup create() method error')
    }
    const { username, email, password, country, profilePicture, browserName, deviceType } = req.body
    const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
        throw new BadRequestError('invalid credentials. Email or username', 'Signup method error')
    }
    const profilePublicId = uuidV4();
    const uploadResult: UploadApiResponse = await uploads(profilePicture, `${profilePublicId}`, true, true) as UploadApiResponse;

    if (!uploadResult.public_id) {
        throw new BadRequestError('File upload error. Try again', 'SignUp create() method error');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
        username: firstLetterUppercase(username),
        email: lowerCase(email),
        profilePublicId,
        password,
        country,
        profilePicture: uploadResult?.secure_url,
        emailVerificationToken: randomCharacters,
        browserName,
        deviceType
    } as IAuthDocument;
    const result: IAuthDocument = await createAuthUser(authData) as IAuthDocument;
    const verificationLink = `${process.env.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: result.email,
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
    const userJWT: string = signToken(result.id!, result.email!, result.username!);
    res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
}