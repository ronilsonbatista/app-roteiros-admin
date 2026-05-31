'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
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
      
      {/* Visual Design System - Travel routes and airplane in SVG */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft, blurred brand colors in background */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#001F5B]/3 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF6A00]/4 blur-[130px]" />
        <div className="absolute top-[30%] right-[-20%] w-[400px] h-[400px] rounded-full bg-[#5E6118]/2 blur-[100px]" />

        {/* Inline SVG showing tourism/travel elements: 4 curved dotted route paths and 4 planes */}
        <svg className="absolute w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
          {/* Route 1: Top-Left to Right */}
          <path
            d="M-50,150 C200,80 350,380 650,200 C800,100 1100,280 1350,120 C1550,20"
            fill="none"
            stroke="url(#route-gradient-1)"
            strokeWidth="2"
            strokeDasharray="8,8"
          />

          {/* Route 2: Bottom-Left to Bottom-Right */}
          <path
            d="M100,750 C400,600 600,850 950,700 C1200,600 1350,780 1650,650"
            fill="none"
            stroke="url(#route-gradient-2)"
            strokeWidth="1.5"
            strokeDasharray="6,6"
          />

          {/* Route 3: Top-Right to Center-Left */}
          <path
            d="M300,50 C500,250 800,100 1000,300 C1200,500 1500,400 1800,600"
            fill="none"
            stroke="url(#route-gradient-3)"
            strokeWidth="1.5"
            strokeDasharray="8,8"
            strokeOpacity="0.4"
          />

          {/* Route 4: Soft Gray central sweep */}
          <path
            d="M-100,600 C200,500 450,700 700,550 C950,400 1200,550 1450,450"
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
            strokeDasharray="4,4"
            strokeOpacity="0.2"
          />

          {/* Paper Plane 1 (Orange) - Route 1 */}
          <g transform="translate(480, 260) rotate(-18)">
            <path
              d="M1.012 0.003 L19.996 9.5 L1.012 18.997 L3.597 11.854 L12.64 9.5 L3.597 7.147 Z"
              fill="#FF6A00"
              className="drop-shadow-sm"
            />
          </g>

          {/* Paper Plane 2 (Navy) - Route 2 */}
          <g transform="translate(1120, 640) rotate(15)">
            <path
              d="M1.012 0.003 L19.996 9.5 L1.012 18.997 L3.597 11.854 L12.64 9.5 L3.597 7.147 Z"
              fill="#001F5B"
              className="drop-shadow-sm"
            />
          </g>

          {/* Paper Plane 3 (Olive) - Route 3 */}
          <g transform="translate(750, 180) rotate(22)">
            <path
              d="M1.012 0.003 L19.996 9.5 L1.012 18.997 L3.597 11.854 L12.64 9.5 L3.597 7.147 Z"
              fill="#5E6118"
              fillOpacity="0.8"
            />
          </g>

          {/* Paper Plane 4 (Slate) - Route 4 */}
          <g transform="translate(250, 580) rotate(-5)">
            <path
              d="M1.012 0.003 L19.996 9.5 L1.012 18.997 L3.597 11.854 L12.64 9.5 L3.597 7.147 Z"
              fill="#64748B"
              fillOpacity="0.4"
            />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="route-gradient-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#001F5B" stopOpacity="0.05" />
              <stop offset="35%" stopColor="#001F5B" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#FF6A00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#001F5B" stopOpacity="0.05" />
            </linearGradient>
            
            <linearGradient id="route-gradient-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#5E6118" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#001F5B" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="route-gradient-3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#001F5B" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#FF6A00" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#5E6118" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main card login shell - Maximum width 420px */}
      <div className="w-full max-w-[420px] relative z-10 animate-fade-in duration-700">
        
        {/* Typographical Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-4xl font-extrabold tracking-tight select-none font-sans flex items-center gap-1.5">
            <span className="text-[#001F5B] font-black">2GO</span>
            <span className="text-[#FF6A00] font-black">Roteiros</span>
          </div>
        </div>

        {/* SaaS-Style Clean Card - Rounded 3xl with Soft Premium Shadow */}
        <Card className="border-slate-200/50 bg-white/95 shadow-lg backdrop-blur-md text-slate-800 rounded-3xl p-3">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 text-center tracking-tight">Painel Administrativo</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-6">
              {error && (
                <div className="p-3 text-xs font-semibold rounded-lg bg-red-50 border border-red-100 text-red-600 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-600 font-semibold text-xs pl-0.5">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@roteiros.com"
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  className="bg-white border-slate-200 text-slate-950 placeholder-slate-400 focus:border-[#001F5B] focus:ring-1 focus:ring-[#001F5B] transition-all duration-200 rounded-xl h-12 text-sm px-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-0.5">
                  <Label htmlFor="current-password" className="text-slate-600 font-semibold text-xs">
                    Senha
                  </Label>
                  <a href="#" className="text-xs font-bold text-[#001F5B] hover:text-[#FF6A00] transition-colors">
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="current-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className="bg-white border-slate-200 text-slate-950 placeholder-slate-400 focus:border-[#001F5B] focus:ring-1 focus:ring-[#001F5B] transition-all duration-200 rounded-xl h-12 text-sm pl-4 pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 pt-6 pb-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#001F5B] hover:bg-[#FF6A00] text-white font-bold shadow-md shadow-[#001F5B]/15 active:scale-[0.98] focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 transition-all duration-200 h-12 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar no Painel'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
