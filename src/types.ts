export interface UserSession {
  user: {
    /** Firebase UID */
    id?: string;
    email: string;
    user_metadata: {
      full_name: string;
      is_host?: boolean;
      avatar_url?: string;
    };
  };
}
