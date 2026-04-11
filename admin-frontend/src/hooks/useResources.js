import { useState, useCallback } from "react";
import { fetchJson, fetchWithBody, deleteRequest } from "../utils/api";
import { EMPTY_RESOURCE_FORM } from "../utils/constants";

export const useResources = () => {
  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState(EMPTY_RESOURCE_FORM);
  const [editingResourceId, setEditingResourceId] = useState("");
  const [resourceBusy, setResourceBusy] = useState(false);
  const [resourceInfo, setResourceInfo] = useState("");

  const loadResources = useCallback(async () => {
    const resourcesData = await fetchJson("/api/resources");
    setResources(Array.isArray(resourcesData) ? resourcesData : []);
  }, []);

  const handleResourceFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === "capacity") {
      setResourceForm((previous) => ({
        ...previous,
        capacity: value === "" ? "" : Number(value),
      }));
      return;
    }
    setResourceForm((previous) => ({ ...previous, [name]: value }));
  }, []);

  const handleResourceImageChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setResourceInfo("Please select a valid image file.");
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read selected image."));
      reader.readAsDataURL(file);
    });

    setResourceForm((previous) => ({
      ...previous,
      imageUrl: dataUrl,
    }));
    setResourceInfo("Image selected successfully.");
  }, []);

  const clearResourceImage = useCallback(() => {
    setResourceForm((previous) => ({
      ...previous,
      imageUrl: "",
    }));
  }, []);

  const resetResourceForm = useCallback(() => {
    setResourceForm(EMPTY_RESOURCE_FORM);
    setEditingResourceId("");
  }, []);

  const handleEditResource = useCallback((resource) => {
    setEditingResourceId(resource.id);
    setResourceForm({
      name: resource.name || "",
      type: resource.type || "LAB",
      capacity: resource.capacity || 1,
      building: resource.building || "MAIN_BUILDING",
      location: resource.location || "",
      status: resource.status || "ACTIVE",
      description: resource.description || "",
      imageUrl: resource.imageUrl || "",
      availableFrom: resource.availableFrom || "08:00",
      availableTo: resource.availableTo || "18:00",
    });
    setResourceInfo(`Editing resource: ${resource.name}`);
  }, []);

  const handleDeleteResource = useCallback(
    async (resourceId, adminUserId) => {
      const accepted = window.confirm("Delete this resource?");
      if (!accepted) {
        return;
      }

      setResourceBusy(true);
      setResourceInfo("");
      try {
        if (!adminUserId) {
          throw new Error("No user account selected.");
        }

        await deleteRequest(
          `/api/resources/${resourceId}?adminId=${encodeURIComponent(
            adminUserId,
          )}`,
        );
        await loadResources();
        setResourceInfo("Resource deleted successfully.");
        if (editingResourceId === resourceId) {
          resetResourceForm();
        }
      } catch (resourceError) {
        setResourceInfo(
          resourceError.message || "Failed to delete resource.",
        );
      } finally {
        setResourceBusy(false);
      }
    },
    [editingResourceId, loadResources, resetResourceForm],
  );

  const handleResourceSubmit = useCallback(
    async (event, adminUserId) => {
      event.preventDefault();
      setResourceBusy(true);
      setResourceInfo("");

      try {
        if (!adminUserId) {
          throw new Error("No user account selected.");
        }

        if (!resourceForm.name?.trim()) {
          throw new Error("Resource name is required.");
        }

        if (!resourceForm.location?.trim()) {
          throw new Error("Resource location is required.");
        }

        if (!resourceForm.building?.trim()) {
          throw new Error("Please select a building.");
        }

        if (Number(resourceForm.capacity) < 1) {
          throw new Error("Capacity must be at least 1.");
        }

        if (
          resourceForm.availableFrom &&
          resourceForm.availableTo &&
          resourceForm.availableTo <= resourceForm.availableFrom
        ) {
          throw new Error("Available To time must be after Available From time.");
        }

        const payload = {
          ...resourceForm,
          name: resourceForm.name.trim(),
          location: resourceForm.location.trim(),
          description: resourceForm.description?.trim() || "",
          imageUrl: resourceForm.imageUrl?.trim() || "",
          capacity: Number(resourceForm.capacity),
        };

        if (editingResourceId) {
          await fetchWithBody(
            `/api/resources/${editingResourceId}?adminId=${encodeURIComponent(
              adminUserId,
            )}`,
            "PUT",
            payload,
          );
          setResourceInfo(
            payload.status === "ACTIVE"
              ? "Resource updated successfully. It is visible on the user booking side."
              : "Resource updated successfully. Set status to Active to show it on booking side.",
          );
        } else {
          await fetchWithBody(
            `/api/resources?adminId=${encodeURIComponent(adminUserId)}`,
            "POST",
            payload,
          );
          setResourceInfo(
            payload.status === "ACTIVE"
              ? "Resource created successfully. It is now available on the user booking side."
              : "Resource created successfully. Set status to Active to show it on booking side.",
          );
        }

        await loadResources();
        resetResourceForm();
      } catch (resourceError) {
        setResourceInfo(
          resourceError.message || "Failed to save resource.",
        );
      } finally {
        setResourceBusy(false);
      }
    },
    [resourceForm, editingResourceId, loadResources, resetResourceForm],
  );

  return {
    resources,
    setResources,
    resourceForm,
    setResourceForm,
    editingResourceId,
    resourceBusy,
    resourceInfo,
    loadResources,
    handleResourceFieldChange,
    handleResourceImageChange,
    clearResourceImage,
    handleEditResource,
    handleDeleteResource,
    handleResourceSubmit,
    resetResourceForm,
  };
};
