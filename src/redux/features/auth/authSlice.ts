import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Update access token (e.g. after refresh)
     */
    storeToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      document.cookie = `auth=true; path=/;`;
    },

    /**
     * Update refresh token if backend rotates it
     */
    storeRefresh(state, action: PayloadAction<string>) {
      state.refreshToken = action.payload;
    },

    /**
     * Clear all auth data
     */
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      document.cookie = "auth=; path=/; max-age=0;"
    },
  },
});

export const {
  storeToken,
  storeRefresh,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
