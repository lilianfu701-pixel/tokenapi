import { usdToMicrousd } from "@/lib/gateway/pricing";

// Small, strict FormData readers for admin server actions.

export class FormInputError extends Error {}

export function str(form: FormData, name: string, opts: { required?: boolean; max?: number } = {}) {
  const raw = form.get(name);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (opts.required && !value) throw new FormInputError(`${name} is required.`);
  if (value.length > (opts.max ?? 500)) throw new FormInputError(`${name} is too long.`);
  return value;
}

export function optStr(form: FormData, name: string, max = 500) {
  return str(form, name, { max }) || null;
}

export function num(form: FormData, name: string, opts: { min?: number; max?: number; required?: boolean } = {}) {
  const value = str(form, name, { required: opts.required, max: 40 });
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new FormInputError(`${name} must be a number.`);
  if (opts.min != null && n < opts.min) throw new FormInputError(`${name} must be ≥ ${opts.min}.`);
  if (opts.max != null && n > opts.max) throw new FormInputError(`${name} must be ≤ ${opts.max}.`);
  return n;
}

export function bool(form: FormData, name: string) {
  return form.get(name) === "on" || form.get(name) === "true";
}

const SLUG = /^[a-z0-9][a-z0-9._:/-]{0,79}$/;
export function slug(form: FormData, name: string) {
  const value = str(form, name, { required: true, max: 80 }).toLowerCase();
  if (!SLUG.test(value)) throw new FormInputError(`${name} may only contain a-z 0-9 . _ : / -`);
  return value;
}

export function httpsUrl(value: string, name: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new FormInputError(`${name} must be a valid URL.`);
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) throw new FormInputError(`${name} must use https.`);
  return value.replace(/\/+$/, "");
}

export function uuidOrNull(form: FormData, name: string) {
  const value = str(form, name, { max: 40 });
  if (!value) return null;
  if (!/^[0-9a-f-]{36}$/i.test(value)) throw new FormInputError(`${name} is not a valid id.`);
  return value;
}

/** "provider::provider_model" from a <select> */
export function routeValue(form: FormData, name: string) {
  const value = str(form, name, { required: true, max: 300 });
  const [provider, providerModel] = value.split("::");
  if (!provider || !providerModel) throw new FormInputError(`${name} is invalid.`);
  return { provider, providerModel };
}

/** USD amount -> integer microusd, parsed from the decimal string (no float math). */
export function usd(form: FormData, name: string, opts: { required?: boolean; allowNegative?: boolean; maxUsd?: number } = {}) {
  const value = str(form, name, { required: opts.required, max: 30 });
  if (!value) return null;
  let micro: number;
  try {
    micro = usdToMicrousd(value);
  } catch {
    throw new FormInputError(`${name} must be a USD amount with at most 6 decimals.`);
  }
  if (!opts.allowNegative && micro < 0) throw new FormInputError(`${name} must not be negative.`);
  if (Math.abs(micro) > (opts.maxUsd ?? 1_000_000) * 1_000_000) throw new FormInputError(`${name} is too large.`);
  return micro;
}
