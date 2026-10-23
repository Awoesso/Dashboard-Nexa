import { useParams } from "react-router-dom";
import { DskStoreEditorView } from "@/routePages";

const EditorRouteWrapper = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-xs text-slate-600">
        Identifiant de boutique manquant
      </div>
    );
  }
  return <DskStoreEditorView slug={slug} />;
};

export default EditorRouteWrapper;
