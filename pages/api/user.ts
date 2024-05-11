// // pages/api/user.js
// import { getSession } from "@/lib/session";
// import { NextApiRequest, NextApiResponse } from "next";
// import { redirect } from "next/navigation";

// export default async function user(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === "POST") {
//     const { id, username, email } = req.query;

//     // Query 파라미터 타입 체크 및 변환
//     const userId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string);
//     const userUsername = Array.isArray(username) ? username[0] : username;
//     const userEmail = Array.isArray(email) ? email[0] : email;

//     if (!userId || !userUsername || !userEmail) {
//       return res.status(400).json({ message: "User info required" });
//     }

//     try {
//       const session = await getSession();
//       session.id = userId;
//       session.username = userUsername;
//       session.email = userEmail;
//       session.isLoggedIn = true;
//       await session.save();
//       // res.status(200).json({ message: "Login successful" });
//       // res.redirect("/");
//       // return res.status(200).json({ message: "PERFECT" });
//       // 페이지를 리다이렉트하기 전에 API 응답을 종료
//       // return session;
//     } catch (error) {
//       console.error("Error during signin:", error);
//       throw error;
//       // res.status(500).json({ error: "Internal Server Error" });
//     }
//     redirect("/")
//   }
// }

// import { sessionOptions } from "@/lib/sessionSetting";
// import { getSession } from "@/lib/session";
// import { NextApiRequest, NextApiResponse } from "next";

// export default async function userRoute(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getSession();
//   if (session) {
//     res.status(200).json({ user: session});
//   } else {
//     res.status(404).json({ error: "User not found" });
//   }
// }

