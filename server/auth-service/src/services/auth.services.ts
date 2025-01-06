import { IAuthBuyerMessageDetails, IAuthDocument, firstLetterUppercase, lowerCase, winstonLogger } from '@namdz608/jobber-shared'
import { Logger } from 'winston';
import { Model } from 'sequelize'
import { AuthModel } from '../models/auth.schema'
import { publishDirectMessage } from '../queues/auth.producer';
import { authChannel } from '../server';
import { omit } from 'lodash';
import db from '../../db-knex'

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'authQueueConeections', 'debug')

export async function createAuthUser(data: IAuthDocument): Promise<IAuthDocument | undefined> {
    const result: Model = await AuthModel.create(data);
    const messageDetail: IAuthBuyerMessageDetails = {
        username: result.dataValues.username!,
        email: result.dataValues.email!,
        profilePicture: result.dataValues.profilePicture!,
        country: result.dataValues.country!,
        createdAt: result.dataValues.email!,
        type: 'auth'
    }
    await publishDirectMessage(
        authChannel,
        'jobber-buyer-update',
        'user-buyer',
        JSON.stringify(messageDetail),
        'Buyer details sent to buyer svc'
    )
    const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument
    return userData
}

export async function getAuthUserById(authId: number): Promise<Model<IAuthDocument> | undefined> {
    try {
        const user: Model = await AuthModel.findOne({
            where: { id: authId },
            attributes: {
                exclude: ['password']
            }
        }) as Model;
        return user?.dataValues;
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
        return user.dataValues;    
    } catch (e) {
        log.error(e);
    }
}

