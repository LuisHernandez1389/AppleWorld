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

let productsRef = database.ref('products');
let nextId = 1;
let editingProductId = null; // Variable para almacenar el ID del producto que se está editando

// Elementos del DOM
const productForm = document.getElementById('productForm');
const productsTableBody = document.getElementById('productsTableBody');
const productAlert = document.getElementById('productAlert');

// Evento para agregar o actualizar un producto
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
        id: nextId++, // Coma faltante aquí
        name: document.getElementById('nameInput').value.trim(),
        description: document.getElementById('descriptionInput').value.trim(),
        stock: parseInt(document.getElementById('stockInput').value),
        price: parseFloat(document.getElementById('priceInput').value),
        barcode: document.getElementById('barcodeInput').value.trim()  // Capturamos el código de barras
    };

    if (editingProductId) {
        // Si estamos editando un producto, actualizamos
        updateProduct(editingProductId, product);
    } else {
        // Si no, agregamos un nuevo producto
        addProduct(product);
    }
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

// Función para agregar un producto a Firebase
function addProduct(product) {
    productsRef.push(product)
        .then(() => {
            showAlert('Producto agregado exitosamente', 'success');
            updateProductsView();
        })
        .catch((error) => {
            showAlert('Error al agregar producto: ' + error.message, 'error');
        });
}

// Función para actualizar la vista de productos
function updateProductsView() {
    productsTableBody.innerHTML = '';

    productsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const product = childSnapshot.val();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.stock}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.barcode}</td>  <!-- Mostrar el código de barras -->
                <td>
                    <button class="btn btn-edit" onclick="editProduct('${childSnapshot.key}')">Editar</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${childSnapshot.key}')">Eliminar</button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    });
}

// Función para editar un producto
function editProduct(id) {
    productsRef.child(id).once('value', (snapshot) => {
        const product = snapshot.val();
        document.getElementById('nameInput').value = product.name;
        document.getElementById('descriptionInput').value = product.description;
        document.getElementById('stockInput').value = product.stock;
        document.getElementById('priceInput').value = product.price;
        document.getElementById('barcodeInput').value = product.barcode; // Establecer el código de barras

        // Establecer el ID del producto que se está editando
        editingProductId = id;
    });
}

// Función para actualizar un producto en Firebase
function updateProduct(id, updatedProduct) {
    productsRef.child(id).update(updatedProduct)
        .then(() => {
            showAlert('Producto actualizado exitosamente', 'success');
            productForm.reset();
            editingProductId = null; // Reiniciar la variable de edición
            updateProductsView();
        })
        .catch((error) => {
            showAlert('Error al actualizar producto: ' + error.message, 'error');
        });
}

// Función para eliminar un producto de Firebase
function deleteProduct(id) {
    productsRef.child(id).remove()
        .then(() => {
            showAlert('Producto eliminado exitosamente', 'success');
            updateProductsView();
        })
        .catch((error) => {
            showAlert('Error al eliminar producto: ' + error.message, 'error');
        });
}

// Cargar productos al iniciar
updateProductsView();
