import { formatJsonValue } from "../utils/jsonValidation";

const JsonBlock = ({ value }) => {
  const content = formatJsonValue(value);

  return (
    <pre className="max-h-96 overflow-auto rounded-md border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
      <code>{content}</code>
    </pre>
  );
};

export default JsonBlock;
