/**
 * Page title block with icon — used across dashboard pages
 */
export default function PageHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex gap-3">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f2744] to-[#1a4a6e] text-white shadow-sm">
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}
