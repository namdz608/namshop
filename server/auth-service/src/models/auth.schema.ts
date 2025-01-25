import { sequelize } from '../database'
import { IAuthDocument } from '@namdz608/jobber-shared'
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';
import { compare, hash } from 'bcryptjs';

interface AuthModelInstanceMethods extends Model { //Interface này được thiết kế để mở rộng các phương thức (methods) của một mô hình (model) Sequelize, cụ thể là mô hình xác thực người dùng (AuthModel)
    //nghĩa là nó kế thừa tất cả các thuộc tính và phương thức cơ bản của một mô hình Sequelize.
    prototype: { //Trong JavaScript, prototype được sử dụng để định nghĩa các phương thức mà tất cả các instance (thể hiện) của một lớp đều có thể truy cập
        comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
        hashPassword: (password: string) => Promise<string>;
    }
}

type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires' | 'updatedAt'>;

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttributes> & AuthModelInstanceMethods = sequelize.define('auths', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePublicId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING, 
        allowNull: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    browserName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'test'
    },
    deviceType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'iphone'
    },
    otp: {
        type: DataTypes.STRING
    },
    otpExpiration: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now
    },
    passwordResetToken: { type: DataTypes.STRING, allowNull: true },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['emailVerificationToken']
        },
    ]
}) as ModelDefined<IAuthDocument, AuthUserCreationAttributes> & AuthModelInstanceMethods;

AuthModel.addHook('beforeCreate', async (auth: Model) => {
    const hashedPassword: string = await hash(auth.dataValues.password as string, 10);
    auth.dataValues.password = hashedPassword;
});

AuthModel.prototype.comparePassword = async function (password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
};

AuthModel.prototype.hashPassword = async function (password: string): Promise<string> {
    return hash(password, 10);
};

AuthModel.sync({});
export { AuthModel };