/**
 * Form section with icon header (profile, settings)
 */
export default function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        )}
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}
