import type { WushuSandaMatch } from '../../types/wushu.types';
import type { Phase } from '../../types';
import { WushuScoreModal } from './WushuScoreModal';

interface Props {
  match: WushuSandaMatch;
  phase?: Phase;
  isOpen: boolean;
  onClose: () => void;
}

export function WushuMatchDetailsModal({ match, phase, isOpen, onClose }: Props) {
  return (
    <WushuScoreModal
      match={match}
      phase={phase}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
