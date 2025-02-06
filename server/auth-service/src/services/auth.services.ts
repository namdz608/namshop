import { IAuthBuyerMessageDetails, IAuthDocument, firstLetterUppercase, lowerCase, winstonLogger } from '@namdz608/jobber-shared'
import { Logger } from 'winston';
import { Model } from 'sequelize'
import { AuthModel } from '../models/auth.schema'
import { publishDirectMessage } from '../queues/auth.producer';
import { authChannel } from '../server';
// import { omit } from 'lodash';
import db from '../../db-knex'
import { sign } from 'jsonwebtoken';
require('dotenv').config();

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'authQueueConeections', 'debug')

export async function createAuthUser(data: IAuthDocument): Promise<object> {
    const newuserData = {
        username: data.username,
        email: data.email,
        profilePublicId: data.profilePicture,
        password: data.password,
        country: data.country,
        profilePicture: data.profilePicture,
        emailVerificationToken: data.emailVerificationToken,
        browserName: data.browserName,
        deviceType: data.deviceType,
        createdAt: data.createdAt,
    }
    console.log(newuserData)

    const result = await db('auths').insert(newuserData)
    const newUser = await db('auths').select('*')
    .where('id', result[0]).first()
  
    //================ Insert theo kieu Sequelize ==================
    // const result: Model = await AuthModel.create(data);
    // const messageDetails: IAuthBuyerMessageDetails = {
    //   username: result.dataValues.username!,h
    //   email: result.dataValues.email!,
    //   profilePicture: result.dataValues.profilePicture!,
    //   country: result.dataValues.country!,
    //   createdAt: result.dataValues.createdAt!,
    //   type: 'auth'
    // };

    const messageDetail: IAuthBuyerMessageDetails = {
        username: newuserData.username!,
        email: newuserData.email!,
        profilePicture: newuserData.profilePicture!,
        country: newuserData.country!,
        createdAt: newuserData.createdAt!,
        type: 'auth'
    }
    await publishDirectMessage(
        authChannel,
        'jobber-buyer-update',
        'user-buyer',
        JSON.stringify(messageDetail),
        'Buyer details sent to buyer svc'
    )
    // const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument
    return newUser
}

export async function getAuthUserById(authId: number): Promise<Model<IAuthDocument> | undefined> {
    try {
        const user: Model = await AuthModel.findOne({
            where: { id: authId },
            attributes: {
                exclude: ['password']
            }
        }) as Model;
        return user
    } catch (error) {
        log.error(error);
    }
}

export async function getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | undefined> {
    try {
        const transformedUsername = firstLetterUppercase(username);
        const transformedEmail = lowerCase(email);
        const user: Model = await db('auths')
            .where('username', transformedUsername)
            .orWhere('email', transformedEmail)
            .first();
        return user?.dataValues;
    } catch (e) {
        log.error(e);
    }
}

export async function getUserByUsername(username: string): Promise<IAuthDocument | undefined> {
    try {
        const transformedUsername = firstLetterUppercase(username);
        const user = await db('auths')
            .where('username', transformedUsername)
            .first();
        console.log('user: ',user)
        return user;
    } catch (e) {
        log.error(e);
    }
}

export async function getUserByEmail(email: string): Promise<IAuthDocument | undefined> {
    try {
        const transformedEmail = lowerCase(email);
        const user = await db('auths')
            .where('email', transformedEmail)
            .first();
        return user;
    } catch (e) {
        log.error(e);
    }
}

export async function getAuthUserByVerificationToken(token: string): Promise<IAuthDocument | undefined> {
    try {
        const user: Model = await db('auths')
            .where('emailVerificationToken', token)
            .first();
        return user.dataValues;
    } catch (e) {
        log.error(e);
    }
}

export async function getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | undefined> {
    try {
        const user: Model = await db('auths')
            .where('passwordResetToken', token)
            .andWhere('passwordResetExpires', '>', new Date())
            .first();
        return user?.dataValues;
    } catch (error) {
        log.error(error);
    }
}

export async function updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken?: string): Promise<void> {
    try {
        const updateData = !emailVerificationToken
            ? { emailVerified }
            : { emailVerified, emailVerificationToken }; //Nếu không tồn tại emailVerificationToken thì biến updateData = { emailVerified } còn có thì sẽ là {emailVerified, emailVerificationToken}
        await db('auths') // Thay 'auths' bằng tên bảng của bạn
            .where({ id: authId })
            .update(updateData);
    } catch (error) {
        log.error(error);
    }
}

export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
    try {
        await db('auths') // Thay 'auths' bằng tên bảng của bạn
            .where({ id: authId })
            .update({
                passwordResetToken: token,
                passwordResetExpires: tokenExpiration
            })
    } catch (error) {
        log.error(error);
    }
}

export async function updatePassword(authId: number, password: string): Promise<void> {
    try {
        await db('auths')
            .update({
                password,
                passwordResetToken: '',
                passwordResetExpires: new Date()
            }
            ).
            where({ id: authId })

    } catch (error) {
        log.error(error);
    }
}

export function signToken(id: number, email: string, username: string): string {
    return sign(
        {
            id,
            email,
            username
        },
        process.env.JWT_TOKEN!
    );
}