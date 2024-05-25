"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionData, sessionOptions, defaultSession } from "@/lib/sessionSetting";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const session = await getSession();

  session.username = (formData.get("username") as string) ?? "No username";
  session.isLoggedIn = true;
  await session.save();
  revalidatePath("/");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
  // revalidatePath("/") // 무슨 용도?
}

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if(!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
    session.username = defaultSession.username;
  }

 return {
    isLoggedIn: session.isLoggedIn,
    username: session.username,
    id: session.id,
    email: session.email,
  };
}
