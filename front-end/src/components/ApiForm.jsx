import { useEffect, useMemo, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import FieldEditor from "./FieldEditor";
import ResponseEditor from "./ResponseEditor";
import SelectField from "./SelectField";
import { METHODS, STATUSES } from "../utils/constants";
import { parseJsonInput } from "../utils/jsonValidation";

const initialForm = {
  name: "",
  description: "",
  method: "GET",
  endpoint: "",
  tag: "",
  status: "draft",
  headers: [],
  pathParams: [],
  queryParams: [],
  requestBody: "{\n  \n}",
  responses: [
    { statusCode: 200, description: "Phản hồi thành công", body: "{\n  \n}" },
  ],
};

const formatJson = (value) => JSON.stringify(value ?? {}, null, 2);

const validateFields = (items, label) => {
  items.forEach((item) => {
    const hasValue = item.key || item.value || item.description;
    if (hasValue && !item.key?.trim()) {
      throw new Error(`${label}: vui lòng nhập key cho field đã thêm`);
    }
  });
};

const methodOptions = METHODS.map((method) => ({
  value: method,
  label: method,
}));

const TagInput = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    return [...new Set(["General", ...options].map((option) => option?.trim()).filter(Boolean))].sort((first, second) => first.localeCompare(second));
  }, [options]);

  const filteredOptions = useMemo(() => {
    const keyword = value.trim().toLowerCase();
    if (!keyword) {
      return normalizedOptions;
    }

    return normalizedOptions.filter((option) => option.toLowerCase().includes(keyword));
  }, [normalizedOptions, value]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <input
        className="input"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Chọn hoặc nhập tag"
        maxLength={80}
      />

      {open && filteredOptions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-56 overflow-auto rounded-md border border-line bg-white p-1 shadow-xl">
          {filteredOptions.map((option) => (
            <button
              type="button"
              key={option}
              className={`flex w-full items-center rounded px-3 py-2 text-left text-sm transition ${
                option === value ? "bg-teal-50 font-semibold text-accent" : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

    </div>
  );
};

const ApiForm = ({ apiDoc, availableTags = [], onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!apiDoc) {
      setForm(initialForm);
      return;
    }

    setForm({
      name: apiDoc.name || "",
      description: apiDoc.description || "",
      method: apiDoc.method || "GET",
      endpoint: apiDoc.endpoint || "",
      tag: apiDoc.tag || "General",
      status: apiDoc.status || "draft",
      headers: apiDoc.headers || [],
      pathParams: apiDoc.pathParams || [],
      queryParams: apiDoc.queryParams || [],
      requestBody: formatJson(apiDoc.requestBody),
      responses:
        apiDoc.responses?.map((response) => ({
          ...response,
          body: formatJson(response.body),
        })) || initialForm.responses,
    });
  }, [apiDoc]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (!form.name.trim()) {
        throw new Error("Vui lòng nhập tên API");
      }

      if (!form.endpoint.trim()) {
        throw new Error("Vui lòng nhập endpoint");
      }

      if (!form.endpoint.trim().startsWith("/")) {
        throw new Error("Endpoint phải bắt đầu bằng dấu /");
      }

      validateFields(form.headers, "Headers");
      validateFields(form.pathParams, "Path Params");
      validateFields(form.queryParams, "Query Params");

      parseJsonInput(form.requestBody, "Request Body");
      form.responses.forEach((response, index) => {
        const statusCode = Number(response.statusCode);
        if (
          !Number.isInteger(statusCode) ||
          statusCode < 100 ||
          statusCode > 599
        ) {
          throw new Error(
            "Status code của response phải nằm trong khoảng 100 đến 599",
          );
        }
        parseJsonInput(response.body, `Body của response ${index + 1}`);
      });

      await onSubmit({ ...form, tag: form.tag.trim() || "General" });
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-md border border-line bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <label className="label">Method</label>
            <SelectField
              value={form.method}
              options={methodOptions}
              onChange={(value) => update("method", value)}
              placeholder="Method"
            />
          </div>
          <div className="lg:col-span-7">
            <label className="label">Endpoint</label>
            <input
              className="input"
              value={form.endpoint}
              onChange={(event) => update("endpoint", event.target.value)}
              placeholder="/users/:id"
              maxLength={200}
              required
            />
          </div>
          <div className="lg:col-span-3">
            <label className="label">Trạng thái</label>
            <SelectField
              value={form.status}
              options={STATUSES}
              onChange={(value) => update("status", value)}
              placeholder="Status"
            />
          </div>

          <div className="lg:col-span-6">
            <label className="label">Tên API</label>
            <input
              className="input"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Lấy chi tiết người dùng"
              minLength={2}
              maxLength={160}
              required
            />
          </div>
          <div className="lg:col-span-6">
            <label className="label">Tag / Module</label>
            <TagInput value={form.tag} options={availableTags} onChange={(value) => update("tag", value)} />
          </div>

          <div className="lg:col-span-12">
            <label className="label">Mô tả</label>
            <textarea
              className="textarea min-h-24"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              maxLength={1000}
            />
          </div>
        </div>
      </section>

      <FieldEditor
        title="Headers"
        value={form.headers}
        onChange={(value) => update("headers", value)}
        showValue
      />
      <FieldEditor
        title="Path Params"
        value={form.pathParams}
        onChange={(value) => update("pathParams", value)}
      />
      <FieldEditor
        title="Query Params"
        value={form.queryParams}
        onChange={(value) => update("queryParams", value)}
      />

      <section className="rounded-md border border-line bg-white p-4">
        <label className="label">Request Body JSON</label>
        <textarea
          className="textarea min-h-52 font-mono"
          value={form.requestBody}
          onChange={(event) => update("requestBody", event.target.value)}
          required
        />
      </section>

      <ResponseEditor
        value={form.responses}
        onChange={(value) => update("responses", value)}
      />

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-panel py-4">
        <button type="button" className="btn btn-muted" onClick={onCancel}>
          <X size={17} />
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={17} />
          {saving ? "Đang lưu..." : "Lưu API"}
        </button>
      </div>
    </form>
  );
};

export default ApiForm;
