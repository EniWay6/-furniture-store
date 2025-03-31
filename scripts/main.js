// Імпорт модулів
import cart from './cart.js';
import { loadProducts } from './products-data.js';

// Основна функція ініціалізації
async function initApp() {
  // Ініціалізація кошика
  cart.init();

  // Завантаження товарів (для головної сторінки)
  if (document.getElementById('featured-products')) {
    await renderFeaturedProducts();
  }

  // Ініціалізація модального вікна кошика
  initCartModal();

  // Ініціалізація мобільного меню
  initMobileMenu();
}

// Відображення рекомендованих товарів (на головній)
async function renderFeaturedProducts() {
  const { products } = await loadProducts();
  const featuredContainer = document.getElementById('featured-products');
  
  // Вибір 4 випадкових товарів
  const featuredProducts = [...products]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  featuredContainer.innerHTML = featuredProducts.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="images/${product.image}" alt="${product.name}" loading="lazy">
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

// Ініціалізація модального вікна кошика
function initCartModal() {
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const closeBtn = cartModal.querySelector('.close');

  // Відкриття кошика
  cartBtn?.addEventListener('click', async () => {
    await cart.render();
    cartModal.style.display = 'block';
  });

  // Закриття кошика
  closeBtn?.addEventListener('click', () => {
    cartModal.style.display = 'none';
  });

  // Закриття при кліку поза вікном
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.style.display = 'none';
    }
  });
}

// Мобільне меню
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const nav = document.querySelector('.nav');

  menuToggle?.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('open');
  });
}

// Запуск додатка при повному завантаженні DOM
document.addEventListener('DOMContentLoaded', initApp);

// Глобальний обробник кліків для додавання в кошик
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    const productId = parseInt(e.target.dataset.id);
    cart.add(productId);
    
    // Анімація підтвердження
    e.target.textContent = '✓ Додано';
    e.target.classList.add('added');
    setTimeout(() => {
      e.target.textContent = 'В кошик';
      e.target.classList.remove('added');
    }, 2000);
  }
});