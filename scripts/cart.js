// Модуль кошика
const cart = {
    items: JSON.parse(localStorage.getItem('cart')) || [],
  
    // Додати товар
    add(productId, quantity = 1) {
      const existingItem = this.items.find(item => item.id === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({ id: productId, quantity });
      }
      
      this.save();
      this.updateUI();
    },
  
    // Видалити товар
    remove(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.save();
      this.updateUI();
    },
  
    // Оновити кількість
    update(productId, newQuantity) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        item.quantity = newQuantity;
        this.save();
        this.updateUI();
      }
    },
  
    // Зберегти у localStorage
    save() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },
  
    // Оновити інтерфейс
    updateUI() {
      this.updateCounter();
      if (document.getElementById('cart-items')) {
        this.render();
      }
    },
  
    // Оновити лічильник
    updateCounter() {
      const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
      document.querySelectorAll('.cart-counter').forEach(el => {
        el.textContent = totalItems;
      });
    },
  
    // Відобразити кошик
    async render() {
      const { products } = await import('./products-data.js');
      const container = document.getElementById('cart-items');
      const totalElement = document.getElementById('total-price');
      
      if (!this.items.length) {
        container.innerHTML = '<p class="empty-cart">Кошик порожній</p>';
        totalElement.textContent = '0';
        return;
      }
  
      let total = 0;
      container.innerHTML = this.items.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        
        return `
          <div class="cart-item" data-id="${product.id}">
            <img src="images/${product.image}" alt="${product.name}">
            <div class="cart-item-info">
              <h4>${product.name}</h4>
              <p>${product.price} ₴ × ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
              <button class="quantity-btn minus">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn plus">+</button>
              <button class="remove-btn">×</button>
            </div>
            <div class="cart-item-total">${itemTotal} ₴</div>
          </div>
        `;
      }).join('');
  
      totalElement.textContent = total;
    }
  };
  
  // Обробники подій
  function setupCartHandlers() {
    // Додавання товару з каталогу
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart')) {
        const productId = parseInt(e.target.dataset.id);
        cart.add(productId);
        
        // Анімація додавання
        e.target.textContent = 'Додано!';
        setTimeout(() => {
          e.target.textContent = 'В кошик';
        }, 1000);
      }
    });
  
    // Управління кошиком
    document.addEventListener('click', (e) => {
      const cartItem = e.target.closest('.cart-item');
      if (!cartItem) return;
      
      const productId = parseInt(cartItem.dataset.id);
      
      if (e.target.classList.contains('remove-btn')) {
        cart.remove(productId);
      } else if (e.target.classList.contains('minus')) {
        const item = cart.items.find(item => item.id === productId);
        if (item.quantity > 1) {
          cart.update(productId, item.quantity - 1);
        } else {
          cart.remove(productId);
        }
      } else if (e.target.classList.contains('plus')) {
        const item = cart.items.find(item => item.id === productId);
        cart.update(productId, item.quantity + 1);
      }
    });
  }
  
  // Ініціалізація
  document.addEventListener('DOMContentLoaded', () => {
    cart.updateCounter();
    setupCartHandlers();
  });
  
  export default cart;