import { GalleryVerticalEnd } from 'lucide-react'
import type { Metadata } from 'next'

import { LoginForm } from '@/components/login-form'

export const metadata: Metadata = {
  title: 'Login - NextGen IMS',
  description: 'Sign in to your NextGen IMS account to manage inventory, track stock, and access analytics.',
}

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          NextGEN IMS
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
