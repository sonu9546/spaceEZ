'use client';

import { useQueryClient, QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * A reusable hook for managing TanStack Query cache operations.
 * Provides abstracted methods for setting, getting, and removing query data.
 */
export function useAppCache() {
    const queryClient = useQueryClient();

    /**
     * Sets data in the cache for a specific query key.
     */
    const setCache = useCallback(
        <TData>(key: QueryKey, data: TData) => {
            queryClient.setQueryData(key, data);
        },
        [queryClient]
    );

    /**
     * Retrieves data from the cache for a specific query key.
     */
    const getCache = useCallback(
        <TData>(key: QueryKey): TData | undefined => {
            return queryClient.getQueryData<TData>(key);
        },
        [queryClient]
    );

    /**
     * Removes/Invalidates queries for a specific key.
     */
    const removeCache = useCallback(
        (key: QueryKey) => {
            queryClient.removeQueries({ queryKey: key });
        },
        [queryClient]
    );

    /**
     * Invalidates queries for a specific key to trigger a refetch.
     */
    const invalidateCache = useCallback(
        (key: QueryKey) => {
            queryClient.invalidateQueries({ queryKey: key });
        },
        [queryClient]
    );

    return {
        setCache,
        getCache,
        removeCache,
        invalidateCache,
        queryClient, // Expose original client if needed
    };
}
