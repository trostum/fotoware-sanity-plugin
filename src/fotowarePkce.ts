// fotowarePkce.ts
function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export async function generatePkcePair() {
  // 43–128 chars, allowed charset
  const verifierLength = 64
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let codeVerifier = ''
  const random = new Uint8Array(verifierLength)
  crypto.getRandomValues(random)
  for (let i = 0; i < verifierLength; i++) {
    codeVerifier += charset[random[i] % charset.length]
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const codeChallenge = base64UrlEncode(hash)

  return {codeVerifier, codeChallenge}
}

export function generateState(): string {
  return crypto.randomUUID()
}
