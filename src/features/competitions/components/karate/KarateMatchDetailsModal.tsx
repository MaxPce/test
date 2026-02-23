import type { KarateMatch } from '../../types/karate.types';
import type { Phase } from '../../types';
import { KarateScoreModal } from './KarateScoreModal';

interface Props {
  match: KarateMatch;
  phase?: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export function KarateMatchDetailsModal({ match, phase, isOpen, onClose }: Props) {
  return (
    <KarateScoreModal
      match={match}
      phase={phase}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
