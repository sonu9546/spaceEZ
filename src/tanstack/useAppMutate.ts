'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/api';
import { ApiResponse } from '@/api/types';
import { AppToast } from '@/utils/AppToast';
import axios from 'axios';
import { useRef } from 'react';
import logger from '@/utils/logger';

export type AppMutationVariables = {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: unknown;
  skipLoader?: boolean;
};

interface UseAppMutateProps {
  mutationKey: string[];
  invalidateQueryKeys?: string | string[];

  showSuccessToast?: boolean;
  showErrorToast?: boolean;

  onSuccess?: (data: unknown, response: ApiResponse<unknown>) => void;
  onError?: (error: unknown) => void;
  onSettled?: (response?: ApiResponse<unknown>) => void;
}

export function useAppMutate({
  mutationKey,
  invalidateQueryKeys,
  showSuccessToast = true,
  showErrorToast = true,
  onSuccess,
  onError,
  onSettled,
}: UseAppMutateProps) {
  const queryClient = useQueryClient();

  // 🔑 Manual AbortController (this is required)
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation<ApiResponse<unknown>, unknown, AppMutationVariables>({
    mutationKey,

    mutationFn: async (variables) => {
      // Cancel previous request if still running
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;
      logger.log("variables", variables)

      return apiRequest<unknown, typeof variables.body>({
        url: variables.url,
        method: variables.method ?? 'POST',
        data: variables.body,
        params: variables.params,
        signal: controller.signal, // ✅ works with Axios v1+
        skipLoader: variables.skipLoader,
      });
    },

    onSuccess(response) {
      abortRef.current = null;

      const { status, data, message } = response;
      const isSuccess = status >= 200 && status < 300;

      if (isSuccess) {
        if (invalidateQueryKeys) {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(invalidateQueryKeys)
              ? invalidateQueryKeys
              : [invalidateQueryKeys],
          });
        }

        if (showSuccessToast && message) {
          AppToast('s', message);
        }

        onSuccess?.(data, response);
      } else {
        if (showErrorToast && message) {
          AppToast('e', message);
        }
        onError?.(response);
      }

      onSettled?.(response);
    },

    onError(error) {
      abortRef.current = null;

      // 🔕 Ignore cancellation errors
      if (axios.isCancel(error)) {
        return;
      }

      if (showErrorToast) {
        AppToast(
          'e',
          error instanceof Error ? error.message : 'Something went wrong'
        );
      }

      onError?.(error);
      onSettled?.();
    },
  });

  return {
    ...mutation,

    // ✅ Explicit cancel API
    cancel: () => {
      abortRef.current?.abort();
      abortRef.current = null;
      mutation.reset();
    },
  };
}
