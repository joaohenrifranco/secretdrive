export class GoogleAuth {
  static access_token: string | null
  static tokenClient: google.accounts.oauth2.TokenClient | null
  static client: typeof gapi.client | null
  static onTokenChange: (token: string) => void

  static revokeToken() {
    if (!GoogleAuth.access_token) {
      throw new Error('[GoogleAuth] No access token available')
    }

    google.accounts.oauth2.revoke(GoogleAuth.access_token, () =>
      console.info('[GoogleAuth] Token revoked')
    )
    GoogleAuth.access_token = null
    this.removeStoredToken()
  }

  static requestToken() {
    GoogleAuth.tokenClient?.requestAccessToken()
  }

  static async initClient() {
    if (!google || !google.accounts || !google.accounts.oauth2) {
      throw new Error('[GoogleAuth] Google API not loaded')
    }

    GoogleAuth.loadStoredToken()

    GoogleAuth.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: '1028248986339-5tvr5e00e160ckqj5vuka7dokr3ipjol.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive.file',
      prompt: 'consent',
      callback: this.handleTokenResponse
    })
  }

  private static handleTokenResponse(response: google.accounts.oauth2.TokenResponse) {
    GoogleAuth.access_token = response.access_token
    localStorage.setItem('access_token', response.access_token)
    GoogleAuth.onTokenChange(response.access_token)
    console.info('[GoogleAuth] Access token received and saved')
  }

  private static removeStoredToken() {
    localStorage.removeItem('access_token')
    console.info('[GoogleAuth] Token removed from storage')
  }

  private static loadStoredToken() {
    const token = localStorage.getItem('access_token')
    if (token) {
      console.info('[GoogleAuth] Stored token loaded')
      GoogleAuth.access_token = token
      gapi.client.setToken({ access_token: token })
      GoogleAuth.onTokenChange(token)
    }
    console.info('[GoogleAuth] Stored token not found')
  }
}
