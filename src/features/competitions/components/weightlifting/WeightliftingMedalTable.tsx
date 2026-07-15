// src/features/competitions/components/weightlifting/WeightliftingMedalTable.tsx
import React from 'react';
import { GenericMedalTable } from '../shared/GenericMedalTable';

interface Props { externalEventId: number; localSportId: number; eventName?: string; }

export const WeightliftingMedalTable: React.FC<Props> = (props) => (
  <GenericMedalTable
    {...props}
    endpoint="weightlifting-medal-table"
    queryKey="weightlifting-medal-table"
  />
);
export default WeightliftingMedalTable;