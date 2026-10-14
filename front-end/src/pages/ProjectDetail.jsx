import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, FilePlus2, Filter, Search, Trash2 } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import ApiDocViewer from "../components/ApiDocViewer";
import ApiForm from "../components/ApiForm";
import EmptyState from "../components/EmptyState";
import MethodBadge from "../components/MethodBadge";
import SelectField from "../components/SelectField";
import { useFeedback } from "../hooks/useFeedback";
import { METHODS, STATUSES } from "../utils/constants";
import * as apiDocService from "../services/apiDocService";
import * as projectService from "../services/projectService";

const methodFilterOptions = [{ value: "", label: "All methods" }, ...METHODS.map((method) => ({ value: method, label: method }))];
const statusFilterOptions = [{ value: "", label: "All statuses" }, ...STATUSES];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { toast, confirm } = useFeedback();
  const [project, setProject] = useState(null);
  const [apiDocs, setApiDocs] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [mode, setMode] = useState("view");
  const [filters, setFilters] = useState({ search: "", method: "", status: "", tag: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const tags = useMemo(() => {
    return [...new Set(apiDocs.map((apiDoc) => apiDoc.tag).filter(Boolean))].sort();
  }, [apiDocs]);

  const tagFilterOptions = useMemo(() => [{ value: "", label: "All tags" }, ...tags.map((tag) => ({ value: tag, label: tag }))], [tags]);

  const groupedApis = useMemo(() => {
    return apiDocs.reduce((groups, apiDoc) => {
      const tag = apiDoc.tag || "General";
      groups[tag] = groups[tag] || [];
      groups[tag].push(apiDoc);
      return groups;
    }, {});
  }, [apiDocs]);

  const loadProject = async () => {
    const response = await projectService.getProject(projectId);
    setProject(response.data);
  };

  const loadApiDocs = async (nextFilters = filters) => {
    const params = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value));
    const response = await apiDocService.getApiDocs(projectId, params);
    setApiDocs(response.data);

    if (response.data.length > 0) {
      const stillSelected = selectedApi && response.data.find((apiDoc) => apiDoc._id === selectedApi._id);
      setSelectedApi(stillSelected || response.data[0]);
    } else {
      setSelectedApi(null);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadProject(), loadApiDocs()]);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const changeFilter = async (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    try {
      await loadApiDocs(nextFilters);
    } catch (filterError) {
      setError(filterError.message);
    }
  };

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

      const isEditing = mode === "edit" && selectedApi;
      const response = isEditing
        ? await apiDocService.updateApiDoc(selectedApi._id, payload)
        : await apiDocService.createApiDoc(projectId, payload);

      await loadApiDocs();
      setSelectedApi(response.data);
      setMode("view");
      toast.success(isEditing ? "Đã cập nhật API" : "Đã tạo API", "Tài liệu API đã được lưu.");
    } catch (submitError) {
      setError(submitError.message);
      toast.error(mode === "edit" ? "Cập nhật API thất bại" : "Tạo API thất bại", submitError.message);
      throw submitError;
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedApi = async () => {
    if (!selectedApi) {
      return;
    }

    const approved = await confirm({
      title: "Xóa tài liệu API?",
      message: "Endpoint này sẽ bị xóa khỏi project. Thao tác này không thể hoàn tác.",
      confirmText: "Xóa API",
      cancelText: "Hủy",
      variant: "danger",
    });

    if (!approved) {
      return;
    }

    try {
      await apiDocService.deleteApiDoc(selectedApi._id);
      setSelectedApi(null);
      setMode("view");
      await loadApiDocs();
      toast.success("Đã xóa API", "Tài liệu API đã được xóa khỏi project.");
    } catch (deleteError) {
      setError(deleteError.message);
      toast.error("Xóa API thất bại", deleteError.message);
    }
  };

  return (
    <AppLayout>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to="/" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-accent">
            <ArrowLeft size={16} />
            Quay lại danh sách project
          </Link>
          <h1 className="text-3xl font-black text-ink">{project?.name || "Dự án"}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{project?.description || "Chưa có mô tả."}</p>
          {project?.baseUrl ? <code className="mt-3 inline-block rounded bg-white px-3 py-1 text-xs font-semibold text-slate-700">{project.baseUrl}</code> : null}
        </div>
        <button className="btn btn-primary" onClick={() => setMode("create")}>
          <FilePlus2 size={17} />
          Tạo API
        </button>
      </div>

      {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-md border border-line bg-white shadow-soft lg:sticky lg:top-20">
          <div className="border-b border-line p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                className="input pl-10"
                placeholder="Tìm endpoint..."
                value={filters.search}
                onChange={(event) => changeFilter("search", event.target.value)}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                <SelectField
                  value={filters.method}
                  options={methodFilterOptions}
                  onChange={(value) => changeFilter("method", value)}
                  buttonClassName="pl-9"
                  placeholder="All methods"
                />
              </div>
              <SelectField value={filters.status} options={statusFilterOptions} onChange={(value) => changeFilter("status", value)} placeholder="All statuses" />
            </div>
            <SelectField className="mt-2" value={filters.tag} options={tagFilterOptions} onChange={(value) => changeFilter("tag", value)} placeholder="All tags" />
          </div>

          <div className="max-h-[calc(100vh-260px)] overflow-auto p-3">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">Đang tải API...</p>
            ) : apiDocs.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Chưa có API phù hợp.</p>
            ) : (
              Object.entries(groupedApis).map(([tag, items]) => (
                <div key={tag} className="mb-4">
                  <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500">{tag}</p>
                  <div className="space-y-2">
                    {items.map((apiDoc) => (
                      <button
                        key={apiDoc._id}
                        className={`w-full rounded-md border p-3 text-left transition ${
                          selectedApi?._id === apiDoc._id ? "border-accent bg-teal-50" : "border-line bg-white hover:bg-panel"
                        }`}
                        onClick={() => {
                          setSelectedApi(apiDoc);
                          setMode("view");
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <MethodBadge method={apiDoc.method} />
                          <code className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{apiDoc.endpoint}</code>
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-700">{apiDoc.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <section>
          {mode === "create" ? (
            <div>
              <h2 className="mb-4 text-xl font-black text-ink">Tạo tài liệu API</h2>
              <ApiForm onSubmit={submitApi} onCancel={() => setMode("view")} saving={saving} />
            </div>
          ) : mode === "edit" ? (
            <div>
              <h2 className="mb-4 text-xl font-black text-ink">Chỉnh sửa tài liệu API</h2>
              <ApiForm apiDoc={selectedApi} onSubmit={submitApi} onCancel={() => setMode("view")} saving={saving} />
            </div>
          ) : selectedApi ? (
            <div>
              <div className="mb-4 flex justify-end gap-2">
                <button className="btn btn-muted" onClick={() => setMode("edit")}>
                  <Edit3 size={17} />
                  Sửa
                </button>
                <button className="btn btn-danger" onClick={deleteSelectedApi}>
                  <Trash2 size={17} />
                  Xóa
                </button>
              </div>
              <ApiDocViewer apiDoc={selectedApi} />
            </div>
          ) : (
            <EmptyState
              title="Chưa chọn API"
              description="Chọn một endpoint ở thanh bên hoặc tạo tài liệu API mới."
              action={
                <button className="btn btn-primary" onClick={() => setMode("create")}>
                  <FilePlus2 size={17} />
                  Tạo API
                </button>
              }
            />
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
