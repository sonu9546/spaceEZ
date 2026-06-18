import { AppToast } from './AppToast';

type TryCatchOptions = {
    showToast?: boolean;
    errorMessage?: string;
    onError?: (error: unknown) => void;
};

export async function tryCatchWrapper<T>(
    fn: () => Promise<T>,
    options?: TryCatchOptions
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        if (options?.showToast !== false) {
            const message =
                error instanceof Error
                    ? error.message || options?.errorMessage
                    : options?.errorMessage;

            AppToast('e', message || 'Something went wrong');
        }

        options?.onError?.(error);
        return null;
    }
}
