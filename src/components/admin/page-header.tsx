import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './breadcrumbs';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  category?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  category,
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-3 pb-2", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="mb-2" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          {category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
              {category}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-slate-500 font-normal max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
