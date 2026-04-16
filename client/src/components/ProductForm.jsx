// src/components/ProductForm.jsx
import { useState, useEffect } from "react";

export default function ProductForm({
  onSubmit,
  editingProduct,
  onCancelEdit,
}) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: editingProduct.price,
        image: editingProduct.image,
      });
    } else {
      setForm({ name: "", price: "", image: "" });
    }
  }, [editingProduct]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      ...form,
      price: Number(form.price),
    });

    setForm({ name: "", price: "", image: "" });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 400,
        marginBottom: 30,
      }}
    >
      <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

      <input
        name="name"
        placeholder="Product name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        name="price"
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        required
      />

      <input
        name="image"
        placeholder="Image URL"
        value={form.image}
        onChange={handleChange}
        required
      />

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit">{editingProduct ? "Update" : "Add"}</button>

        {editingProduct && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
