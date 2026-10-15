import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FilePlus2, Filter, Search, Trash2 } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/EmptyState";
import MethodBadge from "../components/MethodBadge";
import SelectField from "../components/SelectField";
import { useFeedback } from "../hooks/useFeedback";
import { getStatusLabel, METHODS, STATUSES } from "../utils/constants";
import * as apiDocService from "../services/apiDocService";
import * as projectService from "../services/projectService";

const methodFilterOptions = [{ value: "", label: "All methods" }, ...METHODS.map((method) => ({ value: method, label: method }))];
const statusFilterOptions = [{ value: "", label: "All statuses" }, ...STATUSES];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast, confirm } = useFeedback();
  const [project, setProject] = useState(null);
  const [apiDocs, setApiDocs] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [filters, setFilters] = useState({ search: "", method: "", status: "", tag: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiRequestIdRef = useRef(0);

  const tagFilterOptions = useMemo(
    () => [{ value: "", label: "All tags" }, ...availableTags.map((tag) => ({ value: tag, label: tag }))],
    [availableTags]
  );

  const groupedApis = useMemo(() => {
    return apiDocs.reduce((groups, apiDoc) => {
      const tag = apiDoc.tag || "General";
      groups[tag] = groups[tag] || [];
      groups[tag].push(apiDoc);
      return groups;
    }, {});
  }, [apiDocs]);

  useEffect(() => {
    let active = true;
    setProject(null);
    setApiDocs([]);
    setAvailableTags([]);
    setFilters({ search: "", method: "", status: "", tag: "" });
    setError("");

    projectService
      .getProject(projectId)
      .then((response) => {
        if (active) setProject(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    const requestId = ++apiRequestIdRef.current;
    const timerId = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
        const response = await apiDocService.getApiDocs(projectId, params);

        if (requestId !== apiRequestIdRef.current) return;

        setApiDocs(response.data);
        const responseTags = response.data.map((apiDoc) => apiDoc.tag).filter(Boolean);
        setAvailableTags((current) => [...new Set([...current, ...responseTags])].sort());
      } catch (loadError) {
        if (requestId === apiRequestIdRef.current) {
          setError(loadError.message);
        }
      } finally {
        if (requestId === apiRequestIdRef.current) {
          setLoading(false);
        }
      }
    }, filters.search ? 300 : 0);

    return () => {
      window.clearTimeout(timerId);
      if (requestId === apiRequestIdRef.current) {
        apiRequestIdRef.current += 1;
      }
    };
  }, [projectId, filters]);

  const changeFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const deleteApi = async (event, apiDoc) => {
    event.stopPropagation();

    const approved = await confirm({
      title: "Xóa tài liệu API?",
      message: `${apiDoc.endpoint} sẽ bị xóa khỏi project. Thao tác này không thể hoàn tác.`,
      confirmText: "Xóa API",
      cancelText: "Hủy",
      variant: "danger",
    });

    if (!approved) {
      return;
    }

    try {
      await apiDocService.deleteApiDoc(projectId, apiDoc._id);
      const remainingApiDocs = apiDocs.filter((item) => item._id !== apiDoc._id);
      setApiDocs(remainingApiDocs);
      if (!filters.search && !filters.method && !filters.status && !filters.tag) {
        setAvailableTags([...new Set(remainingApiDocs.map((item) => item.tag).filter(Boolean))].sort());
      }
      toast.success("Đã xóa API", "Tài liệu API đã được xóa khỏi project.");
    } catch (deleteError) {
      setError(deleteError.message);
      toast.error("Xóa API thất bại", deleteError.message);
    }
  };

  return (
    <AppLayout>
      <div className="mb-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-accent">
          <ArrowLeft size={16} />
          Quay lại danh sách project
        </Link>
      </div>

      {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-md border border-line bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">Project</p>
            <h1 className="mt-2 text-2xl font-black text-ink">{project?.name || "Dự án"}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{project?.description || "Chưa có mô tả."}</p>
            {project?.baseUrl ? <code className="mt-3 inline-block max-w-full truncate rounded bg-panel px-3 py-1 text-xs font-semibold text-slate-700">{project.baseUrl}</code> : null}
          </section>

          <section className="rounded-md border border-line bg-white p-4 shadow-soft">
            <p className="mb-3 text-sm font-bold text-ink">Bộ lọc endpoint</p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                className="input pl-10"
                placeholder="Tìm endpoint..."
                value={filters.search}
                onChange={(event) => changeFilter("search", event.target.value)}
                maxLength={100}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                <SelectField value={filters.method} options={methodFilterOptions} onChange={(value) => changeFilter("method", value)} buttonClassName="pl-9" />
              </div>
              <SelectField value={filters.status} options={statusFilterOptions} onChange={(value) => changeFilter("status", value)} />
            </div>
            <SelectField className="mt-2" value={filters.tag} options={tagFilterOptions} onChange={(value) => changeFilter("tag", value)} />
          </section>
        </aside>

        <section className="min-w-0">
          <div className="rounded-md border border-line bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-ink">Danh sách endpoint</h2>
                <p className="mt-1 text-sm text-slate-500">{apiDocs.length} API phù hợp bộ lọc hiện tại.</p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate(`/projects/${projectId}/apis/new`)}>
                <FilePlus2 size={17} />
                Tạo API
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <p className="p-4 text-sm text-slate-500">Đang tải API...</p>
              ) : apiDocs.length === 0 ? (
                <EmptyState title="Chưa có API phù hợp" description="Thay đổi bộ lọc hoặc tạo tài liệu API mới cho project này." />
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedApis).map(([tag, items]) => (
                    <section key={tag}>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-wide text-ink">{tag}</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{items.length} API</span>
                      </div>

                      <div className="overflow-x-auto rounded-md border border-line">
                        <table className="min-w-full divide-y divide-line text-sm">
                          <thead className="bg-panel text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="w-28 px-4 py-3">Method</th>
                              <th className="px-4 py-3">Endpoint</th>
                              <th className="px-4 py-3">Tên API</th>
                              <th className="w-32 px-4 py-3">Status</th>
                              <th className="w-16 px-4 py-3"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line bg-white">
                            {items.map((apiDoc) => (
                              <tr key={apiDoc._id} className="cursor-pointer transition hover:bg-panel" onClick={() => navigate(`/projects/${projectId}/apis/${apiDoc._id}`)}>
                                <td className="px-4 py-3">
                                  <MethodBadge method={apiDoc.method} />
                                </td>
                                <td className="max-w-xs px-4 py-3">
                                  <code className="block truncate font-bold text-ink">{apiDoc.endpoint}</code>
                                </td>
                                <td className="max-w-xs px-4 py-3">
                                  <span className="block truncate font-semibold text-slate-700">{apiDoc.name}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{getStatusLabel(apiDoc.status)}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button className="btn btn-muted h-9 w-9 px-0 text-rose-600 hover:bg-rose-50" onClick={(event) => deleteApi(event, apiDoc)} title="Xóa API">
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
