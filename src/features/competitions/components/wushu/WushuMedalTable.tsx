// src/features/competitions/components/wushu/WushuMedalTable.tsx
import React from 'react';
import { GenericMedalTable } from '../shared/GenericMedalTable';

interface Props { externalEventId: number; localSportId: number; eventName?: string; }

export const WushuMedalTable: React.FC<Props> = (props) => (
  <GenericMedalTable
    {...props}
    endpoint="wushu-medal-table"
    queryKey="wushu-medal-table"
  />
);
export default WushuMedalTable;