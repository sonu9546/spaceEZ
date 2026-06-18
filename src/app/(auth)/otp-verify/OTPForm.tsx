"use client";

import { useState, useEffect } from "react";
import { ROUTES } from "@/routerKeys";
import { useRouter } from "next/navigation";
import { Form, Input } from "antd";
import { useAppMutate } from "@/tanstack/useAppMutate";
import { tryCatchWrapper } from "@/utils/tryCatchWrapper";
import { ENDPOINTS } from "@/Endpoints";
import { MUTATION_KEYS } from "@/tanstack/keys";
import logger from "@/utils/logger";
import { AppButton } from "@/components/ui";
import { useResetFlow } from "@/hooks/auth/useResetFlow";
import { formatEmail, trimString } from "@/utils/formatting/string";
import { FadeIn, ScaleIn } from "@/components/animations";

export default function OTPForm() {
  const router = useRouter();
  const { resetEmail, setResetToken, flow } = useResetFlow();
  const [loading, setLoading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState("");
  const [form] = Form.useForm();

  // verify otp mutate
  const { mutateAsync: verifyOTPMutate } = useAppMutate({
    mutationKey: [MUTATION_KEYS.VERIFY_OTP],
    onSuccess(data: any) {
      setLoading(false);
      logger.success("OTP verified successfully");
      // if this flow is part of password reset, navigate to reset password page
      if (flow === "reset") {
        const token = data?.token;
        if (token) {
          setResetToken(token);
        }
        router.push(ROUTES.AUTH.RESET_PASSWORD);
        return;
      }

      router.push(ROUTES.PRIVATE.HOME);
    },
    onError(error: any) {
      if (flow === "reset") {
        const token = error?.token || "TOKENNNN";
        if (token) {
          setResetToken(token);
        }
        router.push(ROUTES.AUTH.RESET_PASSWORD);
        return;
      }

      router.push(ROUTES.PRIVATE.HOME);
      setLoading(false);
      logger.error("Invalid OTP", error);
    },
  });

  // handle verify otp
  const handleVerifyOTP = async (values: { otp: string }) => {
    setLoading(true);

    await tryCatchWrapper(
      () =>
        verifyOTPMutate({
          url: ENDPOINTS.AUTH.VERIFY_OTP,
          method: "POST",
          body: {
            email: formatEmail(emailSubmitted),
            otp: trimString(values.otp),
          },
        }),
      {
        errorMessage: "Invalid OTP",
        showToast: true,
        onError() {
          setLoading(false);
        },
      },
    );
  };

  // set email submitted from reset flow
  useEffect(() => {
    // Check if coming from reset flow
    if (resetEmail && flow === "reset") {
      setEmailSubmitted(resetEmail);
    }
  }, [resetEmail, flow]);

  // Auto detect OTP
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("OTPCredential" in window)) return;

    const abortController = new AbortController();

    const detectOTP = async () => {
      try {
        const otp: any = await navigator.credentials.get({
          otp: { transport: ["sms"] },
          signal: abortController.signal,
        });
        logger.info("OTP auto-detected", otp);
        if (otp && "code" in otp) {
          form.setFieldsValue({ otp: otp.code });
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          logger.warn("OTP auto-detection failed", err);
        }
      }
    };

    detectOTP();
    return () => abortController.abort();
  }, [form]);

  return (
    <>
      <ScaleIn duration={0.5}>
        <div className="authCard">
          <FadeIn delay={0.2}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Verify OTP</h2>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to your email:{" "}
                <strong>{emailSubmitted}</strong>
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleVerifyOTP}
              disabled={loading}
            >
              <Form.Item
                label="OTP Code"
                name="otp"
                rules={[
                  { required: true, message: "Please enter OTP" },
                  { len: 6, message: "OTP must be 6 digits" },
                ]}
              >
                <Input
                  placeholder="000000"
                  maxLength={6}
                  className="tracking-widest text-center"
                  autoComplete="one-time-code"
                />
              </Form.Item>

              <AppButton
                type="primary"
                htmlType="submit"
                isLoading={loading}
                block
              >
                Verify OTP
              </AppButton>
            </Form>
          </FadeIn>
        </div>
      </ScaleIn>
    </>
  );
}
