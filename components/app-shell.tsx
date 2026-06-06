import { Suspense, type CSSProperties } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { RoleGate } from "@/components/role-gate";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
    <RoleGate>
    <SidebarProvider
      style={
        {
          "--sidebar-width": "12.5rem",
          "--sidebar-width-icon": "2.75rem",
        } as CSSProperties
      }
    >
      <div className="flex min-h-svh w-full bg-black">
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <SidebarInset className="bg-black">
          <div className="sticky top-0 z-40 flex h-12 items-center border-b border-[#2f3336] bg-black/90 px-4 backdrop-blur-md md:hidden print:hidden">
            <SidebarTrigger className="text-white" />
          </div>
          <main className="flex-1 px-4 py-6 md:px-6 xl:px-8 2xl:px-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </RoleGate>
    </AuthProvider>
  );
}
