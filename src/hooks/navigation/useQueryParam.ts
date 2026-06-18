"use client";

import { useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export interface UseQueryParamOptions<T = string> {
    key: string;
    defaultValue?: T;
}

export interface UseQueryParamReturn<T = string> {
    currentValue: T | null;
    allParams: Record<string, string>;
    setSearchParams: (params: Record<string, string | null | undefined>) => void;
}

export function useQueryParam<T = string>(
    options: UseQueryParamOptions<T>
): UseQueryParamReturn<T> {
    const { key, defaultValue } = options;

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // get value
    const rawValue = searchParams.get(key);
    const currentValue = (rawValue ?? defaultValue ?? null) as T | null;

    // get all params
    const allParams: Record<string, string> = {};
    searchParams.forEach((v, k) => (allParams[k] = v));

    // update params
    const setSearchParams = useCallback(
        (params: Record<string, string | null | undefined>) => {
            const newParams = new URLSearchParams(searchParams);

            Object.entries(params).forEach(([k, v]) => {
                if (v == null || v === "") {
                    newParams.delete(k);
                } else {
                    newParams.set(k, v);
                }
            });

            router.replace(`${pathname}?${newParams.toString()}`);
        },
        [pathname, router, searchParams]
    );

    return { currentValue, allParams, setSearchParams };
}


/*
    * Way To USE *
    const { value, allParams, setSearchParams } = useQueryParam({
        key: "tab",
        defaultValue: "users",
    });
*/ 