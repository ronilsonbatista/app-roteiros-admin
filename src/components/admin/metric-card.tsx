import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
    label?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  className?: string;
  variant?: 'default' | 'unavailable' | 'accent' | 'primary';
  statusLabel?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  href,
  className,
  variant = 'default',
  statusLabel,
}: MetricCardProps) {
  const content = (
    <Card
      className={cn(
        "relative overflow-hidden border border-slate-200/90 bg-white text-slate-900 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 rounded-xl p-5",
        variant === 'unavailable' && "bg-slate-50/50 border-slate-200/60 opacity-80",
        variant === 'accent' && "bg-[#FF6A00]/5 border-[#FF6A00]/20",
        variant === 'primary' && "bg-[#001F5B]/5 border-[#001F5B]/20",
        href && "cursor-pointer group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-100/80 border border-slate-200/50 text-[#001F5B] group-hover:bg-[#001F5B] group-hover:text-white transition-colors">
            <Icon className="w-4 h-4 shrink-0" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-[#001F5B] transition-colors font-sans">
          {value}
        </div>

        {statusLabel && (
          <span className="inline-block text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
            {statusLabel}
          </span>
        )}

        {change && (
          <div className="flex items-center gap-1.5 text-xs font-medium pt-1">
            {change.type === 'positive' && (
              <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                {change.value}
              </span>
            )}
            {change.type === 'negative' && (
              <span className="flex items-center gap-0.5 text-rose-600 font-semibold">
                <TrendingDown className="w-3.5 h-3.5" />
                {change.value}
              </span>
            )}
            {change.type === 'neutral' && (
              <span className="flex items-center gap-0.5 text-slate-500 font-semibold">
                <Minus className="w-3.5 h-3.5" />
                {change.value}
              </span>
            )}
            {change.label && (
              <span className="text-slate-400 text-[11px]">{change.label}</span>
            )}
          </div>
        )}

        {subtitle && !change && (
          <p className="text-xs text-slate-500 font-normal pt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
