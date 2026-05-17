import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Store, Tag, Search, ShoppingCart } from "lucide-react";
import { marketService } from "../services/marketService";
import { useMarketCart } from "../context/MarketCartContext";
import { generateShoppingListApi } from "../services/recipeApi";
import { resolveAssetUrl } from "../utils/resolveAssetUrl";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const MarketPage = () => {
  const { addItem, summary } = useMarketCart();
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [shoppingList, setShoppingList] = useState(null);
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [shoppingError, setShoppingError] = useState("");

  const getRecipeIdsFromPlan = () => {
    const ids = new Set();

    const addMeals = (meals) => {
      (meals || []).forEach((meal) => {
        const id = meal?._id || meal?.id;
        if (id) ids.add(id);
      });
    };

    try {
      const dailyRaw = localStorage.getItem("mealPlan");
      const weeklyRaw = localStorage.getItem("weeklyMenu");
      const dailyMeals = dailyRaw ? JSON.parse(dailyRaw) : [];
      if (Array.isArray(dailyMeals) && dailyMeals.length) {
        addMeals(dailyMeals);
        return Array.from(ids);
      }

      const weeklyMenu = weeklyRaw ? JSON.parse(weeklyRaw) : [];
      if (Array.isArray(weeklyMenu) && weeklyMenu.length) {
        const today = new Date().getDay();
        const dayObj =
          weeklyMenu.find((d) => d.day === today) || weeklyMenu[today];
        if (dayObj && Array.isArray(dayObj.meals)) {
          addMeals(dayObj.meals);
          return Array.from(ids);
        }

        weeklyMenu.forEach((day) => addMeals(day?.meals));
      }
    } catch (_error) {
      return [];
    }

    return Array.from(ids);
  };

  const handleGenerateShoppingList = async () => {
    const recipeIds = getRecipeIdsFromPlan();
    if (!recipeIds.length) {
      setShoppingError("Bạn chưa có thực đơn để tạo danh sách mua.");
      setShoppingList(null);
      return;
    }

    setShoppingLoading(true);
    setShoppingError("");
    try {
      const data = await generateShoppingListApi(recipeIds);
      setShoppingList(data);
    } catch (err) {
      setShoppingList(null);
      setShoppingError(err?.message || "Không thể tạo danh sách mua");
    } finally {
      setShoppingLoading(false);
    }
  };

  useEffect(() => {
    const loadMarket = async () => {
      try {
        setLoading(true);
        setError("");
        const [storeRes, productRes] = await Promise.all([
          marketService.getStores(),
          marketService.getProducts(),
        ]);
        setStores(storeRes?.data || []);
        setProducts(productRes?.data || []);
      } catch (err) {
        setError(err?.message || "Không thể tải dữ liệu mua sắm");
      } finally {
        setLoading(false);
      }
    };

    loadMarket();
  }, []);

  const categories = useMemo(() => {
    const values = new Set();
    for (const product of products) {
      if (product.category) values.add(product.category);
    }
    return ["all", ...Array.from(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedStore !== "all" && product.store?._id !== selectedStore) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          product.name?.toLowerCase().includes(term) ||
          product.brand?.toLowerCase().includes(term) ||
          product.category?.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [products, searchTerm, selectedStore]);

  const handleAddToCart = (product) => {
    const resolvedImage = resolveAssetUrl(product.images?.[0]);
    const unitPrice =
      product.salePrice != null && product.salePrice >= 0
        ? product.salePrice
        : product.price;

    const result = addItem({
      productId: product._id,
      name: product.name,
      image: resolvedImage || "",
      unit: product.unit,
      storeId: product.store?._id,
      storeName: product.store?.name || "",
      unitPrice,
    });

    if (!result.ok) {
      if (result.reason === "different-store") {
        setMessage("Giỏ hàng chỉ hỗ trợ sản phẩm từ cùng một siêu thị.");
      } else {
        setMessage("Không thể thêm sản phẩm vào giỏ hàng.");
      }
      return;
    }

    setMessage("Đã thêm sản phẩm vào giỏ hàng.");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-emerald-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="absolute top-20 -left-28 h-96 w-96 rounded-full bg-emerald-200/60 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                <Store className="h-4 w-4" />
                Mua sắm nguyên liệu thông minh
              </div>
              <h1 className="mt-4 text-4xl font-serif font-semibold text-slate-900 md:text-5xl">
                Market SmartMeal — thực phẩm tươi và sạch trong một chạm
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Chọn siêu thị gần bạn, thêm nhanh vào giỏ, thanh toán và nhận
                hàng. Trải nghiệm giống GrabMart nhưng được tối ưu riêng cho bữa
                ăn của bạn.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  to="/market/cart"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Giỏ hàng ({summary.quantity})
                </Link>
                <div className="text-sm text-slate-600">
                  Tổng tạm tính: {formatCurrency(summary.subtotal)}
                </div>
              </div>
            </div>
            <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl shadow-emerald-100 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Nhanh gọn
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    Danh mục siêu thị đã xác thực
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Gợi ý nguyên liệu phù hợp với thực đơn.
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Theo dõi giá và khuyến mãi từng sản phẩm.
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                  Giao hàng nhanh từ đối tác gần nhất.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-emerald-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-900/5 px-4 py-3">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm món, thương hiệu, hoặc danh mục..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm">
                <Store className="h-4 w-4 text-emerald-600" />
                <select
                  value={selectedStore}
                  onChange={(event) => setSelectedStore(event.target.value)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="all">Tất cả siêu thị</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm">
                <Tag className="h-4 w-4 text-amber-600" />
                <span className="text-slate-500">
                  {categories.length - 1} danh mục
                </span>
              </div>
            </div>
          </div>

          {message && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </div>
          )}

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Gợi ý mua hàng theo thực đơn
                </p>
                <p className="text-xs text-emerald-700/80">
                  Tự động tạo danh sách nguyên liệu còn thiếu dựa trên pantry.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateShoppingList}
                disabled={shoppingLoading}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {shoppingLoading
                  ? "Đang tạo danh sách..."
                  : "Tạo danh sách mua"}
              </button>
            </div>

            {shoppingError && (
              <div className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-xs text-rose-700">
                {shoppingError}
              </div>
            )}

            {shoppingList && (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Cần mua ({shoppingList?.summary?.need_to_buy || 0})
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {(shoppingList.shopping_list || []).map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.need
                            ? `${item.need} ${item.unit || ""}`
                            : "Cần mua"}
                        </span>
                      </div>
                    ))}
                    {(!shoppingList.shopping_list ||
                      shoppingList.shopping_list.length === 0) && (
                      <p className="text-xs text-slate-500">
                        Pantry đã đủ nguyên liệu cho thực đơn này.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Đã có sẵn ({shoppingList?.summary?.already_have || 0})
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {(shoppingList.already_have || []).map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.have} {item.unit || ""}
                        </span>
                      </div>
                    ))}
                    {(!shoppingList.already_have ||
                      shoppingList.already_have.length === 0) && (
                      <p className="text-xs text-slate-500">
                        Chưa có nguyên liệu nào trong pantry.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Đang tải sản phẩm...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-rose-500">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const price =
                  product.salePrice != null && product.salePrice >= 0
                    ? product.salePrice
                    : product.price;
                const image =
                  resolveAssetUrl(product.images?.[0]) ||
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800";
                return (
                  <div
                    key={product._id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {product.store?.name || "Siêu thị"}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {product.name}
                        </h3>
                        <span className="text-xs uppercase tracking-widest text-slate-400">
                          {product.unit}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                        {product.description ||
                          "Sản phẩm tươi mới mỗi ngày, được chọn lọc kỹ lưỡng."}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-emerald-700">
                            {formatCurrency(price)}
                          </p>
                          {product.salePrice != null &&
                            product.salePrice >= 0 && (
                              <p className="text-xs text-slate-400 line-through">
                                {formatCurrency(product.price)}
                              </p>
                            )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MarketPage;
