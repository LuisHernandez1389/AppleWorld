const productsDatabase = {
    '7501234567890': {
      name: 'Producto 1',
      price: 29.99,
      barcode: '7501234567890'
    },
    '7502345678901': {
      name: 'Producto 2',
      price: 49.99,
      barcode: '7502345678901'
    },
    '7503456789012': {
      name: 'Producto 3',
      price: 19.99,
      barcode: '7503456789012'
    }
  };
  
  let cart = new Map();
  
  const searchForm = document.getElementById('searchForm');
  const barcodeInput = document.getElementById('barcodeInput');
  const searchAlert = document.getElementById('searchAlert');
  const productsList = document.getElementById('productsList');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const completeSaleBtn = document.getElementById('completeSaleBtn');
  
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const barcode = barcodeInput.value.trim();
    
    if (barcode === '') {
      showAlert('Por favor ingresa un código de barras', 'error');
      return;
    }
  
    const product = productsDatabase[barcode];
    
    if (product) {
      addToCart(product);
      showAlert(`${product.name} agregado al carrito`, 'success');
      barcodeInput.value = '';
    } else {
      showAlert('Producto no encontrado', 'error');
    }
  });
  
  function showAlert(message, type) {
    searchAlert.textContent = message;
    searchAlert.className = `alert alert-${type}`;
    searchAlert.style.display = 'block';
    
    setTimeout(() => {
      searchAlert.style.display = 'none';
    }, 3000);
  }
  
  function addToCart(product) {
    if (cart.has(product.barcode)) {
      const cartItem = cart.get(product.barcode);
      cartItem.quantity += 1;
    } else {
      cart.set(product.barcode, {
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
      for (const [barcode, item] of cart) {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
  
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
          <div>${item.name}</div>
          <div class="quantity-control">
            <button class="quantity-btn" onclick="updateQuantity('${barcode}', -1)">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${barcode}', 1)">+</button>
          </div>
          <div>$${itemTotal.toFixed(2)}</div>
        `;
        cartItems.appendChild(cartItemElement);
      }
    }
  
    cartTotal.textContent = total.toFixed(2);
  }
  
  function updateQuantity(barcode, change) {
    const item = cart.get(barcode);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        cart.delete(barcode);
      }
      updateCartView();
    }
  }
  
  function displayProducts() {
    productsList.innerHTML = '';
    for (const barcode in productsDatabase) {
      const product = productsDatabase[barcode];
      const productElement = document.createElement('div');
      productElement.className = 'product-item';
      productElement.innerHTML = `
        <div>${product.name}</div>
        <div>Código: ${product.barcode}</div>
        <div>$${product.price.toFixed(2)}</div>
      `;
      productsList.appendChild(productElement);
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
  
  displayProducts();
  updateCartView();
  barcodeInput.focus();