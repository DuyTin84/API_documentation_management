import MethodBadge from "./MethodBadge";
import JsonBlock from "./JsonBlock";

const FieldTable = ({ title, rows, showValue = false }) => (
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
                <td className="px-3 py-2">{row.required ? "Có" : "Không"}</td>
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
    <div className="space-y-5">
      <div className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <MethodBadge method={apiDoc.method} />
          <code className="break-all rounded bg-slate-100 px-3 py-1 text-sm font-semibold text-ink">{apiDoc.endpoint}</code>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{apiDoc.status}</span>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-ink">{apiDoc.name}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{apiDoc.description || "Chưa có mô tả."}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tag: {apiDoc.tag || "General"}</p>
      </div>

      <FieldTable title="Headers" rows={apiDoc.headers} showValue />
      <FieldTable title="Path Params" rows={apiDoc.pathParams} />
      <FieldTable title="Query Params" rows={apiDoc.queryParams} />

      <section>
        <h3 className="mb-2 text-sm font-bold text-ink">Request Body</h3>
        <JsonBlock value={apiDoc.requestBody} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-ink">Responses</h3>
        {apiDoc.responses?.map((response, index) => (
          <div key={index} className="rounded-md border border-line bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
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
