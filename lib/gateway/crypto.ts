import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const KEY_PREFIX = "sk-tk-";

/** Client API key: shown once, only the hash is stored. */
export function generateApiKey() {
  const secret = randomBytes(24).toString("base64url");
  const key = `${KEY_PREFIX}${secret}`;
  return { key, hash: hashApiKey(key), prefix: key.slice(0, KEY_PREFIX.length + 6) };
}

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

function encryptionKey(raw = process.env.GATEWAY_ENCRYPTION_KEY): Buffer {
  if (!raw) throw new Error("GATEWAY_ENCRYPTION_KEY is not configured.");
  const buf = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error("GATEWAY_ENCRYPTION_KEY must be 32 bytes (64 hex chars or base64).");
  return buf;
}

/** AES-256-GCM. Output: base64(iv).base64(tag).base64(ciphertext) */
export function encryptSecret(plain: string, rawKey?: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(rawKey), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ct].map((b) => b.toString("base64")).join(".");
}

export function decryptSecret(payload: string, rawKey?: string) {
  const [iv, tag, ct] = payload.split(".").map((p) => Buffer.from(p, "base64"));
  if (!iv || !tag || !ct) throw new Error("Malformed encrypted secret.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(rawKey), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export function secretHint(plain: string) {
  return plain.length <= 4 ? "****" : `…${plain.slice(-4)}`;
}

export function newRequestId() {
  return `gen-${Date.now().toString(36)}-${randomBytes(8).toString("hex")}`;
}
