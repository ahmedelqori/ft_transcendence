import { createAuthState } from "@/uccello/Uccello";

interface UserState {
  id?: number;
  bio?: string;
  avatar?: any;
  two_FA?: boolean;
  username?: string;
  createdAt?: string;
  last_name?: string;
  first_name?: string;
}

export const authState = createAuthState<UserState>();
