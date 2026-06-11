export function encodePayload(value: unknown) {
  return JSON.stringify(value);
}

export function decodePayload<T>(value: string) {
  return JSON.parse(value) as T;
}
