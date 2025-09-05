import { DocumentManager } from "../../components/create-client/document-manager"





export const ClientDocumentUpload = ({ clientId }: { clientId?: string }) => {
    return(
        <div>
            <DocumentManager clientId={clientId || ''} userType="employee" />
        </div>
    )
}