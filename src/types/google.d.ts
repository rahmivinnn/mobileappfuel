
interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: object) => void;
}

interface GoogleOAuthInitOptions {
  client_id: string;
  callback: (response: GoogleTokenResponse) => void;
  scope?: string;
  prompt?: string;
  error_callback?: (error: Error) => void;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GoogleOAuthInitOptions) => GoogleTokenClient;
        }
      }
    }
  }
}
