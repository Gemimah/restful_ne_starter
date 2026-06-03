/**
 * Text input with leading icon (forms)
 */
export default function IconInput({
  icon: Icon,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
          aria-hidden
        />
      )}
      <input
        {...props}
        className={`w-full rounded-lg border border-slate-200 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 ${
          Icon ? 'pl-10 pr-3' : 'px-3'
        } ${inputClassName}`}
      />
    </div>
  );
}
