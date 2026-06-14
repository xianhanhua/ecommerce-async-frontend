window.request = async function request(config) {
  const method = config.method || "GET";
  const params = config.params || {};
  const headers = {
    "Content-Type": "application/json",
    ...(config.headers || {})
  };

  const url = buildUrl(config.url, params);
  const requestOptions = {
    method,
    headers
  };

  if (config.data) {
    requestOptions.body = JSON.stringify(config.data);
  }

  appendRequestLog({
    type: "request",
    method,
    url,
    params,
    time: new Date().toLocaleString("zh-CN", { hour12: false })
  });

  const response = await window.MockApi.handle(url, requestOptions);

  appendRequestLog({
    type: "response",
    code: response.code,
    message: response.message,
    data: response.data,
    time: new Date().toLocaleString("zh-CN", { hour12: false })
  });

  if (response.code !== 200) {
    throw new Error(response.message || "请求失败");
  }

  return response.data;
};

function buildUrl(url, params) {
  const requestUrl = new URL(url, window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      requestUrl.searchParams.set(key, value);
    }
  });
  return requestUrl.pathname + requestUrl.search;
}

function appendRequestLog(log) {
  window.dispatchEvent(new CustomEvent("request-log", { detail: log }));
}
