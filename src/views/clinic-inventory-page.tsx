import { useEffect, useState } from "react";
import { SectionPage } from "@/components/section-page";
import {
  fallbackInventory,
  getInventoryItems,
  saveInventoryItem,
  type InventoryRecord,
} from "@/lib/data/clinic-operations";
import { deleteInventoryItem } from "@/lib/data/onboarding";
import { clinicNavigation } from "@/lib/navigation";

export function ClinicInventoryPage() {
  const [items, setItems] = useState<InventoryRecord[]>(fallbackInventory);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    itemName: "",
    sku: "",
    quantity: 0,
    reorderLevel: 0,
    unit: "box",
  });

  async function loadInventory() {
    const result = await getInventoryItems();
    setItems(result);
  }

  useEffect(() => {
    void loadInventory();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      await saveInventoryItem(form);
      await loadInventory();
      setForm({ itemName: "", sku: "", quantity: 0, reorderLevel: 0, unit: "box" });
      setMessage("Inventory item saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save inventory item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await deleteInventoryItem(itemId);
      await loadInventory();
      setMessage("Inventory item deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete inventory item.");
    }
  }

  const lowStockCount = items.filter((item) => item.quantity <= item.reorderLevel).length;

  return (
    <SectionPage
      title="Clinic Workspace"
      subtitle="Daily operations for front desk, doctors, and billing."
      navItems={clinicNavigation}
      eyebrow="Inventory"
      heading="Drug Stock and Supply Alerts"
      lead="Track medicines, supplies, and low-stock items so the front desk and dispensing desk can avoid surprises."
      metrics={[
        { label: "Low Stock Items", value: String(lowStockCount), note: "needs reorder soon" },
        { label: "Active SKUs", value: String(items.length), note: "live inventory count" },
        { label: "Stock Units", value: String(items.reduce((sum, item) => sum + item.quantity, 0)), note: "units currently on hand" },
      ]}
    >
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-2 text-sm xl:col-span-2">
          <span className="font-semibold text-[#284238]">Item name</span>
          <input
            value={form.itemName}
            onChange={(event) => setForm((current) => ({ ...current, itemName: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">SKU</span>
          <input
            value={form.sku}
            onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Quantity</span>
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Reorder level</span>
          <input
            type="number"
            min="0"
            value={form.reorderLevel}
            onChange={(event) => setForm((current) => ({ ...current, reorderLevel: Number(event.target.value) }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Unit</span>
          <input
            value={form.unit}
            onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <div className="flex items-end gap-3 xl:col-span-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Inventory Item"}
          </button>
          {message ? <p className="text-sm text-[#284238]">{message}</p> : null}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.13em] text-[#6c857a]">
            <tr>
              <th className="pb-3">Item</th>
              <th className="pb-3">SKU</th>
              <th className="pb-3">Quantity</th>
              <th className="pb-3">Reorder</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((stock) => (
              <tr key={stock.id} className="border-t border-[var(--line)]">
                <td className="py-3 font-semibold text-[#19382b]">{stock.itemName}</td>
                <td className="py-3 text-[#33473d]">{stock.sku || "-"}</td>
                <td className="py-3 text-[#33473d]">{stock.quantity} {stock.unit}</td>
                <td className="py-3 text-[#33473d]">{stock.reorderLevel}</td>
                <td className="py-3 text-[#33473d]">{stock.quantity <= stock.reorderLevel ? "Low stock" : "Healthy"}</td>
                <td className="py-3">
                  <button
                    onClick={() => void handleDelete(stock.id)}
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[#6a342a] hover:bg-[#fff3ef]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  );
}