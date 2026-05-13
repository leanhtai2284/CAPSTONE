import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { useMarketCart } from "../context/MarketCartContext";
import { marketService } from "../services/marketService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const MarketCartPage = () => {
  const navigate = useNavigate();
  const { items, summary, updateQuantity, removeItem, clearCart } =
    useMarketCart();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    recipientName: "",
    phone: "",
    address: "",
    notes: "",
  });

  const storeInfo = useMemo(() => {
    if (items.length === 0) return null;
    return { storeId: items[0].storeId, storeName: items[0].storeName };
  }, [items]);

  const handleChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!storeInfo) return;
    if (!shipping.recipientName || !shipping.phone || !shipping.address) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    try {
      setLoading(true);
      await marketService.createOrder({
        storeId: storeInfo.storeId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shipping,
        payment: { method: "cod" },
      });
      toast.success("Đặt hàng thành công!");
      clearCart();
      navigate("/market");
    } catch (error) {
      toast.error(error?.message || "Không thể đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-amber-50 flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-serif font-semibold text-slate-900">
            Giỏ hàng đang trống
          </h2>
          <p className="mt-3 text-slate-600">
            Hãy chọn thêm sản phẩm tươi ngon trước khi thanh toán.
          </p>
          <Link
            to="/market"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Quay lại mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-amber-50 px-4 py-10">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-slate-900">
              Giỏ hàng Market
            </h1>
            <p className="text-sm text-slate-500">
              {storeInfo?.storeName || "Siêu thị"} · {summary.quantity} sản phẩm
            </p>
          </div>
          <Link
            to="/market"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-lg shadow-emerald-100 sm:flex-row sm:items-center"
              >
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
                  }
                  alt={item.name}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500">{item.storeName}</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    {formatCurrency(item.unitPrice)} / {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="h-9 w-9 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[32px] text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="h-9 w-9 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Thành tiền</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-emerald-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <MapPin className="h-4 w-4" />
              Thông tin giao hàng
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={shipping.recipientName}
                onChange={(e) => handleChange("recipientName", e.target.value)}
                placeholder="Họ và tên"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <input
                value={shipping.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Số điện thoại"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <input
                value={shipping.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Địa chỉ nhận hàng"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <textarea
                value={shipping.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-900/5 p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(summary.subtotal)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span>Phí giao hàng</span>
                <span>0đ</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Tổng cộng</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCartPage;
