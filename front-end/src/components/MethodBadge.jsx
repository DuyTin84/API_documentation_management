import { methodColors } from "../utils/constants";

const MethodBadge = ({ method }) => {
  return (
    <span
      className={`inline-flex min-w-16 items-center justify-center rounded border px-2 py-1 text-xs font-bold ${
        methodColors[method] || "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {method}
    </span>
  );
};

export default MethodBadge;
