export interface UserSession {
  user: {
    email: string;
    user_metadata: {
      full_name: string;
      is_host?: boolean;
    };
  };
}
