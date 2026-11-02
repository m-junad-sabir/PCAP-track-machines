import { useCallback, useEffect, useState } from 'react';
import { FileRec, getFiles } from '../../lib/db';

export function useFiles(inspectionId: string, kind: 'photo' | 'worksheet') {
  const [files, setFiles] = useState<FileRec[]>([]);
  const reload = useCallback(async () => {
    setFiles((await getFiles(inspectionId)).filter((f) => f.kind === kind).sort((a, b) => a.slot - b.slot));
  }, [inspectionId, kind]);
  useEffect(() => { void reload(); }, [reload]);
  return { files, reload };
}
