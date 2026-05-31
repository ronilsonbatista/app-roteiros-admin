'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { setCookie } from '@/lib/cookies';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const envelope = response.data;
      const data = envelope?.data;
      const accessToken = data?.accessToken || data?.access_token;
      const refreshToken = data?.refreshToken || data?.refresh_token;

      if (!accessToken) {
        throw new Error('Token de acesso não recebido da API.');
      }

      // Save tokens in cookies (accessToken for 7 days, refreshToken for 30 days)
      setCookie('accessToken', accessToken, 7);
      if (refreshToken) {
        setCookie('refreshToken', refreshToken, 30);
      }

      // Route to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erro no login:', err);
      
      if (err.response) {
        const errMsg = err.response.data?.message || err.response.data?.error;
        setError(errMsg || 'Falha ao autenticar. Verifique suas credenciais.');
      } else {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está ativo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-50 font-sans select-none">
      {/* Light background geometric designs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-slate-100/60 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-slate-100/60 blur-[100px] pointer-events-none" />

      {/* Main clean layout container */}
      <div className="w-full max-w-md relative z-10 animate-fade-in duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-16 mb-2 flex items-center justify-center">
            <Image
              src="/brand/logo-2go.jpeg"
              alt="Logo 2GO Roteiros"
              width={180}
              height={60}
              priority
              className="h-auto w-auto object-contain max-h-14 rounded-lg shadow-sm border border-slate-100/50"
            />
          </div>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">
            Painel Administrativo
          </p>
        </div>

        <Card className="border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-sm text-slate-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 text-center">Login</CardTitle>
            <CardDescription className="text-center text-slate-500 text-xs">
              Gestão inteligente de roteiros personalizados
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs font-semibold rounded-lg bg-red-50 border border-red-100 text-red-600 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold text-xs">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@roteiros.com"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    className="pl-10 bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400 focus:bg-white focus:border-[#001F5B] focus:ring-1 focus:ring-[#001F5B] transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="current-password" className="text-slate-700 font-semibold text-xs">
                    Senha
                  </Label>
                  <a href="#" className="text-xs font-semibold text-[#001F5B] hover:text-[#FF6A00] transition-colors">
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="current-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400 focus:bg-white focus:border-[#001F5B] focus:ring-1 focus:ring-[#001F5B] transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#001F5B] hover:bg-[#FF6A00] text-white font-bold shadow-md shadow-[#001F5B]/10 active:scale-[0.98] focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 transition-all duration-200 py-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  'Entrar no Painel'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
