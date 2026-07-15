import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const MAX_FIELD_LENGTHS = {
  name: 120,
  email: 180,
  company: 180,
  use_case: 1500,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AccessRequestInput = {
  name: string;
  email: string;
  company: string | null;
  useCase: string;
};

function readField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateAccessRequest(formData: FormData):
  | { ok: true; value: AccessRequestInput }
  | { ok: false; error: string } {
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const company = readField(formData, "company");
  const useCase = readField(formData, "use_case");

  if (!name || !email || !useCase) {
    return { ok: false, error: "Name, email, and use case are required." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Invalid email address." };
  }

  if (
    name.length > MAX_FIELD_LENGTHS.name ||
    email.length > MAX_FIELD_LENGTHS.email ||
    company.length > MAX_FIELD_LENGTHS.company ||
    useCase.length > MAX_FIELD_LENGTHS.use_case
  ) {
    return { ok: false, error: "One or more fields are too long." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      company: company || null,
      useCase,
    },
  };
}

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const validation = validateAccessRequest(formData);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const sql = getDatabase();
  const { name, email, company, useCase } = validation.value;

  await sql`
    INSERT INTO access_requests (name, email, company, use_case)
    VALUES (${name}, ${email}, ${company}, ${useCase})
  `;

  return NextResponse.redirect(new URL("/request-sent", request.url), 303);
}
