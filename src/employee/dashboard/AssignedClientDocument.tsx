import { useParams } from "react-router-dom";
import { DocumentManager } from "../../components/create-client/document-manager"

export const AssignedClientDocument = () => {


    const { clientId } = useParams<{ clientId: string }>();
    

    if (!clientId) {
        return <div>Client ID not found</div>;
    }

    return (
        <div>
            <DocumentManager clientId={clientId} userType="employee" />
        </div>
    )
}




