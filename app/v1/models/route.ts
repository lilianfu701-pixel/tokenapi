import { errorBody, toGatewayError } from "@/lib/gateway/errors";
import { toPublicModel } from "@/lib/gateway/models";
import { createNeonRepo } from "@/lib/gateway/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const aliases = await createNeonRepo().listPublicAliases();
    return Response.json({ object: "list", data: aliases.map((a) => toPublicModel(a)) });
  } catch (e) {
    console.error("[gateway] list models failed", e);
    const err = toGatewayError(e);
    return Response.json(errorBody(err), { status: err.status });
  }
}
