"use client";

// CRUD categories + menu items, inline price edit, toggle availability
import { useState } from "react";

type Category = { id: string; name: string; menuItems: { id: string }[] };
type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  portionSize?: string | null;
  isAvailable: boolean;
  categoryId: string;
  category: { name: string };
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(n) + " so‘m";
}

export default function MenuManager({
  initialCategories,
  initialMenuItems,
}: {
  initialCategories: Category[];
  initialMenuItems: MenuItem[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [newCatName, setNewCatName] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState("");
  const [priceSavedId, setPriceSavedId] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const addCategory = () => {
    if (!newCatName.trim()) return;
    fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim() }),
    })
      .then((r) => r.json())
      .then((cat) => {
        setCategories((prev) => [...prev, { ...cat, menuItems: [] }]);
        setNewCatName("");
      })
      .catch(console.error);
  };

  const deleteCategory = (id: string) => {
    if (!confirm("Kategoriyani o‘chirish?")) return;
    fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      .then(() => setCategories((prev) => prev.filter((c) => c.id !== id)))
      .then(() => setMenuItems((prev) => prev.filter((i) => i.categoryId !== id)))
      .catch(console.error);
  };

  const updateCategoryName = (id: string, name: string) => {
    if (!name.trim()) return;
    fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
      .then((r) => r.json())
      .then((updated) =>
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: updated.name } : c))
        )
      )
      .catch(console.error);
  };

  const savePrice = (id: string) => {
    const val = parseInt(editPriceVal, 10);
    if (isNaN(val) || val < 0) return;
    fetch(`/api/admin/menu-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: val }),
    })
      .then((r) => r.json())
      .then((updated) => {
        setMenuItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, price: updated.price } : i))
        );
        setEditingPriceId(null);
        setPriceSavedId(id);
        setTimeout(() => setPriceSavedId(null), 2000);
      })
      .catch(console.error);
  };

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleAvailability = (item: MenuItem) => {
    fetch(`/api/admin/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    })
      .then((r) => r.json())
      .then((updated) =>
        setMenuItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: updated.isAvailable } : i))
        )
      )
      .catch(console.error);
  };

  const deleteMenuItem = (id: string) => {
    if (!confirm("Mahsulotni o‘chirish?")) return;
    fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" })
      .then(() => setMenuItems((prev) => prev.filter((i) => i.id !== id)))
      .catch(console.error);
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-stone-700 mb-3">Kategoriyalar</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Yangi kategoriya nomi"
            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg"
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Qo‘shish
          </button>
        </div>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={c.name}
                onBlur={(e) => updateCategoryName(c.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => deleteCategory(c.id)}
                className="px-2 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
              >
                O‘chirish
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-stone-700 mb-3">Mahsulotlar</h2>
        <AddMenuItemForm
          categories={categories}
          onAdded={(item) => setMenuItems((prev) => [...prev, item])}
        />
        <div className="mt-4 space-y-4">
          {categories.map((cat) => {
            const itemsInCat = menuItems.filter((i) => i.categoryId === cat.id);
            const isCollapsed = collapsedCats.has(cat.id);
            return (
              <div key={cat.id} className="border border-stone-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapse(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-stone-50 hover:bg-stone-100 text-left font-medium text-stone-800"
                >
                  <span>{cat.name}</span>
                  <span className="text-stone-500 text-sm">
                    {itemsInCat.length} ta · {isCollapsed ? "▼" : "▲"}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="p-2 space-y-2">
                    {itemsInCat.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center gap-2 bg-white border border-stone-200 rounded-lg p-3"
                      >
                        <span className="font-medium text-stone-800">{item.name}</span>
                        {editingPriceId === item.id ? (
                          <>
                            <input
                              type="number"
                              value={editPriceVal}
                              onChange={(e) => setEditPriceVal(e.target.value)}
                              className="w-24 px-2 py-1 border rounded"
                            />
                            <button
                              type="button"
                              onClick={() => savePrice(item.id)}
                              className="text-sm text-emerald-600"
                            >
                              Saqlash
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="text-sm text-stone-500"
                            >
                              Bekor
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-stone-600">{formatPrice(item.price)}</span>
                            {priceSavedId === item.id && (
                              <span className="text-xs text-emerald-600 font-medium">Saqlandi!</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setEditPriceVal(String(item.price));
                              }}
                              className="text-sm text-emerald-600 hover:underline"
                            >
                              Tahrirlash
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleAvailability(item)}
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            item.isAvailable
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                          title={item.isAvailable ? "Mavjud (bosib o‘chirish)" : "Mavjud emas (bosib yoqish)"}
                        >
                          {item.isAvailable ? "Mavjud" : "Yo‘q"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMenuItem(item.id)}
                          className="text-sm text-red-600 hover:bg-red-50 rounded px-1"
                        >
                          O‘chirish
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AddMenuItemForm({
  categories,
  onAdded,
}: {
  categories: Category[];
  onAdded: (item: MenuItem) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [portionSize, setPortionSize] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(price, 10);
    if (!name.trim() || isNaN(p) || p < 0 || !categoryId) return;
    fetch("/api/admin/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        price: p,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        ingredients: ingredients.trim() || undefined,
        allergens: allergens.trim() || undefined,
        portionSize: portionSize.trim() || undefined,
        categoryId,
      }),
    })
      .then((r) => r.json())
      .then((item) => {
        onAdded(item);
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setIngredients("");
        setAllergens("");
        setPortionSize("");
      })
      .catch(console.error);
  };

  if (categories.length === 0) return <p className="text-stone-500">Avval kategoriya qo‘shing.</p>;

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nomi"
          required
          className="px-3 py-2 border border-stone-300 rounded-lg w-40"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Narx (so‘m)"
          required
          min={0}
          className="px-3 py-2 border border-stone-300 rounded-lg w-28"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tavsif"
          className="px-3 py-2 border border-stone-300 rounded-lg w-48"
        />
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Rasm URL (ixtiyoriy)"
          className="px-3 py-2 border border-stone-300 rounded-lg w-52"
        />
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Ingredientlar (ixtiyoriy)"
          className="px-3 py-2 border border-stone-300 rounded-lg w-48"
        />
        <input
          type="text"
          value={allergens}
          onChange={(e) => setAllergens(e.target.value)}
          placeholder="Allergenlar (ixtiyoriy)"
          className="px-3 py-2 border border-stone-300 rounded-lg w-40"
        />
        <input
          type="text"
          value={portionSize}
          onChange={(e) => setPortionSize(e.target.value)}
          placeholder="Poriya (ixtiyoriy)"
          className="px-3 py-2 border border-stone-300 rounded-lg w-32"
        />
        <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="px-3 py-2 border border-stone-300 rounded-lg"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Qo‘shish
        </button>
      </div>
    </form>
  );
}
