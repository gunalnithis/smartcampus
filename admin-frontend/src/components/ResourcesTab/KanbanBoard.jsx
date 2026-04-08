import { RESOURCE_TYPES } from "../../utils/constants";
import { ResourceCard } from "./ResourceCard";

export function KanbanBoard({ resources, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {RESOURCE_TYPES.map((typeOption) => {
        const resourcesByType = resources.filter(
          (r) => r.type === typeOption.value,
        );
        return (
          <div
            key={typeOption.value}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeOption.icon}</span>
                <h3 className="font-bold text-slate-900">{typeOption.label}</h3>
              </div>
              <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">
                {resourcesByType.length}
              </span>
            </div>

            <div className="space-y-3">
              {resourcesByType.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">
                  No {typeOption.label.toLowerCase()} yet
                </p>
              ) : (
                resourcesByType.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
