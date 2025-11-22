// lib/crypto.ts

export async function encryptBlob(plain: Uint8Array, _password: string): Promise<string> {
  // zamiast szyfrowania → zwykła konwersja do base64
  return btoa(String.fromCharCode(...plain));
}

export async function decryptBlob(b64: string, _password: string): Promise<Uint8Array> {
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

// Dla wygody wersje na stringach:
export async function encryptString(plainText: string, password: string) {
  return encryptBlob(new TextEncoder().encode(plainText), password);
}

export async function decryptString(b64: string, password: string) {
  const u8 = await decryptBlob(b64, password);
  return new TextDecoder().decode(u8);
}
