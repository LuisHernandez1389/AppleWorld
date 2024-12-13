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

// Referencias a los nodos 'sales' y 'gastos'
const salesRef = database.ref('sales');
const gastosRef = database.ref('gastos');

// Función para llenar las listas de transacciones
function populateTransactionList(data, elementId, isExpense = false) {
  const element = document.getElementById(elementId);
  element.innerHTML = data.map(transaction => `
    <div class="transaction-item">
      <span class="time-badge">${transaction.timestamp}</span>
      <span>${transaction.description}</span>
      <span class="amount-badge ${isExpense ? 'amount-negative' : 'amount-positive'}">
        ${isExpense ? '-' : ''}$${transaction.amount || transaction.total}
      </span>
    </div>
  `).join('');
}

// Variables globales para almacenar los datos
let salesData = [];
let expensesData = [];

// Función para extraer solo la fecha (antes de la coma) del timestamp
function extractDateFromTimestamp(timestamp) {
  return timestamp.split(',')[0].trim(); // Obtener solo la parte antes de la coma (DD/MM/YYYY) y recortar espacios
}

// Obtener datos de ventas desde Firebase
salesRef.once('value', (snapshot) => {
  const sales = snapshot.val();
  salesData = Object.values(sales).map(sale => ({
    timestamp: extractDateFromTimestamp(sale.timestamp), // Extraemos solo la fecha antes de la coma
    description: sale.products.map(product => product.name).join(', '),
    total: sale.total
  }));

  // Imprimir los datos obtenidos de ventas para depuración
  console.log("Datos de ventas:", salesData);
});

// Obtener datos de gastos desde Firebase
gastosRef.once('value', (snapshot) => {
  const expenses = snapshot.val();
  expensesData = Object.values(expenses).map(expense => ({
    timestamp: extractDateFromTimestamp(expense.timestamp), // Extraemos solo la fecha
    description: expense.name,
    amount: expense.amount
  }));

  // Imprimir los datos obtenidos de gastos para depuración
  console.log("Datos de gastos:", expensesData);
});

// Función para actualizar los resúmenes de ventas
function updateSalesSummary(filteredSales) {
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  document.getElementById('totalSales').textContent = `$${totalSales.toFixed(2)}`;
  document.getElementById('totalTransactions').textContent = filteredSales.length;
  document.getElementById('averageSale').textContent = `$${(totalSales / filteredSales.length).toFixed(2)}`;
  
  // Actualizar balance en la sección de balance
  document.getElementById('balanceSales').textContent = `$${totalSales.toFixed(2)}`;
  
  updateBalance(); // Actualizar el balance general
}

// Función para actualizar los resúmenes de gastos
function updateExpensesSummary(filteredExpenses) {
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById('totalExpenseTransactions').textContent = filteredExpenses.length;
  document.getElementById('averageExpense').textContent = `$${(totalExpenses / filteredExpenses.length).toFixed(2)}`;
  
  // Actualizar balance en la sección de balance
  document.getElementById('balanceExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
  
  updateBalance(); // Actualizar el balance general
}

// Función para calcular y actualizar el balance neto
function updateBalance() {
  const totalSales = parseFloat(document.getElementById('totalSales').textContent.replace('$', '').replace(',', '')) || 0;
  const totalExpenses = parseFloat(document.getElementById('totalExpenses').textContent.replace('$', '').replace(',', '')) || 0;
  const netBalance = totalSales - totalExpenses;

  document.getElementById('netBalance').textContent = `$${netBalance.toFixed(2)}`;

  const margin = totalSales === 0 ? 0 : (netBalance / totalSales) * 100; // Prevenir división por 0
  document.getElementById('margin').textContent = `${margin.toFixed(1)}%`;
}

// Función para manejar la fecha seleccionada para ventas
document.getElementById('salesDate').addEventListener('change', function() {
  const selectedSalesDate = this.value; // Obtener el valor como cadena en formato YYYY-MM-DD

  // Separar la fecha en componentes
  const [year, month, day] = selectedSalesDate.split('-');

  // Formatear la fecha a DD/MM/YYYY
  const formattedSalesDate = `${day}/${month}/${year}`;
  console.log('Fecha seleccionada para ventas:', formattedSalesDate);

  // Filtrar registros de ventas según el timestamp (comparando solo la fecha)
  const filteredSales = salesData.filter(sale => {
    return sale.timestamp === formattedSalesDate; // Solo comparamos la fecha
  });

  // Imprimir los registros filtrados
  console.log("Registros de ventas filtrados por fecha:", filteredSales);

  // Mostrar los registros filtrados
  populateTransactionList(filteredSales, 'salesList');
  updateSalesSummary(filteredSales); // Actualizar los resúmenes de ventas
});

// Función para manejar la fecha seleccionada para gastos
document.getElementById('expensesDate').addEventListener('change', function() {
  const selectedExpensesDate = this.value; // Obtener el valor como cadena en formato YYYY-MM-DD

  // Separar la fecha en componentes
  const [year, month, day] = selectedExpensesDate.split('-');

  // Formatear la fecha a DD/MM/YYYY
  const formattedExpensesDate = `${day}/${month}/${year}`;
  console.log('Fecha seleccionada para gastos:', formattedExpensesDate);

  // Filtrar registros de gastos según el timestamp (comparando solo la fecha)
  const filteredExpenses = expensesData.filter(expense => {
    return expense.timestamp === formattedExpensesDate; // Solo comparamos la fecha
  });

  // Imprimir los registros filtrados
  console.log("Registros de gastos filtrados por fecha:", filteredExpenses);

  // Mostrar los registros filtrados
  populateTransactionList(filteredExpenses, 'expensesList', true);
  updateExpensesSummary(filteredExpenses); // Actualizar los resúmenes de gastos
});
