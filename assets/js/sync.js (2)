/* ===========================
   SYNC: GitHub Gist (ventas_data.json)
   =========================== */

// Cargar configuración desde IndexedDB
async function loadGistConfigLocal() {
  try {
    const cfgs = await getAllFromDB(STORES.CONFIG);
    const gistId = cfgs.find(c => c.id === 'gistId')?.value || '';
    const gistToken = cfgs.find(c => c.id === 'gistToken')?.value || '';
    // Actualiza inputs en la UI
    document.getElementById('gist-id').value = gistId;
    document.getElementById('gist-token').value = gistToken;
    return { gistId, gistToken };
  } catch (e) {
    return { gistId:'', gistToken:'' };
  }
}

// Guardar configuración en IndexedDB
async function saveGistConfig(gistId, gistToken) {
  try {
    const tx = db.transaction([STORES.CONFIG],'readwrite');
    const store = tx.objectStore(STORES.CONFIG);
    await Promise.all([
      store.put({ id:'gistId', value:gistId }),
      store.put({ id:'gistToken', value:gistToken })
    ]);
    showToast("Configuración guardada.");
  } catch (e) {
    console.error(e);
    showToast("Error guardando configuración.", true);
  }
}

// Descargar y fusionar datos desde Gist
async function syncFromGist() {
  const cfg = await loadGistConfigLocal();
  if (!cfg.gistId || !cfg.gistToken) {
    return showToast("Configura Gist ID y Token en Configuración.", true);
  }
  try {
    showToast("Descargando y fusionando datos desde Gist...");
    const resp = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      headers: { Authorization: `token ${cfg.gistToken}`, Accept:'application/vnd.github.v3+json' }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const gist = await resp.json();
    const file = gist.files?.['ventas_data.json'];
    if (!file?.content) throw new Error("ventas_data.json no encontrado en el Gist.");
    const remote = JSON.parse(file.content);

    // Exportar datos locales actuales
    const promotoresLocal = await getAllFromDB(STORES.PROMOTORES);
    const metasLocal = await getAllFromDB(STORES.METAS);
    const ventasLocal = await getAllFromDB(STORES.VENTAS);

    // Merge con eliminación de duplicados por id
    const mergeById = (remoteArr, localArr) => {
      const map = new Map();
      [...remoteArr, ...localArr].forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item);
      });
      return Array.from(map.values());
    };

    const mergedPromotores = mergeById(remote.promotores || [], promotoresLocal);
    const mergedMetas = mergeById(remote.metas || [], metasLocal);
    const mergedVentas = mergeById(remote.ventas || [], ventasLocal);

    // Reemplazar stores con datos fusionados
    await replaceAll(STORES.PROMOTORES, mergedPromotores);
    await replaceAll(STORES.METAS, mergedMetas);
    await replaceAll(STORES.VENTAS, mergedVentas);

    showToast("Datos fusionados con Gist correctamente.");
    startApp();
  } catch (e) {
    console.error(e);
    showToast("Error sincronizando desde Gist: " + (e.message || e), true);
  }
}

// Subir datos locales al Gist con merge automático
async function syncToGist() {
  const cfg = await loadGistConfigLocal();
  if (!cfg.gistId || !cfg.gistToken) {
    return showToast("Configura Gist ID y Token en Configuración.", true);
  }
  try {
    showToast("Fusionando datos y subiendo a Gist...");

    // 1. Descargar versión remota
    const resp = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      headers: { Authorization: `token ${cfg.gistToken}`, Accept:'application/vnd.github.v3+json' }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const gist = await resp.json();
    const file = gist.files?.['ventas_data.json'];
    const remote = file?.content ? JSON.parse(file.content) : { promotores:[], metas:[], ventas:[] };

    // 2. Exportar datos locales
    const promotoresLocal = await getAllFromDB(STORES.PROMOTORES);
    const metasLocal = await getAllFromDB(STORES.METAS);
    const ventasLocal = await getAllFromDB(STORES.VENTAS);

    // 3. Merge con eliminación de duplicados por id
    const mergeById = (remoteArr, localArr) => {
      const map = new Map();
      [...remoteArr, ...localArr].forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item);
      });
      return Array.from(map.values());
    };

    const merged = {
      promotores: mergeById(remote.promotores || [], promotoresLocal),
      metas: mergeById(remote.metas || [], metasLocal),
      ventas: mergeById(remote.ventas || [], ventasLocal)
    };

    // 4. Subir resultado fusionado
    const payload = {
      description: "Datos VentasApp (merge automático)",
      files: {
        'ventas_data.json': { content: JSON.stringify(merged, null, 2) }
      }
    };

    const updateRes = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      method:'PATCH',
      headers:{
        Authorization:`token ${cfg.gistToken}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!updateRes.ok) throw new Error(`HTTP ${updateRes.status}`);
    showToast("Datos fusionados y subidos al Gist correctamente.");
  } catch (e) {
    console.error(e);
    showToast("Error al sincronizar hacia Gist: " + (e.message || e), true);
  }
}

// Reemplaza todos los registros de una store con un array (usa clear + add)
function replaceAll(storeName, dataArray) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const clearReq = store.clear();
    clearReq.onsuccess = () => {
      let i = 0;
      (function addNext() {
        if (i >= dataArray.length) { resolve(); return; }
        const item = dataArray[i++];
        const addReq = store.add(item);
        addReq.onsuccess = addNext;
        addReq.onerror = (e) => reject(e.target.error);
      })();
    };
    clearReq.onerror = (e) => reject(e.target.error);
  });
}
