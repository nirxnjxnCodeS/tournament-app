// Passthrough — auth is handled by app/admin/(protected)/layout.tsx
// Login page lives here unprotected so requireAdmin() never wraps it.
export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
