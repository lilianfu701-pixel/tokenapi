import { messagesFormat } from "@/lib/gateway/formats";
import { gatewayPost } from "@/lib/gateway/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export const POST = gatewayPost(messagesFormat);
