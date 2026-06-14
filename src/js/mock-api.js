window.MockApi = {
  requestCount: 0,

  async handle(url, options = {}) {
    const requestUrl = new URL(url, window.location.href);
    const pathname = requestUrl.pathname;

    await delay(360);
    this.requestCount += 1;

    if (pathname.endsWith("/api/categories")) {
      return {
        code: 200,
        message: "success",
        data: window.MockStore.categories
      };
    }

    if (pathname.endsWith("/api/products")) {
      const category = requestUrl.searchParams.get("category") || "all";
      const keyword = (requestUrl.searchParams.get("keyword") || "").trim().toLowerCase();
      const page = Number(requestUrl.searchParams.get("page") || 1);
      const pageSize = Number(requestUrl.searchParams.get("pageSize") || 4);

      let list = window.MockStore.products.slice();

      if (category !== "all") {
        list = list.filter(product => product.categoryId === category);
      }

      if (keyword) {
        list = list.filter(product => product.name.toLowerCase().includes(keyword));
      }

      const total = list.length;
      const start = (page - 1) * pageSize;
      const records = list.slice(start, start + pageSize).map(product => ({
        ...product,
        categoryName: getCategoryName(product.categoryId)
      }));

      return {
        code: 200,
        message: "success",
        data: {
          records,
          total,
          page,
          pageSize,
          requestNo: this.requestCount,
          requestTime: new Date().toLocaleString("zh-CN", { hour12: false })
        }
      };
    }

    return {
      code: 404,
      message: "接口不存在",
      data: null
    };
  }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCategoryName(categoryId) {
  const category = window.MockStore.categories.find(item => item.id === categoryId);
  return category ? category.name : "未分类";
}
