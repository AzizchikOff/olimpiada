const BASE = import.meta.env.VITE_API_URL || '';

async function req(path, opts = {}) {
  const isForm = opts.body instanceof FormData;
  const res = await fetch(BASE + path, {
    ...opts,
    headers: isForm ? {} : { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = (await res.json()).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  get: (p) => req(p),
  post: (p, body) => req(p, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (p, body) => req(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => req(p, { method: 'DELETE' }),
};

export default api;