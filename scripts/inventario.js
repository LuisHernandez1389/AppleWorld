let products = new Map();
let nextId = 1;
let isEditing = false;

const productForm = document.getElementById('productForm');
const productId = document.getElementById('productId');
const nameInput = document.getElementById('nameInput');
const descriptionInput = document.getElementById('descriptionInput');
const stockInput = document.getElementById('stockInput');
const priceInput = document.getElementById('priceInput');
const productAlert = document.getElementById('productAlert');
const submitBtn = document.getElementById('submitBtn');
const productsTableBody = document.getElementById('productsTableBody');

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const product = {
    id: isEditing ? parseInt(productId.value) : nextId++,
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
    stock: parseInt(stockInput.value),
    price: parseFloat(priceInput.value)
  };

  if (isEditing) {
    updateProduct(product);
  } else {
    addProduct(product);
  }
  
  resetForm();
});

function showAlert(message, type) {
  productAlert.textContent = message;
  productAlert.className = `alert alert-${type}`;
  productAlert.style.display = 'block';
  
  setTimeout(() => {
    productAlert.style.display = 'none';
  }, 3000);
}

function addProduct(product) {
  products.set(product.id, product);
  updateProductsView();
  showAlert('Producto agregado exitosamente', 'success');
}

function updateProduct(product) {
  products.set(product.id, product);
  updateProductsView();
  showAlert('Producto actualizado exitosamente', 'success');
}

function deleteProduct(id) {
  products.delete(id);
  updateProductsView();
  showAlert('Producto eliminado exitosamente', 'success');
}

function editProduct(id) {
  const product = products.get(id);
  if (!product) return;

  productId.value = product.id;
  nameInput.value = product.name;
  descriptionInput.value = product.description;
  stockInput.value = product.stock;
  priceInput.value = product.price;

  submitBtn.textContent = 'Actualizar Producto';
  isEditing = true;
}

function resetForm() {
  productForm.reset();
  productId.value = '';
  submitBtn.textContent = 'Agregar Producto';
  isEditing = false;
}

function updateProductsView() {
  productsTableBody.innerHTML = '';

  if (products.size === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-message">No hay productos registrados</div>
        </td>
      </tr>
    `;
    return;
  }

  for (const [id, product] of products) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.description}</td>
      <td>${product.stock}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-edit" onclick="editProduct(${id})">
            Editar
          </button>
          <button class="btn btn-danger" onclick="deleteProduct(${id})">
            Eliminar
          </button>
        </div>
      </td>
    `;
    productsTableBody.appendChild(row);
  }
}

updateProductsView();