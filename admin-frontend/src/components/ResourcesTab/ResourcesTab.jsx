import { ResourceForm } from "./ResourceForm";
import { KanbanBoard } from "./KanbanBoard";

export function ResourcesTab({
  resources,
  form,
  onChange,
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
  return (
    <div className="space-y-6">
      {adminUserId && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <p className="text-sky-900 font-medium">
            🔐 Acting as Admin:{" "}
            <strong>{adminName || adminUserId.slice(0, 8)}</strong>
          </p>
        </div>
      )}

      <ResourceForm
        form={form}
        onChange={onChange}
        onSubmit={(e) => onSubmit(e, adminUserId)}
        onCancel={onCancel}
        editing={editing}
        busy={busy}
        resourceInfo={resourceInfo}
      />

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
