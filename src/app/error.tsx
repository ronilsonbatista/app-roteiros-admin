'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[RootErrorBoundary] Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50 font-sans">
      <Card className="max-w-md w-full p-6 md:p-8 bg-white border border-slate-200 shadow-sm rounded-2xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Painel de Gestão 2GO
          </h2>
          <p className="text-xs text-slate-500">
            Ocorreu uma falha inesperada na interface. Clique abaixo para recarregar com segurança.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Tentar Novamente
          </Button>

          <Button
            variant="outline"
            onClick={() => { window.location.href = '/dashboard'; }}
            className="w-full sm:w-auto text-xs h-9 px-4 border-slate-200 text-slate-700"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Ir para Início
          </Button>
        </div>
      </Card>
    </div>
  );
}
