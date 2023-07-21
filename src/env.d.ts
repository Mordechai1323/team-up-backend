declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USER_DB: string;
      PASS_DB: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_EXPIRATION: string;
      REFRESH_TOKEN_EXPIRATION: string;
      ONE_TIME_CODE_TOKEN_EXPIRATION: string;
      RECAPTCHA_SECRET_KEY: string;
    }
  }
  interface IDecodeToken {
    role: string;
    _id: string;
    email?: string;
  }
  declare namespace Express {
    export interface Request {
      tokenData: IDecodeToken;
      refreshToken: string;
    }
  }
}

export {};
