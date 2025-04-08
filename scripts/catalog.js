let allProducts = [];

async function loadProducts() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    allProducts = JSON.parse(savedProducts);
  } else {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Не вдалося завантажити дані');
      const data = await response.json();
      allProducts = data.products;
    } catch (error) {
      console.error('Помилка завантаження:', error);
    }
  }
}

function renderProducts(products) {
  const container = document.getElementById('products-container');
  if (!products.length) {
    container.innerHTML = '<p class="no-products">Товари не знайдено</p>';
    return;
  }
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="images/products/${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.material}</p>
        <div class="product-footer">
          <span>${product.price.toLocaleString()} ₴</span>
          <button class="add-to-cart" data-id="${product.id}">В кошик</button>
          ${localStorage.getItem('admin') === 'true' ? 
            `<button class="delete-product" data-id="${product.id}">Видалити</button>` : ''}
        </div>
      </div>
    </div>`).join('');

  const deleteButtons = document.querySelectorAll('.delete-product');
  deleteButtons.forEach(button => {
    button.addEventListener('click', deleteProduct);
  });
}

function filterAndSortProducts() {
  const category = document.getElementById('category-filter').value;
  const search = document.getElementById('search-input').value.toLowerCase();
  const sortBy = document.getElementById('sort-by').value;
  const priceMax = document.getElementById('price-max').value;
  let filtered = allProducts.filter(product => {
    return (category === 'all' || product.category === category) &&
      (product.name.toLowerCase().includes(search) || product.material.toLowerCase().includes(search)) &&
      product.price <= priceMax;
  });

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  renderProducts(filtered);
}

function setupAdminPanel() {
  const loginBtn = document.getElementById('admin-login-btn');
  const loginForm = document.getElementById('admin-login');
  const panel = document.getElementById('admin-panel');

  loginBtn.addEventListener('click', () => {
    loginForm.style.display = 'block';
  });

  document.getElementById('submit-login').addEventListener('click', () => {
    const u = document.getElementById('admin-username').value;
    const p = document.getElementById('admin-password').value;
    if (u === 'admin' && p === 'admin123') {
      localStorage.setItem('admin', 'true');
      loginForm.style.display = 'none';
      panel.style.display = 'block';
      renderProducts(allProducts); 
    } else {
      alert('Невірні дані');
    }
  });

  document.getElementById('logout-admin').addEventListener('click', () => {
    localStorage.removeItem('admin');
    panel.style.display = 'none';
    renderProducts(allProducts); 
  });

  document.getElementById('add-product-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('new-name').value;
    const material = document.getElementById('new-material').value;
    const price = parseInt(document.getElementById('new-price').value);
    const image = document.getElementById('new-image').value;
    const category = document.getElementById('new-category').value;
    const newProduct = { id: Date.now(), name, material, price, image, category, rating: 0 };
    allProducts.push(newProduct);
    localStorage.setItem('products', JSON.stringify(allProducts));
    renderProducts(allProducts);
  });

  if (localStorage.getItem('admin') === 'true') {
    panel.style.display = 'block';
    renderProducts(allProducts); 
  }
}

function deleteProduct(event) {
  const productId = event.target.getAttribute('data-id');
  allProducts = allProducts.filter(product => product.id !== parseInt(productId));
  localStorage.setItem('products', JSON.stringify(allProducts)); 
  renderProducts(allProducts); 
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  filterAndSortProducts();

  document.getElementById('category-filter').addEventListener('change', filterAndSortProducts);
  document.getElementById('search-input').addEventListener('input', filterAndSortProducts);
  document.getElementById('sort-by').addEventListener('change', filterAndSortProducts);
  document.getElementById('price-max').addEventListener('input', filterAndSortProducts);

  setupAdminPanel();
});
