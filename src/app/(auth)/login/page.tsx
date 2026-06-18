import { generateSEO } from '@/lib/seo'
import { ROUTES } from '@/routerKeys'
import React from 'react'
import LoginForm from './LoginForm'


export const metadata = generateSEO({
  title: "Login",
  description: "Access your SpaceEZ dashboard securely.",
  path: ROUTES.AUTH.LOGIN,
  keywords: ["SpaceEZ login", "user login", "dashboard login"],
  image: "/og-image.png",
})

const LoginPage = () => {
  return (
    <LoginForm />
  )
}

export default LoginPage
