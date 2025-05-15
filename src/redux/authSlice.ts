// src/redux/authSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  // add any other user fields your API returns
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // called when login is successful
    login: (
      state,
      action: PayloadAction<{
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
    },
    // called when logging out
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
});

// these are the action creators you import elsewhere:
export const { login, logout } = authSlice.actions;

// this is what you plug into your store:
export default authSlice.reducer;
