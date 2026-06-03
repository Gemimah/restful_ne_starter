export default function ChartCard({ title, subtitle, children, className = '', bodyClassName = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className={`mt-3 h-64 w-full min-h-[200px] ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export function ChartEmpty({ message = 'No data yet' }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
      {message}
    </div>
  );
}
