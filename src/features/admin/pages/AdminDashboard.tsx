export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Panel de Control</h1>
        </div>
        <p className="text-blue-100 text-lg">FormatoSoft</p>
      </div>
    </div>
  );
}

// Helper components
function EventItem({
  title,
  status,
  date,
}: {
  title: string;
  status: string;
  date: string;
}) {
  const statusColors = {
    "En Curso": "bg-green-100 text-green-800 border-green-200",
    Programado: "bg-blue-100 text-blue-800 border-blue-200",
    Finalizado: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer group">
      <div className="flex-1">
        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </p>
        <p className="text-sm text-slate-500 mt-1">{date}</p>
      </div>
      <span
        className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
          statusColors[status as keyof typeof statusColors]
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function QuickActionButton({
  label,
  icon,
  color = "blue",
}: {
  label: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "indigo";
}) {
  const colors = {
    blue: "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-50 hover:bg-green-100 text-green-600 border-green-200",
    purple:
      "bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200",
    indigo:
      "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200",
  };

  return (
    <button
      className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all hover:shadow-md active:scale-95 ${colors[color]}`}
    >
      <div className="mb-3">{icon}</div>
      <span className="text-sm font-semibold text-center">{label}</span>
    </button>
  );
}
