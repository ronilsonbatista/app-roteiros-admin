import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  children,
  onResetFilters,
  hasActiveFilters = false,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3 flex-wrap", className)}>
      {onSearchChange && (
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs bg-slate-50/70 border-slate-200 focus:bg-white focus:border-[#001F5B] transition-all rounded-lg"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {children && (
        <div className="flex items-center gap-2 flex-wrap flex-1 justify-start sm:justify-end">
          {children}

          {hasActiveFilters && onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-2.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Limpar filtros"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
