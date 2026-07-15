// src/features/competitions/components/karate/KarateMedalTable.tsx
import React from 'react';
import { GenericMedalTable } from '../shared/GenericMedalTable';

interface Props { externalEventId: number; localSportId: number; eventName?: string; }

export const KarateMedalTable: React.FC<Props> = (props) => (
  <GenericMedalTable
    {...props}
    endpoint="karate-medal-table"
    queryKey="karate-medal-table"
  />
);
export default KarateMedalTable;