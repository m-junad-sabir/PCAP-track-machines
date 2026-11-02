import type { HomeData, Lookups, QicDraft } from '../../lib/types';

export interface StepProps {
  draft: QicDraft;
  update: (patch: Partial<QicDraft>) => void;
  next: () => void;
  back: () => void;
  lookups?: Lookups;
  home?: HomeData;
  submit: () => Promise<void>;
}
