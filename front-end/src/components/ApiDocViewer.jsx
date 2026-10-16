import MethodBadge from "./MethodBadge";
import JsonBlock from "./JsonBlock";
import { getStatusLabel } from "../utils/constants";

const hasJsonContent = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== "";
};

const FieldTable = ({ title, rows, showValue = false, requiredAlways = false }) => (
  <section>
    <h3 className="mb-2 text-sm font-bold text-ink">{title}</h3>
    <div className="overflow-x-auto rounded-md border border-line bg-white">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-panel text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Key</th>
            {showValue ? <th className="px-3 py-2">Value</th> : null}
            <th className="px-3 py-2">Kiểu</th>
            <th className="px-3 py-2">Bắt buộc</th>
            <th className="px-3 py-2">Mô tả</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows?.length ? (
            rows.map((row, index) => (
              <tr key={`${row.key}-${index}`}>
                <td className="px-3 py-2 font-semibold">{row.key}</td>
                {showValue ? <td className="px-3 py-2 font-mono text-xs">{row.value || "-"}</td> : null}
                <td className="px-3 py-2">{row.type || "string"}</td>
                <td className="px-3 py-2">{requiredAlways || row.required ? "Có" : "Không"}</td>
                <td className="px-3 py-2 text-slate-600">{row.description || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showValue ? 5 : 4} className="px-3 py-4 text-center text-slate-500">
                Chưa cấu hình.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);

const ApiDocViewer = ({ apiDoc }) => {
  if (!apiDoc) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-line bg-white px-4 py-3 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <MethodBadge method={apiDoc.method} />
          <code className="break-all rounded bg-slate-100 px-2.5 py-1 text-sm font-semibold text-ink">{apiDoc.endpoint}</code>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{getStatusLabel(apiDoc.status)}</span>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">{apiDoc.tag || "General"}</span>
        </div>
        <p className="mt-2 text-sm leading-5 text-slate-600">{apiDoc.description || "Chưa có mô tả."}</p>
      </div>

      {apiDoc.headers?.length ? <FieldTable title="Headers" rows={apiDoc.headers} showValue /> : null}
      {apiDoc.pathParams?.length ? <FieldTable title="Path Params" rows={apiDoc.pathParams} requiredAlways /> : null}
      {apiDoc.queryParams?.length ? <FieldTable title="Query Params" rows={apiDoc.queryParams} /> : null}

      {hasJsonContent(apiDoc.requestBody) ? (
        <section>
          <h3 className="mb-2 text-sm font-bold text-ink">Request Body</h3>
          <JsonBlock value={apiDoc.requestBody} />
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-ink">Responses</h3>
        {apiDoc.responses?.map((response, index) => (
          <div key={index} className="rounded-md border border-line bg-white p-3">
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{response.statusCode}</span>
              <span className="text-sm text-slate-600">{response.description || "Response"}</span>
            </div>
            <JsonBlock value={response.body} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default ApiDocViewer;
