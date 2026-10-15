const EmptyState = ({ title, description, action }) => {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-md border border-dashed border-line bg-white p-6 text-center">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
