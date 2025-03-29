import { useParams } from 'react-router-dom';
import { DocumentManager } from './DocumentManager';

export function DocumentManagerWrapper() {
  const { claimId } = useParams<{ claimId: string }>();
  
  if (!claimId) {
    return <div>No claim ID provided</div>;
  }
  
  return <DocumentManager claimId={claimId} />;
} 