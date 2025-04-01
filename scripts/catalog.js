async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Не вдалося завантажити дані');
        return await response.json();
    } catch (error) {
        console.error('Помилка завантаження:', error);
        return { products: [], categories: [] };
    }
}
async function renderProducts(products) {
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
                </div>
            </div>
        </div>
    `).join('');
}
async function filterAndSortProducts() {
    const { products } = await loadProducts();
    const category = document.getElementById('category-filter').value;
    const search = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-by').value;
    const priceMax = document.getElementById('price-max').value;
    let filteredProducts = products.filter(product => {
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(search) || 
                              product.material.toLowerCase().includes(search);
        const matchesPrice = product.price <= priceMax;
        return matchesCategory && matchesSearch && matchesPrice;
    });
    if (sortBy === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }
    renderProducts(filteredProducts);
}
document.addEventListener('DOMContentLoaded', async () => {
    const { categories } = await loadProducts();
    const categorySelect = document.getElementById('category-filter');
    categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });
    await filterAndSortProducts();
    document.getElementById('category-filter').addEventListener('change', filterAndSortProducts);
    document.getElementById('search-input').addEventListener('input', filterAndSortProducts);
    document.getElementById('sort-by').addEventListener('change', filterAndSortProducts);
    document.getElementById('price-max').addEventListener('input', filterAndSortProducts);
});
