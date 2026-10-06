import React from 'react';
import ComingSoonPlaceholder from '@/components/admin/coming-soon-placeholder';

export default function AnalyticsLayout() {
  return (
    <ComingSoonPlaceholder
      moduleName="Analytics & Métricas da Plataforma"
      moduleDescription="Indicadores consolidados, retenção e funil de conversão de roteiros 2GO"
      iconName="BarChart3"
      breadcrumbs={[{ label: 'Analytics', href: '/analytics' }, { label: 'Em breve' }]}
    />
  );
}
