const labels: Record<string, string> = {
  LOCAL_HISTORY: 'História local', GASTRONOMY: 'Gastronomia', ARCHITECTURE: 'Arquitetura', ART: 'Arte', NATURE: 'Natureza', OUTDOOR: 'Ao ar livre', SPORTS: 'Esportes', MUSIC: 'Música', GEEK_CULTURE: 'Cultura geek',
  LOW: 'Econômico', MEDIUM: 'Moderado', HIGH: 'Alto', PREMIUM: 'Premium', COMFORT: 'Conforto', ECONOMIC: 'Econômico', LUXURY: 'Luxo', ADVENTURE: 'Aventura', FAMILY: 'Família', ROMANTIC: 'Romântico', PARTY: 'Festas', CULTURAL: 'Cultural',
};
export function TravelPreferences({ preferences }: { preferences: Record<string, unknown> }) {
  const travelers = preferences.travelers as { adults?: number; children?: number; elders?: number } | undefined;
  const hours = preferences.activityHours as { startTime?: string; endTime?: string } | undefined;
  const interests = Array.isArray(preferences.interests) ? preferences.interests.map(x => labels[String(x)] || String(x)).join(', ') : '';
  const rawDestinations = Array.isArray(preferences.destinations) ? preferences.destinations : [];
  const destinationsStr = rawDestinations.length > 0
    ? rawDestinations
        .map((d: any) => {
          const name = d?.name || d?.city || '';
          const dates = d?.arrivalDate ? ` (${d.arrivalDate}${d.arrivalTime ? ' ' + d.arrivalTime : ''} - ${d.departureDate || ''}${d.departureTime ? ' ' + d.departureTime : ''})` : '';
          return `${name}${dates}`;
        })
        .filter(Boolean)
        .join(' → ')
    : '';

  const rows: [string, string][] = [
    ['Multi-destinos', destinationsStr],
    ['Viajantes', travelers ? `${travelers.adults || 0} adultos, ${travelers.children || 0} crianças, ${travelers.elders || 0} idosos` : ''],
    ['Interesses', interests], ['Orçamento', labels[String(preferences.budgetLevel)] || String(preferences.budgetLevel || '')],
    ['Estilo', labels[String(preferences.travelStyle)] || String(preferences.travelStyle || '')],
    ['Horário das atividades', hours ? `${hours.startTime || '—'} às ${hours.endTime || '—'}` : ''],
  ];
  const available = rows.filter(([, value]) => value);
  return available.length ? <dl className="space-y-3 text-sm">{available.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-slate-800">{value}</dd></div>)}</dl> : <p className="text-sm text-slate-500">Nenhuma preferência detalhada cadastrada.</p>;
}
