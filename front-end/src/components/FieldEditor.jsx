import { Plus, Trash2 } from "lucide-react";
import SelectField from "./SelectField";
import { FIELD_TYPES } from "../utils/constants";

const emptyField = { key: "", value: "", type: "string", required: false, description: "" };
const fieldTypeOptions = FIELD_TYPES.map((type) => ({ value: type, label: type }));

const FieldEditor = ({ title, value, onChange, showValue = false, requiredAlways = false }) => {
  const items = value?.length ? value : [];

  const updateItem = (index, key, nextValue) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: nextValue } : item)));
  };

  const addItem = () => {
    onChange([...items, { ...emptyField, required: requiredAlways }]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <section className="rounded-md border border-line bg-white">
      <div className={`flex items-center justify-between px-3 py-2.5 ${items.length ? "border-b border-line" : ""}`}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          <span className="rounded bg-panel px-1.5 py-0.5 text-xs font-semibold text-slate-500">{items.length}</span>
        </div>
        <button type="button" className="btn btn-muted h-8 px-3" onClick={addItem}>
          <Plus size={16} />
          Thêm
        </button>
      </div>

      {items.length ? (
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
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2">
                    <input className="input" value={item.key} onChange={(event) => updateItem(index, "key", event.target.value)} maxLength={80} required />
                  </td>
                  {showValue ? (
                    <td className="px-3 py-2">
                      <input className="input" value={item.value} onChange={(event) => updateItem(index, "value", event.target.value)} maxLength={500} />
                    </td>
                  ) : null}
                  <td className="px-3 py-2">
                    <SelectField value={item.type} options={fieldTypeOptions} onChange={(value) => updateItem(index, "type", value)} placeholder="Type" />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-line text-accent"
                      checked={requiredAlways || item.required}
                      onChange={(event) => updateItem(index, "required", event.target.checked)}
                      disabled={requiredAlways}
                      aria-label={`${item.key || `Field ${index + 1}`} bắt buộc`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input className="input" value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} maxLength={300} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="btn btn-muted h-9 w-9 px-0" onClick={() => removeItem(index)} title="Xóa field">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default FieldEditor;
