'use client';

import { ReactNode } from 'react';
import { AppLogo, ThemeSwitcher, AppContainer } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/routerKeys';
import { SHOW_THEME_SWITCHER } from '@/config';

export default function AuthLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    return (
        <AppContainer>
            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <header className="bg-card p-2 rounded-lg mt-4">
                    <div className="flex items-center justify-between">
                        <AppLogo onClick={() => { router.push(ROUTES.WELCOME.WELCOME) }} />
                        {SHOW_THEME_SWITCHER && <ThemeSwitcher />}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 flex items-center justify-center">
                    {children}
                </main>
            </div>
        </AppContainer>
    );
}
