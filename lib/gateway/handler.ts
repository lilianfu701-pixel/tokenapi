import { handleGatewayRequest, type InboundFormat } from "./pipeline";
import { createNeonRepo } from "./repo";

/** Route-handler factory shared by /v1/chat/completions, /v1/responses, /v1/messages. */
export function gatewayPost(format: InboundFormat) {
  return (request: Request) => handleGatewayRequest(request, format, { repo: createNeonRepo() });
}
