/* Warstwa przechowywania (Etap 1).
   - Dane: localStorage, jeden dokument JSON pod kluczem CT.config.storageKey.
   - Pliki (grafiki, wideo, PDF): IndexedDB, bo localStorage mieści tylko kilka MB.
   Oba mechanizmy działają w jednej przeglądarce na jednym urządzeniu. Wymiana na bazę i storage
   w Etapie 2 dotyczy tylko tego pliku i contentRepository.js. */
CT.storage = {
  /* Ostatni stan danych, który ta karta odczytała albo zapisała. Jeśli w localStorage jest coś innego,
     zapisała to inna karta: wtedy nie nadpisujemy, tylko prosimy o odświeżenie. */
  lastRaw: null,
  load() {
    try {
      const raw = localStorage.getItem(CT.config.storageKey);
      this.lastRaw = raw;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Odczyt danych nie powiódł się", e);
      return null;
    }
  },
  /* Czy dane w przeglądarce zmieniła inna karta od ostatniego odczytu lub zapisu tej karty. */
  changedElsewhere() {
    try { return localStorage.getItem(CT.config.storageKey) !== this.lastRaw; } catch (e) { return false; }
  },
  /* Ostatni stan znany tej karcie (do cofnięcia zmiany w pamięci, której nie udało się zapisać). */
  lastKnown() { try { return this.lastRaw ? JSON.parse(this.lastRaw) : null; } catch (e) { return null; } },
  save(db) {
    try {
      if (this.changedElsewhere()) return "conflict";
      const raw = JSON.stringify(db);
      localStorage.setItem(CT.config.storageKey, raw);
      this.lastRaw = raw;
      return true;
    } catch (e) {
      console.error("Zapis danych nie powiódł się", e);
      if (CT.ui && CT.ui.toast) CT.ui.toast("Nie udało się zapisać danych: pamięć przeglądarki jest pełna. Pobierz kopię i usuń stare dane.");
      return false;
    }
  },
  sizeBytes() {
    const raw = localStorage.getItem(CT.config.storageKey) || "";
    return new Blob([raw]).size;
  },
};

/* Szkice niezapisanych zmian (karta posta). sessionStorage: przetrwają odświeżenie i przejście do innej
   zakładki, znikają po zamknięciu karty przeglądarki. Każdy post, wersja i komentarz ma osobny klucz. */
CT.drafts = (() => {
  const P = "ctsm.draft.";
  const ss = () => { try { return window.sessionStorage; } catch (e) { return null; } };
  function get(key) {
    const s = ss(); if (!s) return null;
    try { const raw = s.getItem(P + key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function set(key, val) {
    const s = ss(); if (!s) return false;
    try { s.setItem(P + key, JSON.stringify(val)); return true; } catch (e) { console.warn("Nie udało się zapisać szkicu", e); return false; }
  }
  function del(key) { const s = ss(); if (s) try { s.removeItem(P + key); } catch (e) { /* brak dostępu */ } }
  function keys(prefix = "") {
    const s = ss(); if (!s) return [];
    const out = [];
    try { for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.startsWith(P + prefix)) out.push(k.slice(P.length)); } } catch (e) { /* brak dostępu */ }
    return out;
  }
  function clear(prefix) { keys(prefix).forEach(del); }
  return { get, set, del, keys, clear };
})();

CT.files = (() => {
  let dbp = null;
  const urls = new Map();
  const STORE = "files";
  function open() {
    if (!dbp) {
      dbp = new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) { reject(new Error("Brak IndexedDB")); return; }
        const r = indexedDB.open("ctsm-files", 1);
        r.onupgradeneeded = () => r.result.createObjectStore(STORE);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    }
    return dbp;
  }
  async function tx(mode, fn) {
    const d = await open();
    return new Promise((resolve, reject) => {
      const t = d.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }
  const put = (key, blob) => tx("readwrite", (s) => s.put(blob, key)).then(() => key);
  const get = (key) => tx("readonly", (s) => s.get(key));
  const del = (key) => { const u = urls.get(key); if (u) { URL.revokeObjectURL(u); urls.delete(key); } return tx("readwrite", (s) => s.delete(key)); };
  const count = () => tx("readonly", (s) => s.count());
  async function url(key) {
    if (urls.has(key)) return urls.get(key);
    const b = await get(key);
    if (!b) return null;
    const u = URL.createObjectURL(b);
    urls.set(key, u);
    return u;
  }
  return { put, get, del, url, count, available: () => open().then(() => true, () => false) };
})();
