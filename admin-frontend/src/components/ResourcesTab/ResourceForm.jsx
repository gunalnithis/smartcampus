import { BUILDING_OPTIONS } from "../../utils/constants";

export function ResourceForm({
  form,
  onChange,
  onImageChange,
  onImageClear,
  onSubmit,
  onCancel,
  editing,
  busy,
  resourceInfo,
  submitLabel,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      <h3 className="text-xl font-bold text-slate-900 mb-5">
        {editing ? "Edit Resource" : "Create New Resource"}
      </h3>

      <div className="mb-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <p className="font-semibold">Booking Visibility Rule</p>
        <p className="mt-1">
          Only <strong>Active</strong> resources with a valid availability
          window are shown on the user booking side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Resource Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Enter name"
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Type *
          </label>
          <select
            name="type"
            value={form.type}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="LAB">Lab</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Capacity *
          </label>
          <input
            type="number"
            min="1"
            name="capacity"
            value={form.capacity}
            onChange={onChange}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Building, Floor"
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Building *
          </label>
          <select
            name="building"
            value={form.building || "MAIN_BUILDING"}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            required
          >
            {BUILDING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Resource Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-slate-500">
            Optional. Choose an image file from your device.
          </p>
          {form.imageUrl ? (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={form.imageUrl}
                alt="Resource preview"
                className="h-16 w-24 rounded-md border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={onImageClear}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition"
              >
                Remove Image
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Available From
          </label>
          <input
            type="time"
            name="availableFrom"
            value={form.availableFrom}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Available To
          </label>
          <input
            type="time"
            name="availableTo"
            value={form.availableTo}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out Of Service</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Describe this resource"
          rows="3"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {resourceInfo && (
        <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-700 text-sm">
          {resourceInfo}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {busy
            ? "Saving..."
            : editing
              ? "Update Resource"
              : submitLabel || "Create Resource"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
