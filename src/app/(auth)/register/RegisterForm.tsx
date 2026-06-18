'use client'

import { useState } from 'react'
import { ROUTES } from '@/routerKeys'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Form } from 'antd'
import { useAppMutate } from '@/tanstack/useAppMutate'
import { tryCatchWrapper } from '@/utils/tryCatchWrapper'
import { storeRefresh, storeToken } from '@/redux/features/auth/authSlice'
import { ENDPOINTS } from '@/Endpoints'
import { MUTATION_KEYS } from '@/tanstack/keys'
import { ConfirmPasswordFormItem, EmailFormItem, PasswordFormItem } from '@/components/ui/forms/AppForm'
import logger from '@/utils/logger'
import Link from 'next/link'
import { AppButton } from '@/components/ui'
import { formatEmail, trimString } from '@/utils/formatting/string'
import { FadeIn, ScaleIn } from '@/components/animations'

export default function RegisterForm() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // register mutate
  const { mutateAsync: registerMutate, isPending } = useAppMutate({
    mutationKey: [MUTATION_KEYS.REGISTER],
    onSuccess(data: any) {
      dispatch(storeToken(data?.access_token))
      dispatch(storeRefresh(data?.refresh_token))
      dispatch(storeRefresh(data?.refresh_token))
      setLoading(false)
      logger.success('User registered successfully', data)
      router.push(ROUTES.PRIVATE.HOME)
    },
    onError(error: any) {
      setLoading(false)
      logger.error('Registration failed', error)
    },
  })

  // handle register
  const handleRegister = async (values: { email: string, password: string, confirmPassword: string }) => {
    setLoading(true)

    // Validate passwords match
    if (values.password !== values.confirmPassword) {
      logger.warn('Passwords do not match')
      setLoading(false)
      return
    }

    const user = {
      email: formatEmail(values.email),
      password: trimString(values.password),
    }

    logger.log('User registration initiated', user)

    await tryCatchWrapper(
      () =>
        registerMutate({
          url: ENDPOINTS.AUTH.REGISTER,
          method: 'POST',
          body: user,
        }),
      {
        errorMessage: 'Registration failed',
        showToast: true,
        onError(error) {
          logger.error('Registration error:', error)
          setLoading(false)
        },
      }
    )
  }

  return (
    <div className='w-full max-w-xl mx-auto'>
      <ScaleIn duration={0.5}>
        <div className="authCard">
          <FadeIn delay={0.2}>
            <Form
              layout="vertical"
              onFinish={handleRegister}
              disabled={loading || isPending}
              form={form}
            >
              <EmailFormItem
                name="email"
                required
                clearable
              />

              <PasswordFormItem
                name="password"
                required
                showStrength
              />

              <ConfirmPasswordFormItem
                name="confirmPassword"
                label="Confirm Password"
                required
                passwordFieldName="password"
              />

              <AppButton type="primary" htmlType="submit" isLoading={loading} block>
                Register
              </AppButton>

              <div className="mt-4 text-center">
                <span className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href={ROUTES.AUTH.LOGIN}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Login here
                  </Link>
                </span>
              </div>
            </Form>
          </FadeIn>
        </div>
      </ScaleIn>
    </div>
  )
}
