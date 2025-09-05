import ClientForm from "../../components/create-client/ClientForm";
import { useParams } from "react-router-dom";

const EditClient = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <ClientForm mode="edit" clientId={id} />
    </>
  );
};

export default EditClient;
