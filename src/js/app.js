const state = {
  category: "all",
  keyword: "",
  page: 1,
  pageSize: 4,
  total: 0,
  records: [],
  logs: []
};

const $ = selector => document.querySelector(selector);

window.addEventListener("request-log", event => {
  state.logs.unshift(event.detail);
  state.logs = state.logs.slice(0, 20);
  renderLogs();
});

async function init() {
  bindEvents();
  await loadCategories();
  await loadProducts();
}

function bindEvents() {
  $("#searchBtn").addEventListener("click", () => {
    state.keyword = $("#keywordInput").value.trim();
    state.page = 1;
    loadProducts();
  });

  $("#keywordInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      state.keyword = $("#keywordInput").value.trim();
      state.page = 1;
      loadProducts();
    }
  });

  $("#categorySelect").addEventListener("change", event => {
    state.category = event.target.value;
    state.page = 1;
    loadProducts();
  });

  $("#pageSizeSelect").addEventListener("change", event => {
    state.pageSize = Number(event.target.value);
    state.page = 1;
    loadProducts();
  });

  $("#prevBtn").addEventListener("click", () => {
    if (state.page > 1) {
      state.page -= 1;
      loadProducts();
    }
  });

  $("#nextBtn").addEventListener("click", () => {
    const pageCount = getPageCount();
    if (state.page < pageCount) {
      state.page += 1;
      loadProducts();
    }
  });

  $("#clearLogBtn").addEventListener("click", () => {
    state.logs = [];
    renderLogs();
  });
}

async function loadCategories() {
  const categories = await request({
    url: "/api/categories"
  });

  $("#categorySelect").innerHTML = [
    `<option value="all">全部分类</option>`,
    ...categories.map(category => `<option value="${category.id}">${category.name}</option>`)
  ].join("");
}

async function loadProducts() {
  setLoading(true);
  try {
    const result = await request({
      url: "/api/products",
      params: {
        category: state.category,
        keyword: state.keyword,
        page: state.page,
        pageSize: state.pageSize
      }
    });

    state.records = result.records;
    state.total = result.total;
    state.page = result.page;
    state.pageSize = result.pageSize;
    renderProducts();
    renderPager();
    renderSummary(result);
  } catch (error) {
    $("#productList").innerHTML = `<div class="empty">${error.message}</div>`;
  } finally {
    setLoading(false);
  }
}

function renderProducts() {
  if (!state.records.length) {
    $("#productList").innerHTML = `<div class="empty">没有找到符合条件的商品</div>`;
    return;
  }

  $("#productList").innerHTML = state.records.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="product-body">
        <div class="meta">
          <span>${product.categoryName}</span>
          <span>库存 ${product.stock}</span>
        </div>
        <h3>${product.name}</h3>
        <div class="meta">
          <span>销量 ${product.sales}</span>
          <span>编号 #${product.id}</span>
        </div>
        <div class="price">¥${product.price.toFixed(2)}</div>
      </div>
    </article>
  `).join("");
}

function renderPager() {
  const pageCount = getPageCount();
  $("#pageInfo").textContent = `第 ${state.page} / ${pageCount} 页`;
  $("#prevBtn").disabled = state.page <= 1;
  $("#nextBtn").disabled = state.page >= pageCount;
}

function renderSummary(result) {
  const categoryName = $("#categorySelect").selectedOptions[0]?.textContent || "全部分类";
  $("#querySummary").textContent = `分类：${categoryName}，关键字：${state.keyword || "无"}，共 ${state.total} 条，当前第 ${state.page} 页。本次请求编号：${result.requestNo}，请求时间：${result.requestTime}`;
}

function renderLogs() {
  $("#requestLog").textContent = state.logs.length
    ? state.logs.map(log => JSON.stringify(log, null, 2)).join("\n\n")
    : "暂无请求日志";
}

function setLoading(loading) {
  $("#loadingText").classList.toggle("hidden", !loading);
  $("#searchBtn").disabled = loading;
  $("#prevBtn").disabled = loading || state.page <= 1;
  $("#nextBtn").disabled = loading || state.page >= getPageCount();
}

function getPageCount() {
  return Math.max(Math.ceil(state.total / state.pageSize), 1);
}

init();
