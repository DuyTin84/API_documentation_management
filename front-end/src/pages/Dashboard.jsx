import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Edit3, Plus, Search, Trash2, X } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/EmptyState";
import * as projectService from "../services/projectService";

const initialForm = {
  name: "",
  description: "",
  baseUrl: "",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingProject, setEditingProject] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const keyword = search.toLowerCase();
      return project.name.toLowerCase().includes(keyword) || project.description.toLowerCase().includes(keyword);
    });
  }, [projects, search]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjects();
      setProjects(response.data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const resetProjectForm = () => {
    setForm(initialForm);
    setEditingProject(null);
  };

  const startEditProject = (project) => {
    setEditingProject(project);
    setForm({
      name: project.name || "",
      description: project.description || "",
      baseUrl: project.baseUrl || "",
    });
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editingProject) {
        await projectService.updateProject(editingProject._id, form);
      } else {
        await projectService.createProject(form);
      }
      resetProjectForm();
      await loadProjects();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (projectId) => {
    if (!window.confirm("Xóa project này và toàn bộ tài liệu API bên trong?")) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      if (editingProject?._id === projectId) {
        resetProjectForm();
      }
      await loadProjects();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Không gian làm việc</p>
          <h1 className="mt-1 text-3xl font-black text-ink">Dự án</h1>
          <p className="mt-2 text-sm text-slate-500">Tạo và quản lý các bộ tài liệu API theo từng dự án.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Tìm project..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form className="h-fit rounded-md border border-line bg-white p-5 shadow-soft" onSubmit={submit}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">{editingProject ? "Chỉnh sửa project" : "Project mới"}</h2>
            {editingProject ? (
              <button type="button" className="btn btn-muted h-8 px-3" onClick={resetProjectForm}>
                <X size={16} />
                Hủy
              </button>
            ) : null}
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Tên project</label>
              <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div>
              <label className="label">Base URL</label>
              <input
                className="input"
                value={form.baseUrl}
                onChange={(event) => setForm({ ...form, baseUrl: event.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </div>
            <div>
              <label className="label">Mô tả</label>
              <textarea className="textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <button className="btn btn-primary w-full" disabled={saving}>
              {editingProject ? <Edit3 size={17} /> : <Plus size={17} />}
              {saving ? (editingProject ? "Đang lưu..." : "Đang tạo...") : editingProject ? "Lưu thay đổi" : "Tạo project"}
            </button>
          </div>
        </form>

        <section>
          {loading ? (
            <div className="rounded-md border border-line bg-white p-8 text-center text-sm text-slate-500">Đang tải danh sách project...</div>
          ) : filteredProjects.length === 0 ? (
            <EmptyState title="Chưa có project" description="Tạo project tài liệu API đầu tiên để bắt đầu thêm endpoint." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredProjects.map((project) => (
                <article
                  key={project._id}
                  className="cursor-pointer rounded-md border border-line bg-white p-5 shadow-soft transition hover:border-accent hover:shadow-lg"
                  onClick={() => navigate(`/projects/${project._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.target === event.currentTarget && event.key === "Enter") {
                      navigate(`/projects/${project._id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-lg font-black text-ink hover:text-accent"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {project.name}
                      </Link>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{project.description || "Chưa có mô tả."}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-muted h-9 w-9 px-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          startEditProject(project);
                        }}
                        title="Sửa project"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn btn-muted h-9 w-9 px-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeProject(project._id);
                        }}
                        title="Xóa project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded bg-panel px-2 py-1">{project.totalApis || 0} API</span>
                    {project.baseUrl ? <span className="max-w-full truncate rounded bg-panel px-2 py-1">{project.baseUrl}</span> : null}
                    <span className="ml-auto inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-accent">
                      Mở project
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
