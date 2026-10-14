import { Plus, Trash2 } from "lucide-react";

const emptyResponse = {
  statusCode: 200,
  description: "",
  body: "{\n  \n}",
};

const ResponseEditor = ({ value, onChange }) => {
  const items = value?.length ? value : [];

  const updateItem = (index, key, nextValue) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: nextValue } : item)));
  };

  const addItem = () => {
    onChange([...items, { ...emptyResponse }]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <section className="rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-bold text-ink">Responses</h3>
        <button type="button" className="btn btn-muted h-8 px-3" onClick={addItem}>
          <Plus size={16} />
          Thêm
        </button>
      </div>

      <div className="space-y-4 p-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có response.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="rounded-md border border-line bg-panel p-4">
              <div className="grid gap-3 md:grid-cols-[140px_1fr_40px]">
                <div>
                  <label className="label">Status code</label>
                  <input
                    type="number"
                    className="input"
                    value={item.statusCode}
                    onChange={(event) => updateItem(index, "statusCode", event.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Mô tả</label>
                  <input
                    className="input"
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button type="button" className="btn btn-muted h-10 w-10 px-0" onClick={() => removeItem(index)} title="Xóa response">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="label">Body JSON</label>
                <textarea
                  className="textarea font-mono"
                  value={item.body}
                  onChange={(event) => updateItem(index, "body", event.target.value)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ResponseEditor;
