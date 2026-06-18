"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="authCard text-center max-w-xl w-full">
                {/* Error Code */}
                <p className="text-primary text-sm font-semibold mb-2">
                    404 ERROR
                </p>

                {/* Title */}
                <h1 className="blackText mb-3">
                    Page not found
                </h1>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-8">
                    Sorry, the page you are looking for doesn’t exist or has been moved.
                    Please check the URL or return to the homepage.
                </p>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                    >
                        Go to homepage
                    </Link>

                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-card transition"
                    >
                        Contact support
                    </Link>
                </div>
            </div>
        </div>
    );
}
