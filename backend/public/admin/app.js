// ---- Admin authentication ----
const ADMIN_TOKEN_KEY = 'raaj-admin-token';

const loginOverlay = document.getElementById('admin-login-overlay');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');
const logoutButton = document.getElementById('admin-logout');

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

function showLogin() {
  loginOverlay.classList.add('visible');
  document.body.classList.add('admin-locked');
  logoutButton.classList.add('hidden');
}

function hideLogin() {
  loginOverlay.classList.remove('visible');
  document.body.classList.remove('admin-locked');
  logoutButton.classList.remove('hidden');
}

adminLoginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  adminLoginError.textContent = '';
  const formData = new FormData(adminLoginForm);
  const username = String(formData.get('username')).trim();
  const password = String(formData.get('password'));
  if (!username || !password) {
    adminLoginError.textContent = 'Enter an admin username and password.';
    return;
  }
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    setAdminToken(data.token);
    adminLoginForm.reset();
    hideLogin();
    await loadAll();
  } catch (error) {
    adminLoginError.textContent = error.message;
  }
});

logoutButton.addEventListener('click', () => {
  clearAdminToken();
  productList.innerHTML = '';
  tableView.innerHTML = '';
  filterList.innerHTML = '';
  sqlOutput.textContent = '';
  document.getElementById('product-status').textContent = '';
  showLogin();
});

// ---- Existing UI wiring ----
const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const productStatus = document.getElementById('product-status');
const sqlInput = document.getElementById('sql-input');
const sqlOutput = document.getElementById('sql-output');
const tableButtons = document.getElementById('table-buttons');
const tableView = document.getElementById('table-view');
const filterForm = document.getElementById('filter-form');
const filterList = document.getElementById('filter-list');

document.querySelectorAll('nav button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAdminToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    clearAdminToken();
    showLogin();
    throw new Error('Session expired. Please log in again.');
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

function formToProduct(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    sku: data.sku,
    name: data.name,
    brand: data.brand,
    type: data.type,
    description: data.description,
    priceMin: Number(data.priceMin),
    priceMax: Number(data.priceMax),
    moq: Number(data.moq),
    material: data.material,
    innerDiameter: data.innerDiameter,
    outerDiameter: data.outerDiameter,
    imageUrl: data.imageUrl,
    filterA: data.filterA,
    filterB: data.filterB,
    filterC: data.filterC,
    filterD: data.filterD
  };
}

function fillForm(product) {
  const fields = productForm.elements;
  fields.id.value = product.id;
  fields.sku.value = product.sku;
  fields.name.value = product.name;
  fields.brand.value = product.brand;
  fields.type.value = product.type;
  fields.description.value = product.description;
  fields.priceMin.value = product.priceMin;
  fields.priceMax.value = product.priceMax;
  fields.moq.value = product.moq;
  fields.material.value = product.material;
  fields.innerDiameter.value = product.innerDiameter;
  fields.outerDiameter.value = product.outerDiameter;
  fields.imageUrl.value = product.imageUrl;
  fields.filterA.value = product.filterA;
  fields.filterB.value = product.filterB;
  fields.filterC.value = product.filterC;
  fields.filterD.value = product.filterD;
}

async function loadProducts() {
  const products = await api('/api/products');
  productList.innerHTML = products.map((product) => `
    <article class="card">
      <strong>${product.sku}</strong> · ${product.brand}<br />
      ${product.name}
      <div class="row-actions">
        <button data-edit="${product.id}">Edit</button>
        <button data-delete="${product.id}" class="ghost">Delete</button>
      </div>
    </article>
  `).join('');

  productList.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', async () => {
      const product = await api(`/api/products/${button.dataset.edit}`);
      fillForm(product);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  productList.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this product?')) return;
      await api(`/api/products/${button.dataset.delete}`, { method: 'DELETE' });
      await loadProducts();
    });
  });
}

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const payload = formToProduct(productForm);
    const id = productForm.elements.id.value;
    if (id) {
      await api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      productStatus.textContent = `Updated product ${id}`;
    } else {
      const created = await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      productStatus.textContent = `Added product ${created.id}`;
    }
    productForm.reset();
    productForm.elements.imageUrl.value = '/images/bearing-1.svg';
    await loadProducts();
  } catch (error) {
    productStatus.textContent = error.message;
  }
});

document.getElementById('reset-form').addEventListener('click', () => {
  productForm.reset();
  productForm.elements.id.value = '';
  productForm.elements.imageUrl.value = '/images/bearing-1.svg';
  productStatus.textContent = '';
});

document.getElementById('run-sql').addEventListener('click', async () => {
  try {
    const data = await api('/api/db/query', {
      method: 'POST',
      body: JSON.stringify({ sql: sqlInput.value })
    });
    sqlOutput.textContent = JSON.stringify(data, null, 2);
    await loadProducts();
    await loadTables();
  } catch (error) {
    sqlOutput.textContent = error.message;
  }
});

async function renderTable(name) {
  const data = await api(`/api/db/tables/${name}`);
  const columns = data.columns.map((col) => col.name);
  tableView.innerHTML = `
    <h2>${name}</h2>
    <table>
      <thead><tr>${columns.map((col) => `<th>${col}</th>`).join('')}</tr></thead>
      <tbody>
        ${data.rows.map((row) => `<tr>${columns.map((col) => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

async function loadTables() {
  const { tables } = await api('/api/db/tables');
  tableButtons.innerHTML = tables.map((name) => `<button data-table="${name}">${name}</button>`).join(' ');
  tableButtons.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => renderTable(button.dataset.table));
  });
  if (tables.includes('products')) {
    await renderTable('products');
  }
}

async function loadFilters() {
  const grouped = await api('/api/filters');
  const rows = await api('/api/db/tables/filter_options');
  filterList.innerHTML = `
    <p>Current API values: A=${grouped.A.join(', ')}; B=${grouped.B.join(', ')}; C=${grouped.C.join(', ')}; D=${grouped.D.join(', ')}</p>
    <table>
      <thead><tr><th>ID</th><th>Category</th><th>Value</th><th></th></tr></thead>
      <tbody>
        ${rows.rows.map((row) => `
          <tr>
            <td>${row.id}</td>
            <td>${row.category}</td>
            <td>${row.value}</td>
            <td><button data-filter-delete="${row.id}" class="ghost">Delete</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  filterList.querySelectorAll('[data-filter-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      await api(`/api/filters/${button.dataset.filterDelete}`, { method: 'DELETE' });
      await loadFilters();
    });
  });
}

filterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(filterForm).entries());
  await api('/api/filters', { method: 'POST', body: JSON.stringify(data) });
  filterForm.reset();
  await loadFilters();
});

async function loadAll() {
  await Promise.all([loadProducts(), loadTables(), loadFilters()]);
}

// Boot the admin UI
if (isAdminLoggedIn()) {
  hideLogin();
  loadAll().catch(() => {});
} else {
  showLogin();
}
