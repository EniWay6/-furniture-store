const cart = {
    items: JSON.parse(localStorage.getItem('cart')) || [],
    productsData: null,
    async init() {
      await this.loadProductsData();
      this.updateCounter();
      this.setupEventListeners();
      this.renderCartItems();
    },
    async loadProductsData() {
      try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Network response was not ok');
        this.productsData = await response.json();
      } catch (error) {
        console.error('Error loading products:', error);
        this.productsData = { products: [] };
      }
    },
    async add(productId) {
      await this.ensureProductsLoaded();
      const product = this.productsData.products.find(p => p.id === productId);
      if (!product) {
        console.error('Product not found:', productId);
        return;
      }
      const existingItem = this.items.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        });
      }
      this.save();
      this.updateUI();
      this.showAddNotification(product.name);
    },
    remove(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.save();
      this.updateUI();
    },
    updateQuantity(productId, change) {
      const item = this.items.find(item => item.id === productId);
      if (!item) return;
      item.quantity += change;
      if (item.quantity <= 0) {
        this.remove(productId);
      } else {
        this.save();
        this.updateUI();
      }
    },
    save() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
    updateUI() {
      this.updateCounter();
      this.renderCartItems();
    },
    updateCounter() {
      const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
      const counter = document.querySelector('.cart-counter');
      if (counter) {
        counter.textContent = totalItems;
        counter.style.visibility = totalItems > 0 ? 'visible' : 'hidden';
      }
    },
    renderCartItems() {
      const container = document.getElementById('cart-items');
      const totalElement = document.getElementById('total-price');
      if (!container || !totalElement) {
        console.error('Cart elements not found');
        return;
      } 
      if (this.items.length === 0) {
        container.innerHTML = '<p class="empty-cart">Кошик порожній</p>';
        totalElement.textContent = '0';
        return;
      }
      let total = 0;
      container.innerHTML = this.items.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
          <div class="cart-item" data-id="${item.id}">
            <img src="images/${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
              <h4>${item.name}</h4>
              <p>${item.price} ₴ × ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
              <button class="btn-quantity minus">-</button>
              <span>${item.quantity}</span>
              <button class="btn-quantity plus">+</button>
              <button class="btn-remove">×</button>
            </div>
            <div class="cart-item-total">${itemTotal} ₴</div>
          </div>
        `;
      }).join('');
      totalElement.textContent = total.toFixed(2);
    },
    showAddNotification(productName) {
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = `${productName} додано до кошика!`;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 2000);
      }, 100);
    },
    async ensureProductsLoaded() {
      if (!this.productsData) {
        await this.loadProductsData();
      }
    },
    setupEventListeners() {
      document.getElementById('cart-btn')?.addEventListener('click', () => this.toggleCart());
      document.querySelector('.modal .close')?.addEventListener('click', () => this.toggleCart());
      document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-to-cart')) {
          const productCard = e.target.closest('[data-id]');
          if (productCard) {
            const productId = parseInt(productCard.dataset.id);
            if (!isNaN(productId)) {
              await this.add(productId);
            }
          }
        }
      });
      document.getElementById('cart-items')?.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;  
        const productId = parseInt(cartItem.dataset.id);  
        if (e.target.classList.contains('btn-remove')) {
          this.remove(productId);
        } else if (e.target.classList.contains('minus')) {
          this.updateQuantity(productId, -1);
        } else if (e.target.classList.contains('plus')) {
          this.updateQuantity(productId, 1);
        }
      });
      document.querySelector('.checkout-btn')?.addEventListener('click', () => {
        if (this.items.length === 0) {
          alert('Кошик порожній!');
          return;
        }
        alert(`Замовлення на суму ${document.getElementById('total-price').textContent} ₴ оформлено!`);
        this.items = [];
        this.save();
        this.updateUI();
        this.toggleCart();
      });
    },
    toggleCart() {
      const modal = document.getElementById('cart-modal');
      if (modal) {
        modal.classList.toggle('show');
        document.body.style.overflow = modal.classList.contains('show') ? 'hidden' : '';
      }
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    cart.init();
  });