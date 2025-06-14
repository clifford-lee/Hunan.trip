document.addEventListener('DOMContentLoaded', function() {
    console.log("旅行指南(交互最终修复版)已加载！");

    // --- 全新、更稳定的下拉菜单交互逻辑 ---

    // 获取所有下拉菜单的按钮
    const dropdownBtns = document.querySelectorAll('.dropbtn');

    // 定义一个函数来关闭所有打开的下拉菜单
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.classList.remove('show');
        });
    }

    // 为每个按钮添加点击事件
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function(event) {
            // 阻止点击按钮时，事件冒泡到window，导致菜单刚打开就关闭
            event.stopPropagation();
            
            const currentContent = this.nextElementSibling;
            const isCurrentlyShown = currentContent.classList.contains('show');

            // 先关闭所有其他菜单
            closeAllDropdowns();

            // 如果当前菜单是关闭的，则打开它
            if (!isCurrentlyShown) {
                currentContent.classList.add('show');
            }
        });
    });

    // 为所有页面内的锚点链接（包括下拉菜单里的）添加事件
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // 首先，关闭所有下拉菜单
            closeAllDropdowns();
            
            // 然后执行平滑滚动
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // 当点击窗口任何地方时，关闭所有菜单
    window.addEventListener('click', function(event) {
        // 确保点击的不是下拉菜单按钮本身（因为按钮有自己的开关逻辑）
        if (!event.target.matches('.dropbtn')) {
            closeAllDropdowns();
        }
    });


    // --- 每日记账功能 (代码无变化) ---
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        const expenseList = document.getElementById('expense-list');
        const totalExpenses = document.getElementById('total-expenses');
        const clearDataBtn = document.getElementById('clear-data');
        const exportCsvBtn = document.getElementById('export-csv');
        const emailDataBtn = document.getElementById('email-data');
        const expenseDateInput = document.getElementById('expense-date');

        expenseDateInput.valueAsDate = new Date();
        let expenses = JSON.parse(localStorage.getItem('tripExpenses_2025_final_v4')) || [];

        function renderExpenses() {
            expenseList.innerHTML = '';
            let total = 0;
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
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
            localStorage.setItem('tripExpenses_2025_final_v4', JSON.stringify(expenses));
        }

        function exportToCsv() {
            if (expenses.length === 0) { alert("没有可导出的消费记录。"); return; }
            let csvContent = "data:text/csv;charset=utf-8,日期,项目,类别,金额\n";
            expenses.forEach(expense => {
                let row = `${expense.date},"${expense.item.replace(/"/g, '""')}",${expense.category},${expense.amount}`;
                csvContent += row + "\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "2025家庭旅行账单.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function emailData() {
            if (expenses.length === 0) { alert("没有可发送的消费记录。"); return; }
            const subject = "2025家庭旅行账单";
            let body = "大家好，\n\n这是本次旅行的消费记录明细：\n\n";
            let total = 0;
            expenses.forEach(expense => {
                body += `${expense.date} | ${expense.item} (${expense.category}): ¥${parseFloat(expense.amount).toFixed(2)}\n`;
                total += parseFloat(expense.amount);
            });
            body += `\n----------------------------------\n总计: ¥${total.toFixed(2)}\n\n(提示：若记录过多，邮件内容可能不完整，建议使用“导出CSV”功能。)`;
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            if (mailtoLink.length > 2000) {
                alert("警告：记账记录太多，可能无法完整放入邮件。建议您使用“导出为CSV文件”功能，然后手动添加附件发送。");
            }
            window.location.href = mailtoLink;
        }

        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newExpense = { id: Date.now(), date: expenseDateInput.value, item: document.getElementById('expense-item').value, category: document.getElementById('expense-category').value, amount: document.getElementById('expense-amount').value };
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
        
        exportCsvBtn.addEventListener('click', exportToCsv);
        emailDataBtn.addEventListener('click', emailData);
        
        renderExpenses();
    }
    
    // --- 互动式清单功能 (代码无变化) ---
    function initializeChecklists() {
        // ... (这部分代码与上一版完全相同，请保留)
    }

    // --- 实时天气组件功能 (代码无变化) ---
    async function fetchWeather() {
        // ... (这部分代码与上一版完全相同，请保留)
    }

    // 页面加载后初始化所有功能
    initializeChecklists();
    fetchWeather();
});