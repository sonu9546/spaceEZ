import { RootState, store } from './store';

export const getAccessToken = () => {
  const state = store.getState() as RootState;
  return state.auth.accessToken;
};
