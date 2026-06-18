import { useState, useCallback } from 'react';

let resetFlowState: { email?: string; token?: string; flow?: string } = {};

export const useResetFlow = () => {
  const [, setRefresh] = useState({});

  const setResetEmail = useCallback((email: string) => {
    resetFlowState.email = email;
    resetFlowState.flow = 'reset';
    setRefresh({});
  }, []);

  const setResetToken = useCallback((token: string) => {
    resetFlowState.token = token;
    setRefresh({});
  }, []);

  const getResetEmail = useCallback(() => resetFlowState.email, []);
  const getResetToken = useCallback(() => resetFlowState.token, []);
  const getFlow = useCallback(() => resetFlowState.flow, []);

  const clearResetFlow = useCallback(() => {
    resetFlowState = {};
    setRefresh({});
  }, []);

  return {
    setResetEmail,
    setResetToken,
    getResetEmail,
    getResetToken,
    getFlow,
    clearResetFlow,
    resetEmail: resetFlowState.email,
    resetToken: resetFlowState.token,
    flow: resetFlowState.flow,
  };
};
