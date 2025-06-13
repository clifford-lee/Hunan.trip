document.addEventListener('DOMContentLoaded', function() {
    console.log("终极旅行指南已加载，记账与导航功能已激活！");

    // --- 平滑滚动导航功能 ---
    document.querySelectorAll('#navbar a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // 确保是页面内锚点链接
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 每日记账功能 ---
    const expenseForm = document.getElementById('expense-form');
    // 如果页面上没有记账表单，则不执行后续记账代码
    if (!expenseForm) return;

    const expenseList = document.getElementById('expense-list');
    const totalExpenses = document.getElementById('total-expenses');
    const clearDataBtn = document.getElementById('clear-data');
    const expenseDateInput = document.getElementById('expense-date');

    // 设置日期输入框默认为今天
    expenseDateInput.valueAsDate = new Date();

    // 从 localStorage 加载数据
    let expenses = JSON.parse(localStorage.getItem('tripExpenses_2025')) || [];

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
        localStorage.setItem('tripExpenses_2025', JSON.stringify(expenses));
    }

    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newExpense = {
            id: Date.now(),
            date: document.getElementById('expense-date').value,
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
            expenses = expenses.filter(expense => expense.id !== idToDelete);
            saveData();
            renderExpenses();
        }
    });
    
    clearDataBtn.addEventListener('click', function() {
        if (confirm('您确定要删除所有记账记录吗？此操作不可恢复。')) {
            expenses = [];
            saveData();
            renderExpenses();
        }
    });

    // 初始加载
    renderExpenses();
});