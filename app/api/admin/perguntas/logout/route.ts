import {
  NextResponse,
} from "next/server";

import {
  QUESTIONS_ADMIN_COOKIE,
} from "@/lib/questionsAdminAuth";

export const dynamic =
  "force-dynamic";

function isSameOrigin(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(
        origin,
      ).origin ===
      new URL(
        request.url,
      ).origin
    );
  }
  catch {
    return false;
  }
}

export async function POST(
  request: Request,
) {
  if (
    !isSameOrigin(
      request,
    )
  ) {
    const response =
      NextResponse.json(
        {
          ok: false,
          error:
            "Origem não autorizada.",
        },
        {
          status: 403,
        },
      );

    response.headers.set(
      "Cache-Control",
      "no-store",
    );

    return response;
  }

  const response =
    NextResponse.json(
      {
        ok: true,
      },
      {
        status: 200,
      },
    );

  response.cookies.set({
    name:
      QUESTIONS_ADMIN_COOKIE,

    value:
      "",

    httpOnly:
      true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      "lax",

    path:
      "/",

    maxAge:
      0,
  });

  response.headers.set(
    "Cache-Control",
    "no-store",
  );

  return response;
}