let cart = new Map();
let nextId = 1;

const productForm = document.getElementById('productForm');
const nameInput = document.getElementById('nameInput');
const descriptionInput = document.getElementById('descriptionInput');
const priceInput = document.getElementById('priceInput');
const productAlert = document.getElementById('productAlert');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const completeSaleBtn = document.getElementById('completeSaleBtn');

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const price = parseFloat(priceInput.value);
  
  if (!name || !description || isNaN(price)) {
    showAlert('Por favor complete todos los campos correctamente', 'error');
    return;
  }

  const product = {
    id: nextId++,
    name,
    description,
    price
  };

  addToCart(product);
  showAlert(`${product.name} agregado al carrito`, 'success');
  
  // Limpiar el formulario
  productForm.reset();
  nameInput.focus();
});

function showAlert(message, type) {
  productAlert.textContent = message;
  productAlert.className = `alert alert-${type}`;
  productAlert.style.display = 'block';
  
  setTimeout(() => {
    productAlert.style.display = 'none';
  }, 3000);
}

function addToCart(product) {
  if (cart.has(product.id)) {
    const cartItem = cart.get(product.id);
    cartItem.quantity += 1;
  } else {
    cart.set(product.id, {
      ...product,
      quantity: 1
    });
  }
  updateCartView();
}

function updateCartView() {
  cartItems.innerHTML = '';
  let total = 0;

  if (cart.size === 0) {
    cartItems.innerHTML = '<div class="empty-message">El carrito está vacío</div>';
    completeSaleBtn.disabled = true;
  } else {
    completeSaleBtn.disabled = false;
    for (const [id, item] of cart) {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      cartItemElement.innerHTML = `
        <div>${item.name}</div>
        <div class="quantity-control">
          <button class="quantity-btn" onclick="updateQuantity(${id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${id}, 1)">+</button>
        </div>
        <div>$${itemTotal.toFixed(2)}</div>
      `;
      cartItems.appendChild(cartItemElement);
    }
  }

  cartTotal.textContent = total.toFixed(2);
}

function updateQuantity(productId, change) {
  const item = cart.get(productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart.delete(productId);
    }
    updateCartView();
  }
}

completeSaleBtn.addEventListener('click', () => {
  if (cart.size > 0) {
    const total = Array.from(cart.values()).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showAlert(`Venta completada con éxito. Total: $${total.toFixed(2)}`, 'success');
    cart.clear();
    updateCartView();
  }
});

updateCartView();
nameInput.focus();