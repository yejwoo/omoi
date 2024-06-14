import { NextResponse } from 'next/server';
import querystring from 'querystring';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

const getGoogleAuthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  return `${rootUrl}?${querystring.stringify(options)}`;
};

export async function GET() {
  const googleAuthURL = getGoogleAuthURL();
  return NextResponse.redirect(googleAuthURL);
}
