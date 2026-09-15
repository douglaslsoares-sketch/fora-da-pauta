import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";

import {
  QUESTIONS_ADMIN_COOKIE,
  verifyQuestionsAdminSessionToken,
} from "@/lib/questionsAdminAuth";

export const dynamic =
  "force-dynamic";

export async function GET() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      QUESTIONS_ADMIN_COOKIE,
    )?.value;

  const authenticated =
    verifyQuestionsAdminSessionToken(
      token,
    );

  const response =
    NextResponse.json(
      {
        authenticated,
      },
      {
        status: 200,
      },
    );

  response.headers.set(
    "Cache-Control",
    "no-store",
  );

  return response;
}