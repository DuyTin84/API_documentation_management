import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import FieldEditor from "./FieldEditor";
import ResponseEditor from "./ResponseEditor";
import { METHODS, STATUSES } from "../utils/constants";

const initialForm = {
  name: "",
  description: "",
  method: "GET",
  endpoint: "",
  tag: "General",
  status: "draft",
  headers: [],
  pathParams: [],
  queryParams: [],
  requestBody: "{\n  \n}",
  responses: [{ statusCode: 200, description: "Phản hồi thành công", body: "{\n  \n}" }],
};

const formatJson = (value) => JSON.stringify(value ?? {}, null, 2);

const ApiForm = ({ apiDoc, onSubmit, onCancel, saving }) => {
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
      JSON.parse(form.requestBody || "{}");
      form.responses.forEach((response) => JSON.parse(response.body || "{}"));
      await onSubmit(form);
    } catch (submitError) {
      setError(submitError.message === "Unexpected end of JSON input" ? "Nội dung JSON không hợp lệ" : submitError.message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="rounded-md border border-line bg-white p-4">
        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div>
            <label className="label">Method</label>
            <select className="input" value={form.method} onChange={(event) => update("method", event.target.value)}>
              {METHODS.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Endpoint</label>
            <input className="input" value={form.endpoint} onChange={(event) => update("endpoint", event.target.value)} placeholder="/users/:id" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Tên API</label>
            <input className="input" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Lấy chi tiết người dùng" />
          </div>
          <div>
            <label className="label">Tag / Module</label>
            <input className="input" value={form.tag} onChange={(event) => update("tag", event.target.value)} placeholder="Users" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
          <div>
            <label className="label">Mô tả</label>
            <textarea className="textarea" value={form.description} onChange={(event) => update("description", event.target.value)} />
          </div>
          <div>
            <label className="label">Trạng thái</label>
            <select className="input" value={form.status} onChange={(event) => update("status", event.target.value)}>
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <FieldEditor title="Headers" value={form.headers} onChange={(value) => update("headers", value)} showValue />
      <FieldEditor title="Path Params" value={form.pathParams} onChange={(value) => update("pathParams", value)} />
      <FieldEditor title="Query Params" value={form.queryParams} onChange={(value) => update("queryParams", value)} />

      <section className="rounded-md border border-line bg-white p-4">
        <label className="label">Request Body JSON</label>
        <textarea className="textarea min-h-52 font-mono" value={form.requestBody} onChange={(event) => update("requestBody", event.target.value)} />
      </section>

      <ResponseEditor value={form.responses} onChange={(value) => update("responses", value)} />

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
