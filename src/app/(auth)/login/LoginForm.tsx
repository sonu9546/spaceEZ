"use client";

import { useState } from "react";
import { ROUTES } from "@/routerKeys";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Form, Divider } from "antd";
import Link from "next/link";
import { storeRefresh, storeToken } from "@/redux/features/auth/authSlice";
import { QUERY_KEYS } from "@/tanstack/keys";
import { EmailFormItem, PasswordFormItem } from "@/components/ui/forms/AppForm";
import logger from "@/utils/logger";
import { AppButton } from "@/components/ui";
import { formatEmail, trimString } from "@/utils/formatting/string";
import { FadeIn, ScaleIn } from "@/components/animations";
import { useAppCache } from "@/tanstack/useAppCache";
import { setAuthAction } from "@/actions/authActions";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { setCache } = useAppCache();
  const [loading, setLoading] = useState(false);
  const isPending = false;

  // handle login
  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    const user = {
      password: trimString(values.password || ""),
      email: formatEmail(values.email || ""),
    };
    logger.log("Bypassing login with mock credentials", user);
    
    // Store mock credentials and profile info in state/cookies
    dispatch(storeToken("demo_access_token"));
    dispatch(storeRefresh("demo_refresh_token"));
    setCache([QUERY_KEYS.USER], {
      name: "John Smith",
      email: user.email || "admin@cityparkon.com",
      role: "City Administrator",
    });
    await setAuthAction("demo_access_token"); // Set auth cookie for middleware
    
    setLoading(false);
    router.push(ROUTES.PRIVATE.HOME);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <ScaleIn duration={0.5}>
        <div className="authCard">
          <FadeIn delay={0.2}>
            <Form
              layout="vertical"
              onFinish={handleLogin}
              disabled={loading || isPending}
            >
              <EmailFormItem name="email" hasRules={false} />

              <PasswordFormItem name="password" hasRules={false} />

              <AppButton
                type="primary"
                htmlType="submit"
                isLoading={loading || isPending}
                block
              >
                Login
              </AppButton>

              <Divider />

              {/* Links Section */}
              <div className="space-y-2">
                <div className="text-center">
                  <Link
                    href={ROUTES.AUTH.FORGOT_PASSWORD}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href={ROUTES.AUTH.REGISTER}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Register here
                    </Link>
                  </span>
                </div>
              </div>
            </Form>
          </FadeIn>
        </div>
      </ScaleIn>
    </div>
  );
}
