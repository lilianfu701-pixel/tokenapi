import { GatewayError, errorBody, toGatewayError } from "@/lib/gateway/errors";
import { toPublicModel } from "@/lib/gateway/models";
import { createNeonRepo } from "@/lib/gateway/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const aliases = await createNeonRepo().listPublicAliases();
    const found = aliases.find((a) => a.alias.alias === id);
    if (!found) throw new GatewayError(404, "model_not_found", `The model '${id}' does not exist.`);
    return Response.json(toPublicModel(found));
  } catch (e) {
    if (!(e instanceof GatewayError)) console.error("[gateway] retrieve model failed", e);
    const err = toGatewayError(e);
    return Response.json(errorBody(err), { status: err.status });
  }
}
