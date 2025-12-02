'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Cookie from 'js-cookie';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Users } from '../api/auth/signup/type';

type MainLayoutProps = {
  children: React.ReactNode;
};

type GlobalContextData = {
  users?: Users | null;
};

const GlobalContext = createContext<GlobalContextData>({ users: null });
export const useUserContext = () => useContext(GlobalContext);

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [users, setUsers] = useState<Users | null>(null);

  useEffect(() => {
    const raw = Cookie.get('user');
    if (!raw || raw === 'undefined') return;

    try {
      setUsers(JSON.parse(raw));
    } catch (err) {
      console.warn('Cookie user corrupted:', err);
      console.log("RAW COOKIE USER:", raw);
      setUsers(null);
    }
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <GlobalContext.Provider value={{ users }}>
        <AppSidebar />
        <SidebarInset>
          <header className='h-12 flex shrink-0 items-center gap-2'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              <BreadcrumbSeparator className='hidden md:block' />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className='hidden md:block'>
                    <BreadcrumbLink href='/'>Sistem Informasi Bantuan Desa</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className='px-4 pb-4'>{children}</div>
        </SidebarInset>
      </GlobalContext.Provider>
    </SidebarProvider>
  );
};
