'use client';

import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { apiRequest } from '@/api/api';
import { ApiResponse } from '@/api/types';
import { AppToast } from '@/utils/AppToast';
import axios from 'axios';
import logger from '@/utils/logger';

export interface UseAppQueryProps<TData = any, TError = any> {
    queryKey: QueryKey;
    url: string;
    params?: Record<string, any>;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    options?: Omit<UseQueryOptions<ApiResponse<TData>, TError, TData>, 'queryKey' | 'queryFn'>;
}

/**
 * An enriched query hook that handles API calls, notifications, and data extraction.
 * 
 * @param queryKey - The unique key for the query.
 * @param url - The API endpoint URL.
 * @param params - Optional query parameters.
 * @param showErrorToast - Whether to show a toast message on error (default: true).
 * @param showSuccessToast - Whether to show a toast message on success (default: false).
 * @param options - Standard TanStack Query options.
 */
export function useAppQuery<TData = any, TError = any>({
    queryKey,
    url,
    params,
    showErrorToast = true,
    showSuccessToast = false,
    options,
}: UseAppQueryProps<TData, TError>) {
    return useQuery<ApiResponse<TData>, TError, TData>({
        queryKey,
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
            try {
                const response = await apiRequest<TData, undefined>({
                    url,
                    method: 'GET',
                    params,
                    signal,
                });

                const { status, message } = response;
                const isSuccess = status >= 200 && status < 300;

                if (isSuccess) {
                    if (showSuccessToast && message) {
                        AppToast('s', message);
                    }
                    return response;
                } else {
                    const errorMsg = message || 'An error occurred';
                    if (showErrorToast) {
                        AppToast('e', errorMsg);
                    }
                    throw new Error(errorMsg);
                }
            } catch (error: any) {
                if (axios.isCancel(error)) {
                    throw error;
                }

                const errorMsg = error?.response?.data?.message || error?.message || 'Something went wrong';

                if (showErrorToast && !axios.isCancel(error)) {
                    AppToast('e', errorMsg);
                }

                logger.error(`Query Error [${url}]:`, error);
                throw error;
            }
        },
        // select: (response) => response.data, // This would extract data directly
        ...options,
    } as any); // Type cast due to complex TanStack type mappings in generic wrappers
}
