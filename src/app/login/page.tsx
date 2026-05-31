'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, Loader2, Compass } from 'lucide-react';
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
        setError('Não foi possível conectar ao servidor. O backend está rodando em http://localhost:3000?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950 font-sans select-none">
      {/* Visual background decorations - premium gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-fuchsia-500/5 blur-[150px] pointer-events-none" />

      {/* Main glassmorphism card container */}
      <div className="w-full max-w-md relative z-10 animate-fade-in duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-xl shadow-violet-500/20 mb-4 animate-bounce duration-[3s]">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Roteiros<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Admin</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Gestão inteligente de itinerários e experiências
          </p>
        </div>

        <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-white text-center">Fazer Login</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Entre com suas credenciais administrativas
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium text-xs">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemplo@roteiros.com"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    className="pl-10 bg-slate-950/80 border-slate-800 focus:border-violet-500 focus:ring-violet-500 text-slate-100 placeholder-slate-500 transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="current-password" className="text-slate-300 font-medium text-xs">
                    Senha
                  </Label>
                  <a href="#" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="current-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-slate-950/80 border-slate-800 focus:border-violet-500 focus:ring-violet-500 text-slate-100 placeholder-slate-500 transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all duration-150 py-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
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
