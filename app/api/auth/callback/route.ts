import db from '@/lib/db';
import { saveSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/api/auth/callback";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") as string;

  // 토큰 요청
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();

  // 사용자 정보 요청
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );

  const user = await userResponse.json();
  let dbUser = await db.user.findUnique({ where: { email: user.email } });

  // 세션에 유저 정보 저장
  if(!dbUser) {
    dbUser = await db.user.create({
      data: {
        email: user.email,
        password: "",
        username: user.name,
        profile: user.picture
      },
    });
  }
  const sessionData = {
    id: dbUser.id,
    email: user.email,
    username: user.name,
    isLoggedIn: true,
  };

  await saveSession(sessionData);

  // 리디렉션
  return NextResponse.redirect(new URL('/', req.url));
}
