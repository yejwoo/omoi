// import { SessionOptions } from "iron-session";

// export interface SessionData {
//   id?: string;
//   username?: string;
//   email?: string;
//   isLoggedIn: boolean;
// }

// export const defaultSession: SessionData = {
//   isLoggedIn: false,
// };

// export const sessionOptions: SessionOptions = {
//   password: process.env.COOKIE_PASSWORD!,
//   cookieName: "omoi",
//   cookieOptions: {
//     httpOnly: true,
//     // Secure only works in `https` environments. So if the environment is `https`, it'll return true.
//     secure: process.env.NODE_ENV === "production",
//   },
// };
