import { ReactNode } from "react"
import ProtectedShell from "./ProtectedShell"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>
}
