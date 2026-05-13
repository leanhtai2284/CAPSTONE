import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  BarChart3,
  ClipboardList,
  Package,
  Plus,
  Store as StoreIcon,
  Pencil,
  Trash2,
  X,
  Filter,
  Calendar,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { marketService } from "../services/marketService";

const emptyProductForm = {
  name: "",
  description: "",
  category: "",
  brand: "",
  unit: "pcs",
  productType: "ingredient",
  price: "",
  salePrice: "",
  stock: "",
  images: [],
  isAvailable: true,
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  shipping: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [revenuePoints, setRevenuePoints] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState("day");
  const [revenueDays, setRevenueDays] = useState(14);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState(null);
  const [storeForm, setStoreForm] = useState({
    name: "",
    phone: "",
    address: "",
    openingHours: "",
  });
  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const productImageRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "store_owner" && user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập khu vực cửa hàng");
      navigate("/");
      return;
    }
  }, [user, navigate]);

  const loadStores = async () => {
    try {
      const res = await marketService.getMyStores();
      const list = res?.data || [];
      setStores(list);
      if (list.length > 0) {
        setSelectedStoreId((prev) => prev || list[0]._id);
      }
      return list;
    } catch (error) {
      toast.error(error?.message || "Không thể tải cửa hàng");
      return [];
    }
  };

  const loadStoreData = async (storeId) => {
    try {
      setLoading(true);
      const orderParams = {};
      if (orderStatusFilter && orderStatusFilter !== "all") {
        orderParams.status = orderStatusFilter;
      }
      if (orderDateFrom) orderParams.dateFrom = orderDateFrom;
      if (orderDateTo) orderParams.dateTo = orderDateTo;

      const [orderRes, productRes] = await Promise.all([
        marketService.getStoreOrders(storeId, orderParams),
        marketService.getProducts({ storeId }),
      ]);
      setOrders(orderRes?.data || []);
      setProducts(productRes?.data || []);
      const revenueRes = await marketService.getStoreRevenue(storeId, {
        period: revenuePeriod,
        days: revenueDays,
      });
      setRevenuePoints(revenueRes?.data?.points || []);
    } catch (error) {
      toast.error(error?.message || "Không thể tải dữ liệu cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores().then((list) => {
      if (list.length === 0) {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;
    loadStoreData(selectedStoreId);
  }, [selectedStoreId, revenuePeriod, revenueDays, orderStatusFilter, orderDateFrom, orderDateTo]);

  const revenueSummary = useMemo(() => {
    const paidOrders = orders.filter((order) =>
      ["paid", "shipping", "delivered"].includes(order.status),
    );
    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered",
    );
    const pendingOrders = orders.filter((order) => order.status === "pending");

    return {
      grossRevenue: paidOrders.reduce(
        (sum, order) => sum + (order.total || 0),
        0,
      ),
      deliveredRevenue: deliveredOrders.reduce(
        (sum, order) => sum + (order.total || 0),
        0,
      ),
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
    };
  }, [orders]);

  const normalizedRevenue = useMemo(() => {
    if (revenuePoints.length === 0) return [];
    return revenuePoints.map((point) => ({
      label: point.label,
      total: point.total || 0,
      orders: point.orders || 0,
    }));
  }, [revenuePoints]);

  const handleStoreFormChange = (field, value) => {
    setStoreForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateStore = async () => {
    if (!storeForm.name.trim()) {
      toast.error("Tên cửa hàng là bắt buộc");
      return;
    }

    try {
      const res = await marketService.createStore({
        name: storeForm.name.trim(),
        phone: storeForm.phone.trim(),
        address: storeForm.address.trim(),
        openingHours: storeForm.openingHours.trim(),
      });
      const created = res?.data;
      toast.success("Tạo cửa hàng thành công!");
      setStoreForm({ name: "", phone: "", address: "", openingHours: "" });
      if (created?._id) {
        setStores((prev) => [created, ...prev]);
        setSelectedStoreId(created._id);
      }
    } catch (error) {
      toast.error(error?.message || "Không thể tạo cửa hàng");
    }
  };

  const handleProductFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadImages = async (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    if (productForm.images.length + fileArray.length > 5) {
      toast.warning("Tối đa 5 ảnh cho mỗi sản phẩm");
      return;
    }
    try {
      setUploadingImage(true);
      const uploadPromises = fileArray.map((file) =>
        marketService.uploadProductImage(file).then((res) => res?.data?.url),
      );
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(Boolean);
      if (validUrls.length > 0) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...validUrls].slice(0, 5),
        }));
        toast.success(`Đã tải ${validUrls.length} ảnh lên`);
      }
    } catch (error) {
      toast.error(error?.message || "Không thể upload ảnh");
    } finally {
      setUploadingImage(false);
      if (productImageRef.current) productImageRef.current.value = "";
    }
  };

  const removeProductImage = useCallback((index) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const resetProductForm = () => {
    setProductForm(emptyProductForm);
    setEditingId(null);
  };

  const handleSubmitProduct = async () => {
    if (!selectedStoreId) return;
    if (!productForm.name.trim()) {
      toast.error("Tên mặt hàng là bắt buộc");
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      category: productForm.category.trim(),
      brand: productForm.brand.trim(),
      unit: productForm.unit,
      productType: productForm.productType,
      price: Number(productForm.price) || 0,
      salePrice:
        productForm.salePrice !== ""
          ? Number(productForm.salePrice)
          : undefined,
      stock: Number(productForm.stock) || 0,
      images: productForm.images || [],
      isAvailable: productForm.isAvailable,
    };

    try {
      if (editingId) {
        const res = await marketService.updateProduct(editingId, payload);
        const updated = res?.data;
        setProducts((prev) =>
          prev.map((item) => (item._id === editingId ? updated : item)),
        );
        toast.success("Đã cập nhật mặt hàng");
      } else {
        const res = await marketService.createProduct(selectedStoreId, payload);
        const created = res?.data;
        setProducts((prev) => [created, ...prev]);
        toast.success("Đã thêm mặt hàng mới");
      }
      resetProductForm();
    } catch (error) {
      toast.error(error?.message || "Không thể lưu mặt hàng");
    }
  };

  const handleEditProduct = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      brand: product.brand || "",
      unit: product.unit || "pcs",
      productType: product.productType || "ingredient",
      price: product.price ?? "",
      salePrice: product.salePrice ?? "",
      stock: product.stock ?? "",
      images: product.images || [],
      isAvailable: product.isAvailable !== false,
    });
    setTab("products");
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Xóa mặt hàng này?") || !selectedStoreId) return;

    try {
      await marketService.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      toast.success("Đã xóa mặt hàng");
    } catch (error) {
      toast.error(error?.message || "Không thể xóa mặt hàng");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await marketService.updateOrderStatus(orderId, status);
      const updated = res?.data;
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updated : order)),
      );
      toast.success("Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      toast.error(error?.message || "Không thể cập nhật trạng thái");
    }
  };

  if (!user) {
    return null;
  }

  if (!selectedStoreId && stores.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-emerald-50 px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <StoreIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Bắt đầu kinh doanh
                </p>
                <h1 className="text-2xl font-serif font-semibold text-slate-900">
                  Tạo cửa hàng đầu tiên của bạn
                </h1>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                value={storeForm.name}
                onChange={(event) =>
                  handleStoreFormChange("name", event.target.value)
                }
                placeholder="Tên cửa hàng"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <input
                value={storeForm.phone}
                onChange={(event) =>
                  handleStoreFormChange("phone", event.target.value)
                }
                placeholder="Số điện thoại"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <input
                value={storeForm.address}
                onChange={(event) =>
                  handleStoreFormChange("address", event.target.value)
                }
                placeholder="Địa chỉ cửa hàng"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <input
                value={storeForm.openingHours}
                onChange={(event) =>
                  handleStoreFormChange("openingHours", event.target.value)
                }
                placeholder="Giờ mở cửa"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleCreateStore}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Tạo cửa hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeStore = stores.find((store) => store._id === selectedStoreId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-emerald-50 px-4 py-10">
      <div className="container mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Store Owner
            </p>
            <h1 className="text-3xl font-serif font-semibold text-slate-900">
              {activeStore?.name || "Cửa hàng của bạn"}
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm shadow">
            <StoreIcon className="h-4 w-4 text-emerald-600" />
            <select
              value={selectedStoreId}
              onChange={(event) => setSelectedStoreId(event.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setTab("overview")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === "overview"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-900/5"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Tổng quan
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === "orders"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-900/5"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Đơn hàng
          </button>
          <button
            onClick={() => setTab("products")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === "products"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-900/5"
            }`}
          >
            <Package className="h-4 w-4" />
            Quản lý quầy
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white/80 p-10 text-center text-sm text-slate-500">
            Đang tải dữ liệu cửa hàng...
          </div>
        ) : tab === "overview" ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
                <p className="text-sm text-slate-500">Doanh thu hiện tại</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">
                  {formatCurrency(revenueSummary.grossRevenue)}
                </p>
              </div>
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
                <p className="text-sm text-slate-500">Doanh thu đã giao</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatCurrency(revenueSummary.deliveredRevenue)}
                </p>
              </div>
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
                <p className="text-sm text-slate-500">Tổng đơn hàng</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {revenueSummary.totalOrders}
                </p>
              </div>
              <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
                <p className="text-sm text-slate-500">Đơn chờ xử lý</p>
                <p className="mt-2 text-2xl font-semibold text-amber-600">
                  {revenueSummary.pendingOrders}
                </p>
              </div>
            </div>
            <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Biểu đồ doanh thu
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Theo {revenuePeriod === "week" ? "tuần" : "ngày"}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <select
                    value={revenuePeriod}
                    onChange={(event) => setRevenuePeriod(event.target.value)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1"
                  >
                    <option value="day">Theo ngày</option>
                    <option value="week">Theo tuần</option>
                  </select>
                  <select
                    value={revenueDays}
                    onChange={(event) =>
                      setRevenueDays(Number(event.target.value))
                    }
                    className="rounded-full border border-slate-200 bg-white px-3 py-1"
                  >
                    <option value={7}>7 phiên</option>
                    <option value={14}>14 phiên</option>
                    <option value={30}>30 phiên</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 h-72">
                {normalizedRevenue.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Chưa có dữ liệu doanh thu.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={normalizedRevenue}>
                      <defs>
                        <linearGradient
                          id="revenueFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#34d399"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#34d399"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ borderRadius: "12px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#10b981"
                        fill="url(#revenueFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        ) : tab === "orders" ? (
          <div className="space-y-4">
            {/* Order Filters */}
            <div className="rounded-3xl bg-white/90 p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Bộ lọc đơn hàng</span>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Trạng thái</label>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />Từ ngày
                  </label>
                  <input
                    type="date"
                    value={orderDateFrom}
                    onChange={(e) => setOrderDateFrom(e.target.value)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />Đến ngày
                  </label>
                  <input
                    type="date"
                    value={orderDateTo}
                    onChange={(e) => setOrderDateTo(e.target.value)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
                  />
                </div>
                {(orderStatusFilter !== "all" || orderDateFrom || orderDateTo) && (
                  <button
                    onClick={() => {
                      setOrderStatusFilter("all");
                      setOrderDateFrom("");
                      setOrderDateTo("");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
                  >
                    <X className="h-3 w-3" />
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>

            {/* Order List */}
            <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Đơn hàng ({orders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-8">
                    Không tìm thấy đơn hàng nào.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm text-slate-500">Mã đơn</p>
                        <p className="font-semibold text-slate-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Khách hàng</p>
                        <p className="font-semibold text-slate-900">
                          {order.shipping?.recipientName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.shipping?.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Tổng tiền</p>
                        <p className="font-semibold text-emerald-700">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-slate-400">Trạng thái</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${statusColor[order.status] || "bg-slate-100 text-slate-600"}`}>
                          {STATUS_OPTIONS.find((o) => o.value === order.status)?.label || order.status}
                        </span>
                        <select
                          value={order.status}
                          onChange={(event) =>
                            handleUpdateOrderStatus(order._id, event.target.value)
                          }
                          className="rounded-full border border-slate-200 px-3 py-1 text-sm"
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="shipping">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Cập nhật mặt hàng" : "Thêm mặt hàng mới"}
                </h2>
                {editingId && (
                  <button
                    onClick={resetProductForm}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={productForm.name}
                  onChange={(event) =>
                    handleProductFormChange("name", event.target.value)
                  }
                  placeholder="Tên mặt hàng"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  value={productForm.category}
                  onChange={(event) =>
                    handleProductFormChange("category", event.target.value)
                  }
                  placeholder="Danh mục (ví dụ: Rau củ)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  value={productForm.brand}
                  onChange={(event) =>
                    handleProductFormChange("brand", event.target.value)
                  }
                  placeholder="Thương hiệu"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <select
                  value={productForm.productType}
                  onChange={(event) =>
                    handleProductFormChange("productType", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option value="ingredient">Nguyên liệu</option>
                  <option value="meal">Món ăn</option>
                </select>
                <input
                  value={productForm.price}
                  onChange={(event) =>
                    handleProductFormChange("price", event.target.value)
                  }
                  placeholder="Giá bán"
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  value={productForm.salePrice}
                  onChange={(event) =>
                    handleProductFormChange("salePrice", event.target.value)
                  }
                  placeholder="Giá khuyến mãi (tuỳ chọn)"
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  value={productForm.stock}
                  onChange={(event) =>
                    handleProductFormChange("stock", event.target.value)
                  }
                  placeholder="Tồn kho"
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
                <select
                  value={productForm.unit}
                  onChange={(event) =>
                    handleProductFormChange("unit", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="pcs">pcs</option>
                  <option value="pack">pack</option>
                  <option value="box">box</option>
                  <option value="bottle">bottle</option>
                  <option value="can">can</option>
                  <option value="bag">bag</option>
                </select>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Hình ảnh sản phẩm (tối đa 5)</label>
                  <input
                    ref={productImageRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) =>
                      handleUploadImages(event.target.files)
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />
                  {productForm.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {productForm.images.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Ảnh ${idx + 1}`}
                            className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductImage(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            ×
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0.5 left-0.5 bg-emerald-600 text-white text-[9px] px-1 rounded">
                              Chính
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(event) =>
                      handleProductFormChange(
                        "isAvailable",
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4"
                  />
                  <span>Đang bán</span>
                </div>
              </div>
              <textarea
                value={productForm.description}
                onChange={(event) =>
                  handleProductFormChange("description", event.target.value)
                }
                placeholder="Mô tả chi tiết"
                rows={4}
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSubmitProduct}
                disabled={uploadingImage}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Plus className="h-4 w-4" />
                {uploadingImage
                  ? "Đang tải ảnh..."
                  : editingId
                    ? "Lưu thay đổi"
                    : "Thêm mặt hàng"}
              </button>
            </div>

            <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-slate-900">
                Danh sách mặt hàng
              </h2>
              <div className="mt-4 space-y-4">
                {products.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-6">
                    Chưa có mặt hàng nào.
                  </div>
                ) : (
                  products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4"
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
                        }
                        alt={product.name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {product.productType === "meal"
                            ? "Món ăn"
                            : "Nguyên liệu"}
                          {product.category ? ` · ${product.category}` : ""}
                        </p>
                        <p className="text-sm text-emerald-700">
                          {formatCurrency(product.salePrice ?? product.price)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
