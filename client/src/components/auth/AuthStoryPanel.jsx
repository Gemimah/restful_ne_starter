const features = [
  { title: 'Live compliance', desc: 'Track expiry and inspection status in one place.' },
  { title: 'Field-ready workflows', desc: 'Inspectors log maintenance from any device.' },
  { title: 'Clear reporting', desc: 'Export CSV and PDF for audits and management.' },
];

function MockStat({ label, value, accent }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-wide text-sky-200/80">{label}</p>
      <p className={`text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default function AuthStoryPanel() {
  return (
    <div className="relative flex h-full min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#1a4a6e] to-[#1e5c4a] p-10 text-white">
      {/* Soft grassy light */}
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-emerald-900/30 to-transparent"
        aria-hidden
      />

      <div className="relative z-10">
        <p className="text-sm font-medium text-sky-200">Operational confidence</p>
        <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight text-white">
          Fire extinguisher management built for real facilities
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-sky-100/90">
          Monitor inventory, schedule inspections, and stay compliant — without spreadsheets.
        </p>
      </div>

      {/* Dashboard preview — simple, not cluttered */}
      <div className="relative z-10 my-8 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md">
        <p className="text-xs font-medium uppercase tracking-wider text-sky-200">Dashboard preview</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MockStat label="Units" value="128" accent="text-white" />
          <MockStat label="Pending" value="12" accent="text-amber-200" />
          <MockStat label="Compliance" value="94%" accent="text-emerald-200" />
        </div>
        <div className="mt-4 flex h-24 items-end gap-2 rounded-lg bg-[#0f2744]/40 px-3 pb-3">
          {[40, 65, 50, 80, 55, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-red-500/80 to-sky-400/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <ul className="relative z-10 space-y-4">
        {features.map((f) => (
          <li key={f.title} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-sky-100/80">{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="relative z-10 text-xs text-sky-200/60">TZW LTD · Fire Extinguisher Management System</p>
    </div>
  );
}
