"use client";

import React from "react";
import { Form, Divider } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/routerKeys";
import { ENDPOINTS } from "@/Endpoints";
import { MUTATION_KEYS } from "@/tanstack/keys";
import { useAppMutate } from "@/tanstack/useAppMutate";
import { tryCatchWrapper } from "@/utils/tryCatchWrapper";
import logger from "@/utils/logger";

import { EmailFormItem } from "@/components/ui/forms/AppForm";
import { AppButton } from "@/components/ui";
import { useResetFlow } from "@/hooks/auth/useResetFlow";
import { formatEmail } from "@/utils/formatting/string";
import { FadeIn, ScaleIn } from "@/components/animations";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { setResetEmail } = useResetFlow();

  // forgot password mutate
  const { mutateAsync: forgotPasswordMutate, isPending } = useAppMutate({
    mutationKey: [MUTATION_KEYS.FORGOT_PASSWORD],

    onSuccess(data: any) {
      logger.success("Password reset link sent to email", {
        email: data?.email,
      });

      // Store email in hook state and navigate to OTP
      const resetEmail = data?.email || "";
      setResetEmail(resetEmail);
      router.push(ROUTES.AUTH.VERIFY_OTP);
    },

    onError(error: unknown) {
      // Email stored from form submission, navigate to OTP for testing
      router.push(ROUTES.AUTH.VERIFY_OTP);
      if (error instanceof Error) {
        logger.error("Failed to send reset link", error);
      } else {
        logger.warn("Failed to send reset link", error);
      }
    },
  });

  // handle forgot password
  const handleForgotPassword = async (values: { email: string }) => {
    setResetEmail(values.email);
    logger.info("Forgot password request initiated", {
      email: values.email,
    });

    await tryCatchWrapper(
      () =>
        forgotPasswordMutate({
          url: ENDPOINTS.AUTH.FORGOT_PASSWORD,
          method: "POST",
          body: { email: formatEmail(values.email) },
        }),
      {
        errorMessage: "Failed to process forgot password request",
        showToast: true,
        onError(error) {
          if (error instanceof Error) {
            logger.error("Forgot password request failed", error);
          } else {
            logger.warn("Forgot password request failed", error);
          }
        },
      },
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <ScaleIn duration={0.5}>
        <div className="authCard">
          <FadeIn delay={0.2}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Forgot Password?</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we’ll send you a reset link.
              </p>
            </div>
            <Form
              layout="vertical"
              onFinish={handleForgotPassword}
              disabled={isPending}
            >
              <EmailFormItem name="email" required clearable />

              <AppButton
                type="primary"
                htmlType="submit"
                isLoading={isPending}
                block
              >
                Continue
              </AppButton>

              <Divider />

              <div className="text-center">
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </Form>
          </FadeIn>
        </div>
      </ScaleIn>
    </div>
  );
}
