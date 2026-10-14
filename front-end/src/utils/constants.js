export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const STATUSES = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã công bố" },
  { value: "deprecated", label: "Ngừng sử dụng" },
];

export const methodColors = {
  GET: "bg-emerald-100 text-emerald-800 border-emerald-200",
  POST: "bg-sky-100 text-sky-800 border-sky-200",
  PUT: "bg-amber-100 text-amber-800 border-amber-200",
  PATCH: "bg-violet-100 text-violet-800 border-violet-200",
  DELETE: "bg-rose-100 text-rose-800 border-rose-200",
};
