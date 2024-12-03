// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAE25LO6fKSQlEnnudNe-wMwg6HJOfgbR0",
  authDomain: "apple-world-obregon.firebaseapp.com",
  databaseURL: "https://apple-world-obregon-default-rtdb.firebaseio.com",
  projectId: "apple-world-obregon",
  storageBucket: "apple-world-obregon.firebasestorage.app",
  messagingSenderId: "707131530457",
  appId: "1:707131530457:web:fe2519039f8b22736e32c8"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referencia al nodo de productos y ventas en Firebase
const productsRef = database.ref('products');
const salesRef = database.ref('sales');

let cart = new Map();

const searchForm = document.getElementById('searchForm');
const barcodeInput = document.getElementById('barcodeInput');
const searchAlert = document.getElementById('searchAlert');
const productsList = document.getElementById('productsList');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const completeSaleBtn = document.getElementById('completeSaleBtn');

// Buscar producto por código de barras
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const barcode = barcodeInput.value.trim();

  if (barcode === '') {
    showAlert('Por favor ingresa un código de barras', 'error');
    return;
  }

  // Buscar producto por barcode en Firebase
  productsRef.orderByChild('barcode').equalTo(barcode).once('value').then((snapshot) => {
    const product = snapshot.val();

    if (product) {
      const productData = Object.values(product)[0]; // Obtener el primer producto de la respuesta
      addToCart(productData);
      showAlert(`${productData.name} agregado al carrito`, 'success');
      barcodeInput.value = '';
    } else {
      showAlert('Producto no encontrado', 'error');
    }
  });
});

// Mostrar alertas
function showAlert(message, type) {
  searchAlert.textContent = message;
  searchAlert.className = `alert alert-${type}`;
  searchAlert.style.display = 'block';

  setTimeout(() => {
    searchAlert.style.display = 'none';
  }, 3000);
}

// Agregar producto al carrito
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

// Actualizar la vista del carrito
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

// Actualizar la cantidad de un producto en el carrito
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

// Completar la venta y guardar la información en Firebase
completeSaleBtn.addEventListener('click', () => {
  if (cart.size > 0) {
    const total = Array.from(cart.values()).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showAlert(`Venta completada con éxito. Total: $${total.toFixed(2)}`, 'success');

    // Crear objeto de venta
    const sale = {
      products: Array.from(cart.values()).map(item => ({
        name: item.name,
        barcode: item.barcode,
        price: item.price,
        quantity: item.quantity
      })),
      total: total,
      timestamp: new Date().toLocaleString()  // Usar toLocaleString() para la fecha
    };

    // Guardar la venta en Firebase
    salesRef.push(sale)
      .then(() => {
        cart.clear();
        updateCartView();
      })
      .catch((error) => {
        showAlert('Error al completar la venta: ' + error.message, 'error');
      });
  }
});

// Mostrar productos disponibles desde Firebase
function displayProducts() {
  productsList.innerHTML = '';
  productsRef.once('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      const productElement = document.createElement('div');
      productElement.className = 'product-item';
      productElement.innerHTML = `
        <div>${product.name}</div>
        <div>Código: ${product.barcode}</div>
        <div>$${product.price.toFixed(2)}</div>
      `;
      productsList.appendChild(productElement);
    });
  });
}

displayProducts();
updateCartView();
barcodeInput.focus();
