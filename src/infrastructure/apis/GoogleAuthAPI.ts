export type TokenData = {
  access_token: string;
  expires_at: number;
};

export class GoogleAuthAPI {
  static access_token: string | null;
  static tokenClient: google.accounts.oauth2.TokenClient | null;
  static client: typeof gapi.client | null;
  static onTokenChange: (tokenData: TokenData) => void;

  static revokeToken() {
    if (!GoogleAuthAPI.access_token) {
      throw new Error('[GoogleAuthAPI] No access token available');
    }

    google.accounts.oauth2.revoke(GoogleAuthAPI.access_token, () =>
      console.info('[GoogleAuthAPI] Token revoked'),
    );
    GoogleAuthAPI.access_token = null;
  }

  static requestToken(prompt: 'none' | 'consent') {
    GoogleAuthAPI.tokenClient?.requestAccessToken({ prompt });
  }

  static async initClient(token: string | null) {
    if (!google || !google.accounts || !google.accounts.oauth2) {
      throw new Error('[GoogleAuthAPI] Google API not loaded');
    }

    if (token) {
      GoogleAuthAPI.access_token = token;
      gapi.client.setToken({ access_token: token });
      console.info('[GoogleAuthAPI] Stored token loaded');
      return;
    }

    console.info('[GoogleAuthAPI] Creating token client');
    GoogleAuthAPI.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: '1028248986339-5tvr5e00e160ckqj5vuka7dokr3ipjol.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive',
      prompt: 'consent',
      callback: this.handleTokenResponse,
    });
  }

  private static handleTokenResponse(tokenResponse: google.accounts.oauth2.TokenResponse) {
    GoogleAuthAPI.access_token = tokenResponse.access_token;
    GoogleAuthAPI.onTokenChange({
      access_token: tokenResponse.access_token,
      expires_at: new Date().getTime() + parseInt(tokenResponse.expires_in, 10) * 1000,
    });
    console.info('[GoogleAuthAPI] Token response received');
  }
}
