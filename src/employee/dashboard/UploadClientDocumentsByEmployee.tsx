import { useParams } from "react-router-dom";
import { UploadClientDocument } from "../../components/documentUpload/uploadClientDocument";

export const UploadClientDocumentsByEmployee = () => {
  const { clientId } = useParams<{ clientId: string }>();

  if (!clientId) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <h3 className="font-medium mb-2">Client ID Missing</h3>
          <p className="text-sm">Client ID not found. Please navigate through the proper client documents page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UploadClientDocument />
    </div>
  );
};