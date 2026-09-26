import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-dashed border-slate-200 rounded-xl", className)}>
      <div className="w-12 h-12 rounded-full bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3 shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5 mr-1.5" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
