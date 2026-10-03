import { anthropicErrorBody, errorBody } from "../errors";
import type { InboundFormat } from "../pipeline";
import { AnthropicStreamEncoder, anthropicRequestToChat, completionToAnthropicMessage } from "./anthropic";
import { ChatStreamEncoder, chatRequestFromBody, wantsStreamUsage } from "./chat";
import { ResponsesStreamEncoder, completionToResponse, responsesRequestToChatWithHooks } from "./responses";
import { GatewayError } from "../errors";

export const chatCompletionsFormat: InboundFormat = {
  endpoint: "chat.completions",
  toChat: chatRequestFromBody,
  render: (completion) => completion,
  encoder: (id, model, created, body) => new ChatStreamEncoder(id, model, created, wantsStreamUsage(body)),
  errorBody,
};

export const responsesFormat: InboundFormat = {
  endpoint: "responses",
  // Pass ResponsesHooks here once a response store / built-in tool runtime exists.
  toChat: (body) => responsesRequestToChatWithHooks(body),
  render: (completion, body) => completionToResponse(completion, body),
  encoder: (id, model, created, body) => new ResponsesStreamEncoder(id, model, created, body),
  errorBody,
};

export const messagesFormat: InboundFormat = {
  endpoint: "messages",
  toChat: (body) => {
    try {
      return anthropicRequestToChat(body);
    } catch (e) {
      throw new GatewayError(400, "invalid_request", (e as Error).message);
    }
  },
  render: (completion) => completionToAnthropicMessage(completion),
  encoder: (id, model) => new AnthropicStreamEncoder(id, model),
  errorBody: anthropicErrorBody,
};
