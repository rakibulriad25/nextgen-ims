import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-destructive/10 p-3 rounded-full">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Access Denied</h1>
              <p className="text-muted-foreground">
                You are not authorized to access this system. Only registered staff, managers, and
                administrators can sign in.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-md w-full">
              <p className="text-sm text-muted-foreground">
                If you believe you should have access, please contact your system administrator to
                get your account set up.
              </p>
            </div>
            <Link
              href="/login"
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
