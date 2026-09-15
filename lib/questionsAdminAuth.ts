import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const QUESTIONS_ADMIN_COOKIE =
  "fdp_questions_admin";

export const QUESTIONS_ADMIN_SESSION_MAX_AGE_SECONDS =
  8 * 60 * 60;

type SessionPayload = {
  version: 1;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

function getAccessCode() {
  const value =
    process.env
      .QUESTIONS_ADMIN_ACCESS_CODE;

  if (!value) {
    throw new Error(
      "QUESTIONS_ADMIN_ACCESS_CODE não configurado.",
    );
  }

  return value;
}

function getSessionSecret() {
  const value =
    process.env
      .QUESTIONS_ADMIN_SESSION_SECRET;

  if (!value) {
    throw new Error(
      "QUESTIONS_ADMIN_SESSION_SECRET não configurado.",
    );
  }

  return value;
}

function safeEqual(
  left: string,
  right: string,
) {
  const leftBuffer =
    Buffer.from(
      left,
      "utf8",
    );

  const rightBuffer =
    Buffer.from(
      right,
      "utf8",
    );

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBuffer,
    rightBuffer,
  );
}

function sign(
  value: string,
) {
  return createHmac(
    "sha256",
    getSessionSecret(),
  )
    .update(value)
    .digest("base64url");
}

export function verifyQuestionsAdminAccessCode(
  code: string,
) {
  return safeEqual(
    code,
    getAccessCode(),
  );
}

export function createQuestionsAdminSessionToken() {
  const now =
    Math.floor(
      Date.now() / 1000,
    );

  const payload: SessionPayload = {
    version: 1,

    issuedAt:
      now,

    expiresAt:
      now +
      QUESTIONS_ADMIN_SESSION_MAX_AGE_SECONDS,

    nonce:
      randomBytes(16)
        .toString(
          "base64url",
        ),
  };

  const encoded =
    Buffer.from(
      JSON.stringify(
        payload,
      ),
      "utf8",
    ).toString(
      "base64url",
    );

  const signature =
    sign(
      encoded,
    );

  return `${encoded}.${signature}`;
}

export function verifyQuestionsAdminSessionToken(
  token:
    | string
    | undefined
    | null,
) {
  if (!token) {
    return false;
  }

  const parts =
    token.split(
      ".",
    );

  if (
    parts.length !== 2
  ) {
    return false;
  }

  const encoded =
    parts[0];

  const signature =
    parts[1];

  if (
    !encoded ||
    !signature
  ) {
    return false;
  }

  const expected =
    sign(
      encoded,
    );

  if (
    !safeEqual(
      signature,
      expected,
    )
  ) {
    return false;
  }

  try {
    const payload =
      JSON.parse(
        Buffer.from(
          encoded,
          "base64url",
        ).toString(
          "utf8",
        ),
      ) as Partial<SessionPayload>;

    const now =
      Math.floor(
        Date.now() / 1000,
      );

    return (
      payload.version === 1 &&
      typeof payload.issuedAt ===
        "number" &&
      typeof payload.expiresAt ===
        "number" &&
      typeof payload.nonce ===
        "string" &&
      payload.issuedAt <=
        now + 60 &&
      payload.expiresAt >
        now
    );
  }
  catch {
    return false;
  }
}