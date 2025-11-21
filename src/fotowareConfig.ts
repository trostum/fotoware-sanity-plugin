export type FotowareConfig = {
  fotowareBaseUrl: string
  clientId: string
  redirectUri: string
  scope: string
}

function requiredEnv(name: string): string {
  const value = import.meta.env[name] as string | undefined
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const baseUrl = requiredEnv('SANITY_STUDIO_FOTOWARE_BASE_URL').replace(/\/$/, '')

export const fotowareConfig: FotowareConfig = {
  fotowareBaseUrl: baseUrl,
  clientId: requiredEnv('SANITY_STUDIO_FOTOWARE_CLIENT_ID'),
  redirectUri: requiredEnv('SANITY_STUDIO_FOTOWARE_REDIRECT_URI'),
  scope: 'fotoweb.me',
}
