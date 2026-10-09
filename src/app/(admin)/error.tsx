'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminErrorBoundary] Runtime error captured:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-lg w-full p-6 md:p-8 bg-white border border-slate-200/90 shadow-sm rounded-2xl text-center space-y-5 animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-2xs">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            Não foi possível carregar esta seção
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto">
            Ocorreu uma instabilidade momentânea ao renderizar este módulo. Seus dados estão seguros na nuvem.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-left text-[11px] font-mono text-slate-600 overflow-x-auto max-h-28">
            <span className="text-slate-400 select-none block mb-1">Diagnóstico:</span>
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Tentar Novamente
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto text-xs h-9 px-4 border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Recarregar Página
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              className="w-full sm:w-auto text-xs h-9 px-4 text-slate-600 hover:text-slate-900"
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
