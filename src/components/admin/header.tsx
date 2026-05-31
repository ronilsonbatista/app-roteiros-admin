'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from './sidebar';
import { useUser } from '@/app/(admin)/layout';
import { deleteCookie } from '@/lib/cookies';

export default function Header() {
  const router = useRouter();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const userName = user?.name || 'Administrador';
  const userEmail = user?.email || 'admin@roteiros.com';

  const handleLogout = () => {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Mobile Menu trigger & Sidebar overlay */}
      <div className="flex items-center gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:text-slate-800">
                <Menu className="w-5 h-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 bg-[#001F5B] border-r border-[#001F5B]/10">
            <Sidebar onItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <h2 className="hidden md:block text-sm font-semibold text-slate-600">
          Painel Administrativo
        </h2>
        <div className="md:hidden flex items-center gap-2">
          <Image
            src="/brand/logo-2go.png"
            alt="Logo 2GO Roteiros"
            width={80}
            height={24}
            className="h-auto w-auto object-contain max-h-6 rounded"
          />
        </div>
      </div>

      {/* User profile actions */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200 text-left focus:outline-none cursor-pointer">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 text-[#001F5B]">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{userName}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">{userEmail}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-700 shadow-lg">
            <DropdownMenuLabel className="text-xs font-semibold text-slate-400">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="focus:bg-slate-50 focus:text-slate-900 cursor-not-allowed text-xs py-2 text-slate-400">
              Meu Perfil (Breve)
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-slate-50 focus:text-slate-900 cursor-not-allowed text-xs py-2 text-slate-400">
              Segurança (Breve)
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer text-xs py-2"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sair da Conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
