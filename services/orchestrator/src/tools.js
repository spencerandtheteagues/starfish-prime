import axios from "axios";
const API_BASE = process.env.API_BASE || "http://api.lvh.me";
const PREVIEW_BASE = process.env.PREVIEW_BASE || "http://preview.lvh.me";

export const tools = {
  async readFile(projectId, path, token) {
    const r = await axios.get(`${API_BASE}/projects/${projectId}/file`, {
      params: { path },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return r.data.content;
  },
  async writeFile(projectId, path, content, token) {
    await axios.put(`${API_BASE}/projects/${projectId}/file`, { path, content }, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    return true;
  },
  async search(projectId, q, token) {
    const r = await axios.get(`${API_BASE}/projects/${projectId}/search`, {
      params: { q },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return r.data.files;
  },
  async startPreview(projectId, token) {
    const r = await axios.post(`${PREVIEW_BASE}/previews/${projectId}/start`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return r.data.url;
  }
};
