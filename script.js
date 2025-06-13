document.addEventListener('DOMContentLoaded', function() {
    console.log("终极旅行指南已加载，所有功能已激活！");

    // --- 平滑滚动导航功能 ---
    document.querySelectorAll('#navbar a').forEach(anchor => {
        if (anchor.getAttribute('href').startsWith('#')) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }
    });

    // --- 每日记账功能 ---
    const expenseForm = document.getElementById('expense-form');
    if (!expenseForm) return;

    const expenseList = document.getElementById('expense-list');
    const totalExpenses = document.getElementById('total-expenses');
    const clearDataBtn = document.getElementById('clear-data');
    const expenseDateInput = document.getElementById('expense-date');

    expenseDateInput.valueAsDate = new Date();
    let expenses = JSON.parse(localStorage.getItem('tripExpenses_2025_final')) || [];

    function renderExpenses() {
        expenseList.innerHTML = '';
        let total = 0;
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.item}</td>
                <td>${expense.category}</td>
                <td>${parseFloat(expense.amount).toFixed(2)}</td>
                <td><button class="delete-btn" data-id="${expense.id}">删除</button></td>
            `;
            expenseList.appendChild(row);
            total += parseFloat(expense.amount);
        });
        totalExpenses.textContent = `总计: ¥ ${total.toFixed(2)}`;
    }

    function saveData() {
        localStorage.setItem('tripExpenses_2025_final', JSON.stringify(expenses));
    }

    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newExpense = {
            id: Date.now(),
            date: expenseDateInput.value,
            item: document.getElementById('expense-item').value,
            category: document.getElementById('expense-category').value,
            amount: document.getElementById('expense-amount').value
        };
        expenses.push(newExpense);
        saveData();
        renderExpenses();
        expenseForm.reset();
        expenseDateInput.valueAsDate = new Date();
    });

    expenseList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const idToDelete = parseInt(e.target.dataset.id);
            if (confirm('您确定要删除这条记录吗？')) {
                expenses = expenses.filter(expense => expense.id !== idToDelete);
                saveData();
                renderExpenses();
            }
        }
    });
    
    clearDataBtn.addEventListener('click', function() {
        if (confirm('您确定要删除所有记账记录吗？此操作不可恢复。')) {
            expenses = [];
            saveData();
            renderExpenses();
        }
    });

    renderExpenses();
});