import React from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/ui/app-sidebar";
import { MobileNav } from "./MobileNavBar";

export function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar className="h-screen" />
        </div>

        {/* Mobile Top Navigation */}
        <MobileNav />

        {/* Main Content - adjusted for mobile top nav */}
        <main className="flex-1 overflow-auto w-full md:w-auto">
          <div className="md:p-0 pt-14 md:pt-0">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
