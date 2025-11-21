import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import type {LayoutProps} from 'sanity'

import {fotowareConfig} from './fotowareConfig'
import {generatePkcePair, generateState} from './fotowarePkce'

const TOKEN_STORAGE_KEY = 'fotoware_auth'
const PKCE_STORAGE_KEY = 'fotoware_pkce'

type AuthStatus = 'unknown' | 'unauthenticated' | 'authenticated'

type AuthState = {
  status: AuthStatus
  accessToken?: string
  expiresAt?: number
  login: () => void
  logout: () => void
}

const FotowareAuthContext = createContext<AuthState | undefined>(undefined)

type StoredToken = {
  accessToken: string
  expiresAt: number
}

type StoredPkce = {
  codeVerifier: string
  state: string
}

function loadStoredToken(): StoredToken | null {
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredToken
    if (!parsed.accessToken || !parsed.expiresAt) return null
    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveStoredToken(token: StoredToken) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token))
}

function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function savePkce(pkce: StoredPkce) {
  window.sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(pkce))
}

function loadPkce(): StoredPkce | null {
  try {
    const raw = window.sessionStorage.getItem(PKCE_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredPkce
  } catch {
    return null
  }
}

function clearPkce() {
  window.sessionStorage.removeItem(PKCE_STORAGE_KEY)
}

export function FotowareAuthProvider(props: LayoutProps) {
  const [state, setState] = useState<AuthState>({
    status: 'unknown',
    login: () => {},
    logout: () => {},
  })

  const logout = useCallback(() => {
    clearStoredToken()
    setState((prev) => ({
      status: 'unauthenticated',
      login: prev.login ?? (() => {}),
      logout,
    }))
  }, [])

  const login = useCallback(async () => {
    const {fotowareBaseUrl, clientId, redirectUri, scope} = fotowareConfig

    const {codeVerifier, codeChallenge} = await generatePkcePair()
    const stateValue = generateState()

    savePkce({codeVerifier, state: stateValue})

    const authorizeUrl = new URL('/fotoweb/oauth2/authorize', fotowareBaseUrl)
    authorizeUrl.searchParams.set('response_type', 'code')
    authorizeUrl.searchParams.set('client_id', clientId)
    authorizeUrl.searchParams.set('redirect_uri', redirectUri)
    authorizeUrl.searchParams.set('scope', scope)
    authorizeUrl.searchParams.set('state', stateValue)
    authorizeUrl.searchParams.set('code_challenge', codeChallenge)
    authorizeUrl.searchParams.set('code_challenge_method', 'S256')

    window.location.href = authorizeUrl.toString()
  }, [])

  // On first load: either complete the code → token exchange or load cached token
  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const returnedState = url.searchParams.get('state')

    async function exchangeCodeForToken(authCode: string, stateParam: string) {
      const pkce = loadPkce()
      if (!pkce || pkce.state !== stateParam) {
        console.error('Invalid or missing PKCE state')
        clearPkce()
        setState({status: 'unauthenticated', login, logout})
        return
      }

      clearPkce()

      try {
        const tokenUrl = new URL('/fotoweb/oauth2/token', fotowareConfig.fotowareBaseUrl)

        const body = new URLSearchParams()
        body.set('grant_type', 'authorization_code')
        body.set('client_id', fotowareConfig.clientId)
        body.set('code', authCode)
        body.set('redirect_uri', fotowareConfig.redirectUri)
        body.set('code_verifier', pkce.codeVerifier)

        const res = await fetch(tokenUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: body.toString(),
        })

        if (!res.ok) {
          console.error('Fotoware token exchange failed', res.status)
          setState({status: 'unauthenticated', login, logout})
          return
        }

        const data = await res.json()
        const accessToken = data.access_token as string
        const expiresIn = Number(data.expires_in ?? 3600)

        const expiresAt = Date.now() + expiresIn * 1000
        saveStoredToken({accessToken, expiresAt})

        // Clean ?code=&state= from URL
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        window.history.replaceState({}, document.title, url.toString())

        setState({
          status: 'authenticated',
          accessToken,
          expiresAt,
          login,
          logout,
        })
      } catch (e) {
        console.error('Fotoware token request error', e)
        setState({status: 'unauthenticated', login, logout})
      }
    }

    if (code && returnedState) {
      // We just came back from Fotoware
      exchangeCodeForToken(code, returnedState)
      return
    }

    // No code in URL – fall back to stored token
    const stored = loadStoredToken()
    if (stored) {
      setState({
        status: 'authenticated',
        accessToken: stored.accessToken,
        expiresAt: stored.expiresAt,
        login,
        logout,
      })
    } else {
      setState({status: 'unauthenticated', login, logout})
    }
  }, [login, logout])

  const value = useMemo(() => state, [state])

  return (
    <FotowareAuthContext.Provider value={value}>
      {props.renderDefault(props)}
    </FotowareAuthContext.Provider>
  )
}

export function useFotowareAuth(): AuthState {
  const ctx = useContext(FotowareAuthContext)
  if (!ctx) throw new Error('useFotowareAuth must be used within FotowareAuthProvider')
  return ctx
}
