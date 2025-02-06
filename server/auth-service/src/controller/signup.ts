import { Request, Response } from "express";
import crypto from 'crypto';
import { v4 as uuidV4 } from 'uuid';
import { signupSchema } from "@notifications/schemes/signup";
import { BadRequestError, firstLetterUppercase, IAuthDocument, IEmailMessageDetails, lowerCase } from "@namdz608/jobber-shared";
import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { createAuthUser, getUserByUsernameOrEmail, signToken } from "@notifications/services/auth.services";
import { publishDirectMessage } from "@notifications/queues/auth.producer";
import { authChannel } from "@notifications/server";
import { StatusCodes } from "http-status-codes";
import { hash } from 'bcryptjs';

function uploads(
    file: string,
    public_id?: string,
    overwrite?: boolean,
    invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
    return new Promise((resolve) => {
        cloudinary.v2.uploader.upload(
            file,
            {
                public_id,
                overwrite,
                invalidate,
                resource_type: 'auto' // zip, images
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) resolve(error);
                resolve(result);
            }
        );
    });
}

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
    console.log('upload Result from auth-service/src/controller/signup.ts ', uploadResult)
    if (!uploadResult.public_id) {
        throw new BadRequestError('File upload error. Try again', 'SignUp create() method error');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const hashedPassword: string = await hash(password as string, 10);
    const authData: IAuthDocument = {
        username: firstLetterUppercase(username),
        email: lowerCase(email),
        profilePublicId,
        password: hashedPassword,
        country,
        profilePicture: uploadResult?.secure_url,
        emailVerificationToken: randomCharacters,
        browserName,
        deviceType
    } as IAuthDocument;
    const newUser = await createAuthUser(authData);
    const verificationLink = `${process.env.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
    var string = JSON.stringify(newUser);
    var result = JSON.parse(string);
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