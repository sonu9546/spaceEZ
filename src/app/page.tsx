import { redirect } from 'next/navigation'
import { ROUTES } from '@/routerKeys'

export default function RootPage() {
  redirect(ROUTES.AUTH.LOGIN)
}
