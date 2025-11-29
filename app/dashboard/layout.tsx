import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { BreadcrumbNav } from '@/components/breadcrumb-nav'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={session.user?.email || ''} userRole={session.user?.role || ''} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNav />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
