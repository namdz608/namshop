declare global { //declare global được dùng để mở rộng các kiểu toàn cục trong TypeScript
    namespace Express {
      interface Request {  //Bằng cách mở rộng interface Request, ta bổ sung thuộc tính currentUser vào đối tượng Request của ns Express.
        currentUser?: IAuthPayload; //currentUser là một thuộc tính tùy chọn (?), có kiểu là IAuthPayload.
      }
    }
  }
  
  export interface IAuthPayload { //interface giúp định hình và ràng buộc cấu trúc dữ liệu để đảm bảo tính an toàn về kiểu
    id: number;
    username: string; 
    email: string;
    iat?: number;
  }
  
  export interface IAuth {
    username?: string;
    password?: string;
    email?: string;
    country?: string;
    profilePicture?: string;
  }
  
  export interface IAuthDocument {
    id?: number;
    profilePublicId?: string;
    username?: string;
    email?: string;
    password?: string;
    country?: string;
    profilePicture?: string;
    emailVerified?: number;
    emailVerificationToken?: string;
    browserName?: string;
    deviceType?: string;
    otp?: string;
    otpExpiration?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
  }
  
  export interface IAuthBuyerMessageDetails {
    username?: string;
    profilePicture?: string;
    email?: string;
    country?: string;
    createdAt?: Date;
    type?: string;
  }
  
  export interface IEmailMessageDetails {
    receiverEmail?: string;
    template?: string;
    verifyLink?: string;
    resetLink?: string;
    username?: string;
    otp?: string;
  }
  
  export interface ISignUpPayload {
    [key: string]: string;
    username: string;
    password: string;
    email: string;
    country: string;
    profilePicture: string;
  }
  
  export interface ISignInPayload {
    [key: string]: string;
    username: string;
    password: string;
  }
  
  export interface IForgotPassword {
    email: string;
  }
  
  export interface IResetPassword {
    [key: string]: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface IReduxAuthPayload {
    authInfo?: IAuthDocument;
  }
  
  export interface IReduxAddAuthUser {
    type: string;
    payload: IReduxAuthPayload;
  }
  
  export interface IReduxLogout {
    type: string;
    payload: boolean;
  }
  
  export interface IAuthResponse {
    message: string;
  }
  
  export interface IAuthUser {
    profilePublicId: string | null;
    country: string | null;
    createdAt: Date | null;
    email: string | null;
    emailVerificationToken: string | null;
    emailVerified: boolean | null;
    id: number | null;
    passwordResetExpires: Date | null;
    passwordResetToken: null | null;
    profilePicture: string | null;
    updatedAt: Date | null;
    username: string | null;
  }