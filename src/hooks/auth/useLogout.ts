'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/store/hooks';
import { logout } from '@/redux/features/auth/authSlice';
import { ROUTES } from '@/routerKeys';
import { removeAuthAction } from '@/actions/authActions';

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return async () => {
    // Clear auth cookie
    await removeAuthAction();

    // Clear Redux state
    dispatch(logout());

    // Redirect to login
    router.replace(ROUTES.WELCOME.WELCOME);
  };
}
