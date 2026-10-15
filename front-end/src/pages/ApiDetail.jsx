import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit3 } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import ApiDocViewer from "../components/ApiDocViewer";
import ApiForm from "../components/ApiForm";
import EmptyState from "../components/EmptyState";
import { useFeedback } from "../hooks/useFeedback";
import * as apiDocService from "../services/apiDocService";
import * as projectService from "../services/projectService";

const ApiDetail = () => {
  const { projectId, apiId } = useParams();
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const isCreating = apiId === "new";
  const [project, setProject] = useState(null);
  const [apiDoc, setApiDoc] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [mode, setMode] = useState(isCreating ? "create" : "view");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectResponse, apiResponse] = await Promise.all([
        projectService.getProject(projectId),
        isCreating ? Promise.resolve({ data: null }) : apiDocService.getApiDoc(projectId, apiId),
      ]);
      const apiDocsResponse = await apiDocService.getApiDocs(projectId);
      setProject(projectResponse.data);
      setApiDoc(apiResponse.data);
      setAvailableTags([...new Set(apiDocsResponse.data.map((item) => item.tag).filter(Boolean))].sort());
      setMode(isCreating ? "create" : "view");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [projectId, apiId, isCreating]);

  const submitApi = async (form) => {
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        requestBody: form.requestBody || "{}",
        responses: form.responses.map((response) => ({
          ...response,
          body: response.body || "{}",
        })),
      };

      const response = isCreating
        ? await apiDocService.createApiDoc(projectId, payload)
        : await apiDocService.updateApiDoc(projectId, apiId, payload);
      setApiDoc(response.data);
      toast.success(isCreating ? "Đã tạo API" : "Đã cập nhật API", "Tài liệu API đã được lưu.");
      if (isCreating) {
        navigate(`/projects/${projectId}/apis/${response.data._id}`, { replace: true });
        return;
      }
      setMode("view");
    } catch (submitError) {
      setError(submitError.message);
      toast.error(isCreating ? "Tạo API thất bại" : "Cập nhật API thất bại", submitError.message);
      throw submitError;
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = isCreating
    ? "Tạo tài liệu API"
    : mode === "edit"
      ? "Chỉnh sửa tài liệu API"
      : apiDoc?.name || "Chi tiết API";

  return (
    <AppLayout>
      <div className="mb-4 flex flex-col gap-2 border-b border-line pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-accent" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft size={16} />
            Quay lại danh sách endpoint
          </button>
          <h1 className="text-2xl font-black text-ink">{pageTitle}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{project?.name || "Project"}</p>
        </div>

        {!isCreating && mode === "view" && apiDoc ? (
          <button className="btn btn-muted" onClick={() => setMode("edit")}>
            <Edit3 size={17} />
            Sửa
          </button>
        ) : null}
      </div>

      {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <p className="rounded-md border border-line bg-white p-4 text-sm text-slate-500">Đang tải chi tiết API...</p>
      ) : !isCreating && !apiDoc ? (
        <EmptyState
          title="Không tìm thấy API"
          description="Tài liệu API này không tồn tại hoặc đã bị xóa."
          action={
            <Link className="btn btn-primary" to={`/projects/${projectId}`}>
              Quay lại danh sách endpoint
            </Link>
          }
        />
      ) : mode === "edit" || mode === "create" ? (
        <ApiForm
          apiDoc={apiDoc}
          availableTags={availableTags}
          onSubmit={submitApi}
          onCancel={() => (isCreating ? navigate(`/projects/${projectId}`) : setMode("view"))}
          saving={saving}
        />
      ) : (
        <ApiDocViewer apiDoc={apiDoc} />
      )}
    </AppLayout>
  );
};

export default ApiDetail;
