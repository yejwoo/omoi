"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionData, sessionOptions, defaultSession } from "@/lib/sessionSetting";
import { revalidatePath } from "next/cache";

export async function saveSession(sessionData: SessionData) {
  const cookieStore = cookies();
  cookieStore.set(sessionOptions.cookieName, JSON.stringify(sessionData), {
    maxAge: 60 * 60 * 24 * 7, 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  revalidatePath("/");
}


export async function login(formData: FormData) {
  const cookieStore = cookies();

  const sessionData: SessionData = {
    id: parseInt(formData.get("id") as string) ?? 0,
    username: (formData.get("username") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    isLoggedIn: true,
  };

  cookieStore.set(sessionOptions.cookieName, JSON.stringify(sessionData), {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  revalidatePath("/");
  return redirect("/");
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete(sessionOptions.cookieName);
  revalidatePath("/");
  return redirect("/");
}

export async function getSession() {
  const cookieStore = cookies();
  const cookie = cookieStore.get(sessionOptions.cookieName);
  let session: SessionData = defaultSession;

  if (cookie) {
    session = JSON.parse(cookie.value);
  }

  return {
    id: session.id,
    username: session.username,
    email: session.email,
    isLoggedIn: session.isLoggedIn,
  };
}
