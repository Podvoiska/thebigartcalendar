'use client';

import { CalendarFilters } from '@/types';
import FilterBar from '@/components/filters/FilterBar';
import { FilterSelect } from '@/components/ui/FilterSelect';

interface Props {
  year: number;
  onYearChange: (y: number) => void;
  filters: CalendarFilters;
  onFiltersChange: (f: CalendarFilters) => void;
  cities: string[];
}

const YEARS = [2024, 2025, 2026, 2027, 2028];

export default function AppHeader({ year, onYearChange, filters, onFiltersChange, cities }: Props) {
  return (
    <div className="flex-none flex items-center justify-between px-6 pb-[1.5vh]">
      <FilterSelect
        value={String(year)}
        onChange={(v) => onYearChange(Number(v ?? year))}
        options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
      />

      <FilterBar filters={filters} onChange={onFiltersChange} cities={cities} />
    </div>
  );
}
