'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Menu, 
  User, 
  LogOut, 
  ChevronDown, 
  Search, 
  X, 
  Users, 
  Map, 
  CreditCard, 
  FileText, 
  BookOpen,
  Loader2,
  ShieldAlert,
  Bell
} from 'lucide-react';
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
import { executeGlobalSearch, GlobalSearchResult } from '@/services/system.service';

export default function Header() {
  const router = useRouter();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GlobalSearchResult | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Keyboard shortcut Cmd+K or Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await executeGlobalSearch(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Failed to execute search', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResults = searchResults
    ? searchResults.users.length +
      searchResults.trips.length +
      searchResults.purchases.length +
      searchResults.blogPosts.length +
      searchResults.knowledgeArticles.length
    : 0;

  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-slate-200/80 text-slate-800 sticky top-0 z-40 shadow-2xs">
      {/* Mobile Menu trigger & Desktop Branding context */}
      <div className="flex items-center gap-3">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:text-slate-800 h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 bg-white border-r border-slate-200">
            <Sidebar onItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">
            2GO Roteiros <span className="text-slate-400 font-normal">• Painel de Gestão</span>
          </span>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Image
            src="/brand/logo-2go.png"
            alt="Logo 2GO Roteiros"
            width={70}
            height={20}
            className="h-auto w-auto object-contain max-h-5"
          />
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-sm sm:max-w-md mx-3" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar no sistema (cliente, viagem, compra)... ⌘K"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (!val.trim() || val.trim().length < 2) {
                setSearchResults(null);
                setIsSearching(false);
              }
              setIsSearchOpen(true);
            }}
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50/80 border border-slate-200/90 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#001F5B]/15 focus:border-[#001F5B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && (searchQuery.trim().length >= 2 || isSearching) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-[420px] overflow-y-auto p-2.5">
            {isSearching ? (
              <div className="flex items-center justify-center py-6 text-slate-400 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF6A00]" />
                Pesquisando no ecossistema 2GO...
              </div>
            ) : totalResults === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Nenhum resultado encontrado para &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Users */}
                {searchResults && searchResults.users.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 font-mono">
                      <Users className="w-3 h-3 text-[#001F5B]" />
                      Clientes & Usuários ({searchResults.users.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.users.map((u) => (
                        <Link
                          key={u.id}
                          href={`/customers/${u.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{u.fullName}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            {u.role}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trips */}
                {searchResults && searchResults.trips.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 font-mono">
                      <Map className="w-3 h-3 text-emerald-600" />
                      Viagens ({searchResults.trips.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.trips.map((t) => (
                        <Link
                          key={t.id}
                          href={`/trips/${t.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{t.destination}</p>
                            <p className="text-[11px] text-slate-500">{t.title || 'Roteiro de Viagem'}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                            {t.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchases */}
                {searchResults && searchResults.purchases.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 font-mono">
                      <CreditCard className="w-3 h-3 text-purple-600" />
                      Compras ({searchResults.purchases.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.purchases.map((p) => (
                        <Link
                          key={p.id}
                          href={`/billing`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                        >
                          <div>
                            <p className="font-mono text-slate-900">ID: {p.id.substring(0, 8)}...</p>
                            <p className="text-[11px] text-slate-500">
                              R$ {(p.finalAmount / 100).toFixed(2)} - {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                            {p.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blog Posts */}
                {searchResults && searchResults.blogPosts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 font-mono">
                      <FileText className="w-3 h-3 text-orange-600" />
                      Blog ({searchResults.blogPosts.length})
                    </div>
                    <div className="space-y-0.5">
                      {searchResults.blogPosts.map((b) => (
                        <Link
                          key={b.id}
                          href={`/blog`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{b.title}</p>
                            <p className="text-[11px] text-slate-500 font-mono">/{b.slug}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-medium">
                            {b.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User profile & actions */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100/70 transition-all duration-150 text-left focus:outline-none cursor-pointer">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#001F5B] text-white font-bold text-xs shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{userName}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 truncate max-w-[140px]">{userEmail}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-700 shadow-lg">
            <DropdownMenuLabel className="text-xs font-semibold text-slate-400 font-mono uppercase">Sessão Ativa</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={() => router.push('/system')}
              className="focus:bg-slate-50 focus:text-slate-900 cursor-pointer text-xs py-2"
            >
              Status do Sistema & Auditoria
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push('/users')}
              className="focus:bg-slate-50 focus:text-slate-900 cursor-pointer text-xs py-2"
            >
              Gestão de Usuários (RBAC)
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="focus:bg-rose-50 focus:text-rose-600 text-rose-500 cursor-pointer text-xs py-2"
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
