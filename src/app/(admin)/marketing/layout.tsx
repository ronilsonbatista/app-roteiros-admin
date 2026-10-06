import React from 'react';
import ComingSoonPlaceholder from '@/components/admin/coming-soon-placeholder';

export default function MarketingLayout() {
  return (
    <ComingSoonPlaceholder
      moduleName="Marketing & Comunicação"
      moduleDescription="Gestão de campanhas, templates de e-mail e segmentação de público 2GO"
      iconName="Megaphone"
      breadcrumbs={[{ label: 'Marketing', href: '/marketing' }, { label: 'Em breve' }]}
    />
  );
}
