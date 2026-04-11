import { ResourceForm } from "./ResourceForm";
import { KanbanBoard } from "./KanbanBoard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ResourcesTab({
  resources,
  form,
  onChange,
  onImageChange,
  onImageClear,
  onSubmit,
  onCancel,
  editing,
  busy,
  resourceInfo,
  onEdit,
  onDelete,
  adminUserId,
  adminName,
}) {
  const normalizeBuildingLabel = (value) =>
    String(value || "")
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const normalizeTypeLabel = (value) =>
    String(value || "")
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const resourceCountByBuilding = (resources || []).reduce((acc, resource) => {
    const key = resource?.building;
    if (!key) {
      return acc;
    }
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());

  const chartData = Array.from(resourceCountByBuilding.entries()).map(
    ([building, totalResources]) => ({
      building: normalizeBuildingLabel(building),
      totalResources,
    }),
  );

  const resourceCountByType = (resources || []).reduce((acc, resource) => {
    const key = resource?.type;
    if (!key) {
      return acc;
    }
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());

  const typeChartData = Array.from(resourceCountByType.entries()).map(
    ([type, totalResources]) => ({
      type: normalizeTypeLabel(type),
      totalResources,
    }),
  );

  return (
    <div className="space-y-6">
      {adminUserId && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <p className="text-sky-900 font-medium">
            👤 Acting as User:{" "}
            <strong>{adminName || adminUserId.slice(0, 8)}</strong>
          </p>
        </div>
      )}

      <ResourceForm
        form={form}
        onChange={onChange}
        onImageChange={onImageChange}
        onImageClear={onImageClear}
        onSubmit={(e) => onSubmit(e, adminUserId)}
        onCancel={onCancel}
        editing={editing}
        busy={busy}
        resourceInfo={resourceInfo}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Resource Distribution by Building
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Histogram of resources grouped by selected building type
        </p>
        {chartData.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center">
            No resource buildings available yet.
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="building" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="totalResources"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Resource Distribution by Type
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Histogram of resources grouped by selected resource type
        </p>
        {typeChartData.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center">
            No resource types available yet.
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="totalResources"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-slate-700 text-lg font-semibold">
            No resources created yet
          </p>
          <p className="text-slate-500 mt-1">
            Create one using the form above to get started
          </p>
        </div>
      ) : (
        <KanbanBoard
          resources={resources}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
