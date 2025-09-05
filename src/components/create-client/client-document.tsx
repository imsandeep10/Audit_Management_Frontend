

import { useLocation, useParams } from 'react-router-dom';
import { DocumentManager } from './document-manager';


export const ClientDocumentsPage = () => {

  const { clientId: paramClientId } = useParams();
  const location = useLocation();
  const state = location.state as {
    clientId: string;
    clientName: string;
    userType?: 'admin' | 'employee'
  };

  const clientId = state?.clientId || paramClientId;

  if (!clientId) {
    return <div>Client not found</div>;
  }


  return (
    <div className="container mx-auto py-8">
      <DocumentManager
        clientId={clientId}
        userType={state?.userType || 'admin'}
      />
    </div>
  );
}