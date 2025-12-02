'use client';

import type { LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { MAIN_SIDEBAR_CONSTANTS } from '@/constants';

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform Main</SidebarGroupLabel>
      <SidebarMenu>
        {MAIN_SIDEBAR_CONSTANTS.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
