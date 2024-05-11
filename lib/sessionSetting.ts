import { SessionOptions } from "iron-session";

export interface SessionData {
  id?: number;
  username?: string;
  email?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  username: "",
  email: "",
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  cookieName: "omoi",
  password: process.env.COOKIE_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
