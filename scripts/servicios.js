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

// Referencias a la base de datos de productos y ventas
const salesRef = database.ref('sales');  // Nodo para registrar ventas

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

// Evento de agregar producto al carrito
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

// Función para mostrar alertas
function showAlert(message, type) {
  productAlert.textContent = message;
  productAlert.className = `alert alert-${type}`;
  productAlert.style.display = 'block';
  
  setTimeout(() => {
    productAlert.style.display = 'none';
  }, 3000);
}

// Agregar producto al carrito
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

// Actualizar la vista del carrito
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

// Actualizar la cantidad de un producto en el carrito
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

// Función para formatear la fecha en el formato "YYYY-MM-DD HH:mm:ss"
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos
  const day = String(date.getDate()).padStart(2, '0'); // Día con dos dígitos
  const hours = String(date.getHours()).padStart(2, '0'); // Hora con dos dígitos
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutos con dos dígitos
  const seconds = String(date.getSeconds()).padStart(2, '0'); // Segundos con dos dígitos

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
        price: item.price,
        quantity: item.quantity
      })),
      total: total,
      timestamp: new Date().toLocaleString()  // Usamos la función formatDate para obtener la fecha en formato deseado
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

// Cargar la vista del carrito al iniciar
updateCartView();
nameInput.focus();
