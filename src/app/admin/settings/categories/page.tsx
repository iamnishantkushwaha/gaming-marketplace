"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { CategoryRecord } from "@/lib/types";
import { genId } from "@/lib/format";

export default function AdminCategoriesPage() {
  const { state, dispatch, toast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setParentId("");
    setModalOpen(true);
  }

  function openEdit(c: CategoryRecord) {
    setEditing(c);
    setName(c.name);
    setParentId(c.parentId ?? "");
    setModalOpen(true);
  }

  function save() {
    if (editing) {
      dispatch({ type: "UPDATE_CATEGORY", categoryId: editing.id, patch: { name, parentId: parentId || undefined } });
      toast("Category updated");
    } else {
      dispatch({
        type: "ADD_CATEGORY",
        category: { id: genId("c"), name, parentId: parentId || undefined, commissionRate: 10, active: true, listingCount: 0 },
      });
      toast("Category created");
    }
    setModalOpen(false);
  }

  function remove() {
    if (deleteTarget) dispatch({ type: "DELETE_CATEGORY", categoryId: deleteTarget });
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="gt-page-title">Categories</h1>
        <button onClick={openCreate} className="gt-btn-primary">
          Add category
        </button>
      </div>

      <Table>
        <THead>
          <Th>Category name</Th>
          <Th>Parent</Th>
          <Th>Listings</Th>
          <Th>Active</Th>
          <Th></Th>
        </THead>
        <TBody>
          {state.categories.map((c) => (
            <Tr key={c.id}>
              <Td className="text-base-100">{c.name}</Td>
              <Td className="text-base-400">{state.categories.find((p) => p.id === c.parentId)?.name ?? "—"}</Td>
              <Td className="text-base-400">{c.listingCount}</Td>
              <Td>
                <Switch
                  checked={c.active}
                  onChange={() => dispatch({ type: "UPDATE_CATEGORY", categoryId: c.id, patch: { active: !c.active } })}
                  aria-label={`Toggle ${c.name} active`}
                />
              </Td>
              <Td className="text-right space-x-2">
                <button onClick={() => openEdit(c)} className="text-xs font-medium gt-link">
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(c.id)} className="text-xs font-medium text-accent-rose">
                  Delete
                </button>
              </Td>
            </Tr>
          ))}
        </TBody>
        {state.categories.map((c) => (
          <MobileRow key={c.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-base-100 text-sm">{c.name}</p>
              <Switch
                checked={c.active}
                onChange={() => dispatch({ type: "UPDATE_CATEGORY", categoryId: c.id, patch: { active: !c.active } })}
                aria-label={`Toggle ${c.name} active`}
              />
            </div>
            <MobileRowLine label="Parent" value={state.categories.find((p) => p.id === c.parentId)?.name ?? "—"} />
            <MobileRowLine label="Listings" value={c.listingCount} />
            <div className="flex items-center gap-3 pt-1">
              <button onClick={() => openEdit(c)} className="text-xs font-medium gt-link">
                Edit
              </button>
              <button onClick={() => setDeleteTarget(c.id)} className="text-xs font-medium text-accent-rose">
                Delete
              </button>
            </div>
          </MobileRow>
        ))}
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "Add category"}
        footer={
          <>
            <button className="gt-btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="gt-btn-primary" disabled={!name.trim()} onClick={save}>
              {editing ? "Save" : "Create"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="gt-input" />
          <Select
            value={parentId}
            onChange={(v) => setParentId(v)}
            placeholder="None"
            options={[
              { value: "", label: "None" },
              ...state.categories.filter((c) => c.id !== editing?.id).map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete this category?"
        message="Listings in this category will need to be recategorized."
        confirmLabel="Delete"
      />
    </div>
  );
}
