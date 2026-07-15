// src/features/competitions/components/tennis/TennisMedalTable.tsx
import React from 'react';
import { GenericMedalTable } from '../shared/GenericMedalTable';

interface Props { externalEventId: number; localSportId: number; eventName?: string; }

export const TennisMedalTable: React.FC<Props> = (props) => (
  <GenericMedalTable
    {...props}
    endpoint="tennis-medal-table"
    queryKey="tennis-medal-table"
  />
);
export default TennisMedalTable;