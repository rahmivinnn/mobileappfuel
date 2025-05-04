
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
  prompt?: string;  // This enables the account selection with 'select_account'
  error_callback?: (error: Error) => void;
}

interface GoogleCredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

interface GoogleCodeClient {
  requestCode: () => void;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (input: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            context?: string;
            auto_select?: boolean;
          }) => void;
          prompt: (callback: (notification: PromptMomentNotification) => void) => void;
          renderButton: (element: HTMLElement, options: object) => void;
        },
        oauth2: {
          initTokenClient: (config: GoogleOAuthInitOptions) => GoogleTokenClient;
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { code: string }) => void;
          }) => GoogleCodeClient;
        }
      }
    }
  }
}

export {};
