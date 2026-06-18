"use client";

import { useState, useEffect } from "react";
import { ROUTES } from "@/routerKeys";
import { useRouter } from "next/navigation";
import { Form, Divider, Modal } from "antd";
import Link from "next/link";
import { useAppMutate } from "@/tanstack/useAppMutate";
import { tryCatchWrapper } from "@/utils/tryCatchWrapper";
import { ENDPOINTS } from "@/Endpoints";
import { MUTATION_KEYS } from "@/tanstack/keys";
import {
  PasswordFormItem,
  ConfirmPasswordFormItem,
} from "@/components/ui/forms/AppForm";
import logger from "@/utils/logger";
import { AppButton } from "@/components/ui";
import { useResetFlow } from "@/hooks/auth/useResetFlow";
import { FadeIn, ScaleIn } from "@/components/animations";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { resetToken, clearResetFlow } = useResetFlow();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // reset mutate
  const { mutateAsync: resetPasswordMutate, isPending } = useAppMutate({
    mutationKey: [MUTATION_KEYS.RESET_PASSWORD],
    onSuccess(_data: any) {
      setLoading(false);
      logger.success("Password reset successfully");

      // Clear reset flow state
      clearResetFlow();

      Modal.success({
        title: "Password Reset Successful",
        content: "Your password has been reset. Redirecting to login...",
        onOk() {
          router.push(ROUTES.AUTH.LOGIN);
        },
      });

      // fallback redirect in case user doesn't click OK
      setTimeout(() => router.push(ROUTES.AUTH.LOGIN), 1500);
    },
    onError(error: any) {
      // Clear reset flow state
      clearResetFlow();

      Modal.success({
        title: "Password Reset Successful",
        content: "Your password has been reset. Redirecting to login...",
        onOk() {
          router.push(ROUTES.AUTH.LOGIN);
        },
      });

      // fallback redirect in case user doesn't click OK
      setTimeout(() => router.push(ROUTES.AUTH.LOGIN), 1500);
      setLoading(false);
      logger.error("Failed to reset password", error);
    },
  });

  // handle reset password
  const handleResetPassword = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);

    if (!token) {
      logger.error("Invalid reset link", "No token provided");
      setLoading(false);
      return;
    }

    logger.log("Password reset initiated");

    await tryCatchWrapper(
      () =>
        resetPasswordMutate({
          url: ENDPOINTS.AUTH.RESET_PASSWORD,
          method: "POST",
          body: {
            token,
            password: values.password,
          },
        }),
      {
        errorMessage: "Failed to reset password",
        showToast: true,
        onError(error) {
          logger.error("Password reset error:", error);
          setLoading(false);
        },
      },
    );
  };

  // useEffect to get token from hook state
  useEffect(() => {
    // Get token from hook state
    if (resetToken) {
      setToken(resetToken);
    }
  }, [resetToken]);

  // if no token, show invalid reset link
  if (!token) {
    return (
      <div className="authCard">
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold text-red-600">
            Invalid Reset Link
          </div>
          <p className="text-muted-foreground">
            The password reset link is invalid or has expired. Please request a
            new one.
          </p>

          <Divider />

          <Link
            href={ROUTES.AUTH.FORGOT_PASSWORD}
            className="inline-block text-primary hover:text-primary/80 font-medium"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <ScaleIn duration={0.5}>
        <div className="authCard">
          <FadeIn delay={0.2}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
              <p className="text-sm text-muted-foreground">
                Enter a new password to reset your account.
              </p>
            </div>

            <Form
              layout="vertical"
              onFinish={handleResetPassword}
              disabled={loading || isPending}
              form={form}
            >
              <PasswordFormItem
                name="password"
                label="New Password"
                required
                showStrength
              />

              <ConfirmPasswordFormItem
                name="confirmPassword"
                label="Confirm Password"
                required
                passwordFieldName="password"
              />

              <AppButton
                type="primary"
                htmlType="submit"
                isLoading={loading || isPending}
                block
              >
                Reset Password
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
