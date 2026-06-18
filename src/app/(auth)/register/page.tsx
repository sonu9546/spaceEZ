import React from 'react'
import RegisterForm from './RegisterForm'
import { generateSEO } from '@/lib/seo'
import { ROUTES } from '@/routerKeys'

export const metadata = generateSEO({
  title: "Register",
  description: "Access your SpaceEZ dashboard securely.",
  path: ROUTES.AUTH.REGISTER,
  keywords: ["SpaceEZ register", "user register"],
  image: "/images/logo.png",
})

const Register = () => {
  return (
    <RegisterForm />
  )
}

export default Register