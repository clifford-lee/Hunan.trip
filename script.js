document.addEventListener('DOMContentLoaded', function() {
    console.log("旅行指南(最终完整版)已加载，所有功能已激活！");

    // --- 平滑滚动导航功能 ---
    document.querySelectorAll('#navbar a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // --- 每日记账功能 ---
    const expenseForm = document.getElementById('expense-form');
    if (!expenseForm) return;

    const expenseList = document.getElementById('expense-list');
    const totalExpenses = document.getElementById('total-expenses');
    const clearDataBtn = document.getElementById('clear-data');
    const exportCsvBtn = document.getElementById('export-csv');
    const emailDataBtn = document.getElementById('email-data'); // 新增邮件按钮的引用
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
        if (expenses.length === 0) {
            alert("没有可导出的消费记录。");
            return;
        }
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
    
    // --- 全新：通过邮件发送数据的功能 ---
    function emailData() {
        if (expenses.length === 0) {
            alert("没有可发送的消费记录。");
            return;
        }

        const subject = "2025家庭旅行账单";
        let body = "大家好，\n\n这是本次旅行的消费记录明细：\n\n";
        let total = 0;

        expenses.forEach(expense => {
            body += `${expense.date} | ${expense.item} (${expense.category}): ¥${parseFloat(expense.amount).toFixed(2)}\n`;
            total += parseFloat(expense.amount);
        });

        body += `\n----------------------------------\n`;
        body += `总计: ¥${total.toFixed(2)}\n\n`;
        body += "祝好！\n\n";
        body += "(请注意：如果记录条目过多，此邮件内容可能不完整。建议使用'导出为CSV'功能获取完整数据。)";

        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // 检查链接长度，给出警告
        if (mailtoLink.length > 2000) {
            alert("警告：记账记录太多，可能无法完整放入邮件。建议您使用“导出为CSV文件”功能，然后手动添加附件发送。");
        }

        // 打开邮件客户端
        window.location.href = mailtoLink;
    }

    // --- 事件监听 ---
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
    
    exportCsvBtn.addEventListener('click', exportToCsv);
    emailDataBtn.addEventListener('click', emailData); // 给新的邮件按钮添加点击事件

    // 初始加载
    renderExpenses();
});