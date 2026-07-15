// src/features/competitions/components/taekwondo/TaekwondoKyoruguiMedalTable.tsx
import React from 'react';
import { GenericMedalTable } from '../shared/GenericMedalTable';

interface Props { externalEventId: number; localSportId: number; eventName?: string; }

export const TaekwondoKyoruguiMedalTable: React.FC<Props> = (props) => (
  <GenericMedalTable
    {...props}
    endpoint="taekwondo-kyorugui-medal-table"
    queryKey="taekwondo-kyorugui-medal-table"
  />
);
export default TaekwondoKyoruguiMedalTable;