import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Edit3, Plus, Search, Trash2, X } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/EmptyState";
import { useFeedback } from "../hooks/useFeedback";
import * as projectService from "../services/projectService";

const initialForm = {
  name: "",
  description: "",
  baseUrl: "",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast, confirm } = useFeedback();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingProject, setEditingProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const keyword = search.toLowerCase();
      return (
        project.name.toLowerCase().includes(keyword) ||
        project.description.toLowerCase().includes(keyword)
      );
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

  useEffect(() => {
    document.body.style.overflow = isFormOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen]);

  const closeProjectForm = () => {
    setForm(initialForm);
    setEditingProject(null);
    setIsFormOpen(false);
    setError("");
  };

  const openCreateProject = () => {
    setForm(initialForm);
    setEditingProject(null);
    setIsFormOpen(true);
    setError("");
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setForm({
      name: project.name || "",
      description: project.description || "",
      baseUrl: project.baseUrl || "",
    });
    setIsFormOpen(true);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const trimmedName = form.name.trim();
      const trimmedBaseUrl = form.baseUrl.trim();

      if (!trimmedName) {
        throw new Error("Vui lòng nhập tên project");
      }

      if (trimmedName.length < 2) {
        throw new Error("Tên project phải có ít nhất 2 ký tự");
      }

      if (trimmedBaseUrl) {
        const parsedUrl = new URL(trimmedBaseUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Base URL phải bắt đầu bằng http:// hoặc https://");
        }
      }

      if (editingProject) {
        await projectService.updateProject(editingProject._id, form);
        toast.success("Đã cập nhật project", "Thông tin project đã được lưu.");
      } else {
        await projectService.createProject(form);
        toast.success(
          "Đã tạo project",
          "Bạn có thể bắt đầu thêm tài liệu API.",
        );
      }
      closeProjectForm();
      await loadProjects();
    } catch (submitError) {
      const message =
        submitError instanceof TypeError
          ? "Base URL không đúng định dạng"
          : submitError.message;
      setError(message);
      toast.error(
        editingProject ? "Cập nhật project thất bại" : "Tạo project thất bại",
        message,
      );
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (projectId) => {
    const approved = await confirm({
      title: "Xóa project?",
      message:
        "Project và toàn bộ tài liệu API bên trong sẽ bị xóa. Thao tác này không thể hoàn tác.",
      confirmText: "Xóa project",
      cancelText: "Hủy",
      variant: "danger",
    });

    if (!approved) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      if (editingProject?._id === projectId) {
        closeProjectForm();
      }
      await loadProjects();
      toast.success("Đã xóa project", "Project đã được xóa khỏi danh sách.");
    } catch (deleteError) {
      setError(deleteError.message);
      toast.error("Xóa project thất bại", deleteError.message);
    }
  };

  return (
    <AppLayout>
      <div className="mb-4 border-b border-line pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            {/* <p className="text-xs font-bold uppercase tracking-wide text-accent">Quản lý tài liệu API</p> */}
            <h1 className="mt-0.5 text-2xl font-black text-ink">
              Danh sách project
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý các bộ tài liệu và endpoint theo từng project.
            </p>
          </div>
          <button
            className="btn btn-primary shrink-0"
            onClick={openCreateProject}
          >
            <Plus size={17} />
            Tạo project
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-lg">
            <Search
              className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              className="input pl-10"
              placeholder="Tìm project..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <p className="shrink-0 text-sm font-semibold text-slate-500">
            {filteredProjects.length} project
          </p>
        </div>
      </div>

      {error && !isFormOpen ? (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section>
        {loading ? (
          <div className="rounded-md border border-line bg-white p-8 text-center text-sm text-slate-500">
            Đang tải danh sách project...
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="Chưa có project"
            description="Tạo project tài liệu API đầu tiên để bắt đầu thêm endpoint."
            action={
              <button className="btn btn-primary" onClick={openCreateProject}>
                <Plus size={17} />
                Tạo project
              </button>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project._id}
                className="cursor-pointer rounded-md border border-line bg-white p-4 shadow-soft transition hover:border-accent hover:shadow-lg"
                onClick={() => navigate(`/projects/${project._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    event.key === "Enter"
                  ) {
                    navigate(`/projects/${project._id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/projects/${project._id}`}
                      className="break-words text-lg font-black text-ink hover:text-accent"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {project.name}
                    </Link>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-500">
                      {project.description || "Chưa có mô tả."}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="btn btn-muted h-9 w-9 px-0"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditProject(project);
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
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="rounded bg-panel px-2 py-1">
                    {project.totalApis || 0} API
                  </span>
                  {project.baseUrl ? (
                    <span className="max-w-full truncate rounded bg-panel px-2 py-1">
                      {project.baseUrl}
                    </span>
                  ) : null}
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

      {isFormOpen ? (
        <div className="modal-backdrop" onMouseDown={closeProjectForm}>
          <form
            className="modal-panel"
            onSubmit={submit}
            onMouseDown={(event) => event.stopPropagation()}
            noValidate
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-ink">
                  {editingProject ? "Chỉnh sửa project" : "Tạo project"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingProject
                    ? "Cập nhật tên, base URL và mô tả của project."
                    : "Khai báo thông tin cơ bản trước khi thêm API."}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-muted h-9 w-9 shrink-0 px-0"
                onClick={closeProjectForm}
                title="Đóng"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {error ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label className="label">Tên project</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  minLength={2}
                  maxLength={120}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Base URL</label>
                <input
                  className="input"
                  type="url"
                  value={form.baseUrl}
                  onChange={(event) =>
                    setForm({ ...form, baseUrl: event.target.value })
                  }
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div>
                <label className="label">Mô tả</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-line bg-panel px-5 py-4">
              <button
                type="button"
                className="btn btn-muted"
                onClick={closeProjectForm}
              >
                Hủy
              </button>
              <button className="btn btn-primary" disabled={saving}>
                {editingProject ? <Edit3 size={17} /> : <Plus size={17} />}
                {saving
                  ? editingProject
                    ? "Đang lưu..."
                    : "Đang tạo..."
                  : editingProject
                    ? "Lưu thay đổi"
                    : "Tạo project"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AppLayout>
  );
};

export default Dashboard;
