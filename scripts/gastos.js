let expenses = new Map();
let nextId = 1;

const expenseForm = document.getElementById('expenseForm');
const nameInput = document.getElementById('nameInput');
const descriptionInput = document.getElementById('descriptionInput');
const amountInput = document.getElementById('amountInput');
const expenseAlert = document.getElementById('expenseAlert');
const expenseItems = document.getElementById('expenseItems');
const expensesTotal = document.getElementById('expensesTotal');
const finalizeBtn = document.getElementById('finalizeBtn');

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
    id: nextId++,
    name,
    description,
    amount
  };

  addExpense(expense);
  showAlert(`Gasto "${expense.name}" registrado`, 'success');
  
  expenseForm.reset();
  nameInput.focus();
});

function showAlert(message, type) {
  expenseAlert.textContent = message;
  expenseAlert.className = `alert alert-${type}`;
  expenseAlert.style.display = 'block';
  
  setTimeout(() => {
    expenseAlert.style.display = 'none';
  }, 3000);
}

function addExpense(expense) {
  expenses.set(expense.id, expense);
  updateExpensesView();
}

function updateExpensesView() {
  expenseItems.innerHTML = '';
  let total = 0;

  if (expenses.size === 0) {
    expenseItems.innerHTML = '<div class="empty-message">No hay gastos registrados</div>';
    finalizeBtn.disabled = true;
  } else {
    finalizeBtn.disabled = false;
    for (const [id, expense] of expenses) {
      total += expense.amount;

      const expenseElement = document.createElement('div');
      expenseElement.className = 'expense-item';
      expenseElement.innerHTML = `
        <div>
          <strong>${expense.name}</strong><br>
          <small>${expense.description}</small>
        </div>
        <div>$${expense.amount.toFixed(2)}</div>
      `;
      expenseItems.appendChild(expenseElement);
    }
  }

  expensesTotal.textContent = total.toFixed(2);
}

finalizeBtn.addEventListener('click', () => {
  if (expenses.size > 0) {
    const total = Array.from(expenses.values()).reduce((sum, expense) => sum + expense.amount, 0);
    showAlert(`Registro de gastos finalizado. Total: $${total.toFixed(2)}`, 'success');
    expenses.clear();
    updateExpensesView();
  }
});

updateExpensesView();
nameInput.focus();