import { Plus, Trash2 } from "lucide-react";

const emptyField = { key: "", value: "", type: "string", required: false, description: "" };

const FieldEditor = ({ title, value, onChange, showValue = false }) => {
  const items = value?.length ? value : [];

  const updateItem = (index, key, nextValue) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: nextValue } : item)));
  };

  const addItem = () => {
    onChange([...items, { ...emptyField }]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <section className="rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <button type="button" className="btn btn-muted h-8 px-3" onClick={addItem}>
          <Plus size={16} />
          Thêm
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-44 px-3 py-2">Key</th>
              {showValue ? <th className="w-44 px-3 py-2">Value</th> : null}
              <th className="w-32 px-3 py-2">Kiểu</th>
              <th className="w-24 px-3 py-2">Bắt buộc</th>
              <th className="px-3 py-2">Mô tả</th>
              <th className="w-16 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.length === 0 ? (
              <tr>
                <td colSpan={showValue ? 6 : 5} className="px-3 py-5 text-center text-slate-500">
                  Chưa có field.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2">
                    <input className="input" value={item.key} onChange={(event) => updateItem(index, "key", event.target.value)} />
                  </td>
                  {showValue ? (
                    <td className="px-3 py-2">
                      <input
                        className="input"
                        value={item.value}
                        onChange={(event) => updateItem(index, "value", event.target.value)}
                      />
                    </td>
                  ) : null}
                  <td className="px-3 py-2">
                    <select className="input" value={item.type} onChange={(event) => updateItem(index, "type", event.target.value)}>
                      <option>string</option>
                      <option>number</option>
                      <option>boolean</option>
                      <option>object</option>
                      <option>array</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-line text-accent"
                      checked={item.required}
                      onChange={(event) => updateItem(index, "required", event.target.checked)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="input"
                      value={item.description}
                      onChange={(event) => updateItem(index, "description", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="btn btn-muted h-9 w-9 px-0" onClick={() => removeItem(index)} title="Xóa field">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FieldEditor;
