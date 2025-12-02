'use client';

import { useEffect, useState } from 'react';
import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { LifeBuoy, Ribbon, Send } from 'lucide-react';
import { useUserContext } from '../app/main-layout/main-layout';

const data = {
  navSecondary: [
    { title: 'Support', url: '#', icon: LifeBuoy },
    { title: 'Feedback', url: '#', icon: Send }
  ]
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { users } = useUserContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // memastikan ini hanya jalan di client
  }, []);

  // ⚠ SSR tidak akan masuk block ini → aman dari hydration mismatch
  if (!mounted) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarContent />
        <SidebarFooter>
          <NavUser
            users={{
              email: 'loading',
              name: 'Loading',
              avatarFallback: 'GU'
            }}
          />
        </SidebarFooter>
      </Sidebar>
    );
  }

  const safeUser = {
    email: users?.email ?? 'no-email@example.com',
    name: users?.username ?? 'Guest User',
    avatarFallback: users?.username?.substring(0, 2).toUpperCase() ?? 'GU'
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="p-0">
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Ribbon className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="-ml-[0.1rem] truncate font-semibold">SIBANDES</span>
                  <span className="truncate text-xs">Sistem Informasi Bantuan Desa</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <NavProjects />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser users={safeUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
