import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

function AuthLogo() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f2744] shadow-sm">
        <Flame className="h-6 w-6 text-red-500" strokeWidth={2} aria-hidden />
      </div>
      <div>
        <p className="text-lg font-bold tracking-tight text-[#0f2744]">TZW LTD</p>
        <p className="text-xs font-medium text-sky-600">Fire Safety Platform</p>
      </div>
    </div>
  );
}

/**
 * Left panel: logo, title, subtitle, form, footer link
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div>
      <AuthLogo />
      <h1 className="text-2xl font-bold tracking-tight text-[#0f2744]">{title}</h1>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">{footer}</div>}
    </div>
  );
}

export function AuthFooterLink({ text, linkText, to }) {
  return (
    <>
      {text}{' '}
      <Link to={to} className="font-medium text-red-600 hover:text-red-700 hover:underline">
        {linkText}
      </Link>
    </>
  );
}
