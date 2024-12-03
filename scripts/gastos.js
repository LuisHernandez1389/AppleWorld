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
  
  // Referencia al nodo de gastos en Firebase
  const expensesRef = database.ref('gastos');  // Nodo donde guardamos los gastos
  
  let nextId = 1;
  const expenseForm = document.getElementById('expenseForm');
  const nameInput = document.getElementById('nameInput');
  const descriptionInput = document.getElementById('descriptionInput');
  const amountInput = document.getElementById('amountInput');
  const expenseAlert = document.getElementById('expenseAlert');
  const expenseItems = document.getElementById('expenseItems');
  const expensesTotal = document.getElementById('expensesTotal');
  const finalizeBtn = document.getElementById('finalizeBtn');
  
  // Cargar los gastos locales desde localStorage
  function loadLocalExpenses() {
    const localExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    return localExpenses;
  }
  
  // Guardar los gastos locales en localStorage
  function saveLocalExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }
  
  // Evento de agregar gasto
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
  
    if (!name || !description || isNaN(amount)) {
      showAlert('Por favor complete todos los campos correctamente', 'error');
      return;
    }
  
    const expense = {
      id: nextId++,  // Generar un ID para el gasto
      name,
      description,
      amount,
      date: new Date().toLocaleString()  // Guardar la fecha actual en formato de cadena
    };
  
    // Guardar el gasto localmente
    const localExpenses = loadLocalExpenses();
    localExpenses.push(expense);
    saveLocalExpenses(localExpenses);
  
    showAlert(`Gasto "${expense.name}" agregado localmente`, 'success');
    
    // Limpiar el formulario
    expenseForm.reset();
    nameInput.focus();
    updateExpensesView(); // Actualizar la vista
  });
  
  // Función para mostrar alertas
  function showAlert(message, type) {
    expenseAlert.textContent = message;
    expenseAlert.className = `alert alert-${type}`;
    expenseAlert.style.display = 'block';
  
    setTimeout(() => {
      expenseAlert.style.display = 'none';
    }, 3000);
  }
  
  // Actualizar la vista de los gastos
  function updateExpensesView() {
    expenseItems.innerHTML = '';  // Limpiar la lista antes de mostrar los nuevos datos
    let total = 0;
  
    const localExpenses = loadLocalExpenses();  // Obtener los gastos locales
  
    if (localExpenses.length === 0) {
      expenseItems.innerHTML = '<div class="empty-message">No hay gastos registrados</div>';
      finalizeBtn.disabled = true;
      expensesTotal.textContent = '0.00';  // Reiniciar el total a 0
      return;
    }
  
    finalizeBtn.disabled = false;
  
    localExpenses.forEach((expense) => {
      total += expense.amount;
  
      const expenseElement = document.createElement('div');
      expenseElement.className = 'expense-item';
      expenseElement.innerHTML = `
        <div>
          <strong>${expense.name}</strong><br>
          <small>${expense.description}</small><br>
          <small>Fecha: ${expense.date}</small>  <!-- Mostrar la fecha -->
        </div>
        <div>$${expense.amount.toFixed(2)}</div>
      `;
      expenseItems.appendChild(expenseElement);
    });
  
    // Mostrar el total actualizado
    expensesTotal.textContent = total.toFixed(2);
  }
  
  // Finalizar el registro de los gastos
  finalizeBtn.addEventListener('click', () => {
    const localExpenses = loadLocalExpenses();
    if (localExpenses.length > 0) {
      // Guardar los gastos en Firebase
      localExpenses.forEach((expense) => {
        expensesRef.push(expense);  // Guardamos cada gasto en Firebase bajo el nodo 'gastos'
      });
  
      showAlert('Gastos registrados exitosamente en Firebase', 'success');
  
      // Limpiar los gastos locales
      localStorage.removeItem('expenses');
      updateExpensesView();  // Actualizar la vista para reflejar que no hay más gastos
    } else {
      showAlert('No hay gastos para finalizar el registro', 'error');
    }
  });
  
  // Cargar la vista de los gastos al iniciar
  updateExpensesView();
  nameInput.focus();
  