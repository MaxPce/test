import type { FieldEventType } from "../../types/athletics.types";
import { FIELD_EVENT_CONFIG } from "../../types/athletics.types";
import DistanceAttemptsTable from "./DistanceAttemptsTable";
import HeightAttemptsTable from "./HeightAttemptsTable";

interface Props {
  phaseId: number;
  eventType: FieldEventType;
}

export default function AthleticsFieldTable({ phaseId, eventType }: Props) {
  const config = FIELD_EVENT_CONFIG[eventType];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{config.label}</h2>
          
        </div>
      </div>

      {config.format === "distance" ? (
        <DistanceAttemptsTable phaseId={phaseId} eventType={eventType} />
      ) : (
        <HeightAttemptsTable phaseId={phaseId} eventType={eventType} />
      )}
    </div>
  );
}
