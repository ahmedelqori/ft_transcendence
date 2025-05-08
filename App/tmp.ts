// main.ts

import { createAuthState } from "./authState";

// Define the user shape at usage time (optional)
type MyUser = {
  id: string;
  name: string;
  token: string;
};

const auth = createAuthState<MyUser>();

auth.subscribe((state) => {
  console.log("Auth changed:", state);
});

auth.setState({
  isAuthenticated: true,
  user: {
    id: "1",
    name: "Ahmed",
    token: "abc.def.ghi",
  },
});
