import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus, MapPin, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { useMarketCart } from "../context/MarketCartContext";
import { marketService } from "../services/marketService";
import MapPicker from "../components/ui/MapPicker";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

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
    location: null,
  });
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [storeData, setStoreData] = useState(null);

  // VietQR states
  const [showVietQR, setShowVietQR] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  const storeInfo = useMemo(() => {
    if (items.length === 0) return null;
    return { storeId: items[0].storeId, storeName: items[0].storeName };
  }, [items]);

  useEffect(() => {
    if (storeInfo?.storeId) {
      marketService.getStoreById(storeInfo.storeId).then(res => {
        if (res.success) {
          setStoreData(res.data);
        }
      }).catch(console.error);
    }
  }, [storeInfo]);

  const deliveryFee = useMemo(() => {
    if (!storeData?.location?.coordinates || !shipping.location) return 0;
    const storeLng = storeData.location.coordinates[0];
    const storeLat = storeData.location.coordinates[1];
    const userLat = shipping.location.lat;
    const userLng = shipping.location.lng;

    const distance = getDistanceFromLatLonInKm(storeLat, storeLng, userLat, userLng);
    const fee = Math.max(15000, Math.round(distance * 5000));
    return fee;
  }, [storeData, shipping.location]);

  const finalTotal = summary.subtotal + deliveryFee;

  const handleChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (lat, lng) => {
    setShipping((prev) => ({ ...prev, location: { lat, lng } }));
  };

  const handleSubmit = async () => {
    if (!storeInfo) return;
    if (!shipping.recipientName || !shipping.phone || !shipping.address || !shipping.location) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng và cắm cờ bản đồ");
      return;
    }

    try {
      setLoading(true);
      const res = await marketService.createOrder({
        storeId: storeInfo.storeId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shipping,
        deliveryFee,
        payment: { method: paymentMethod },
      });

      if (paymentMethod === "vietqr") {
        setCreatedOrderId(res.data._id);
        setShowVietQR(true);
      } else {
        toast.success("Đặt hàng thành công!");
        clearCart();
        navigate("/market");
      }
    } catch (error) {
      toast.error(error?.message || "Không thể đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      toast.error("Vui lòng tải lên ảnh chụp màn hình chuyển khoản");
      return;
    }
    try {
      setLoading(true);
      await marketService.uploadReceipt(createdOrderId, receiptFile);
      toast.success("Đã thanh toán và tải lên biên lai!");
      clearCart();
      setShowVietQR(false);
      navigate("/market");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh. Vui lòng thử lại");
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
    <>
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

            <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-emerald-100 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4">
                  <MapPin className="h-4 w-4" />
                  Thông tin giao hàng
                </div>
                <div className="space-y-3">
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
                    rows={2}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Cắm cờ vị trí nhận hàng (bắt buộc):</label>
                    <div className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                      <MapPicker onLocationSelect={handleLocationSelect} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-4">
                  💰 Phương thức thanh toán
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      paymentMethod === "cod" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Tiền mặt (COD)
                  </button>
                  <button
                    onClick={() => setPaymentMethod("vietqr")}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      paymentMethod === "vietqr" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Chuyển khoản VietQR
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/5 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(summary.subtotal)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span>Phí giao hàng {deliveryFee > 0 ? "(Khoảng cách)" : ""}</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-base font-semibold text-slate-900">
                  <span>Tổng cộng</span>
                  <span className="text-xl text-emerald-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VietQR Modal */}
      {showVietQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">Thanh toán VietQR</h2>
              <p className="mt-1 text-sm text-slate-500">
                Quét mã để thanh toán {formatCurrency(finalTotal)}
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="rounded-2xl border-4 border-emerald-500 p-2 shadow-lg">
                <img 
                  src={`https://img.vietqr.io/image/vcb-0909123456-compact2.png?amount=${finalTotal}&addInfo=${createdOrderId}&accountName=SMARTMEAL`}
                  alt="VietQR"
                  className="w-64 h-64 object-contain rounded-xl"
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-amber-50 p-4 border border-amber-100">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="h-6 w-6 text-amber-600 mb-2" />
                <span className="text-sm font-semibold text-amber-800">Tải lên ảnh bill chuyển khoản</span>
                <span className="text-xs text-amber-600/80 mt-1">Đơn hàng chỉ được xử lý khi có ảnh bill</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                />
              </label>
              {receiptFile && (
                <div className="mt-3 text-center text-xs font-semibold text-emerald-600">
                  Đã chọn: {receiptFile.name}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  toast.info("Đơn hàng đã được lưu. Bạn có thể up bill sau.");
                  clearCart();
                  navigate("/market");
                }}
                className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Để sau
              </button>
              <button
                onClick={handleUploadReceipt}
                disabled={loading || !receiptFile}
                className="flex-1 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Đang tải..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketCartPage;
