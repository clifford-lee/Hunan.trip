document.addEventListener('DOMContentLoaded', function() {
    console.log("旅行指南(iOS兼容最终修复版)已加载！");

    // --- 全新、兼容iOS的下拉菜单交互逻辑 ---

    // 定义一个函数来关闭所有打开的下拉菜单
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
            openDropdown.classList.remove('show');
        });
    }

    // 为每个下拉按钮添加点击事件
    document.querySelectorAll('.dropbtn').forEach(btn => {
        btn.addEventListener('click', function(event) {
            // 阻止事件冒泡，以防其他监听器干扰
            event.stopPropagation();
            
            const currentContent = this.nextElementSibling;
            const isCurrentlyShown = currentContent.classList.contains('show');

            // 先关闭所有其他菜单
            closeAllDropdowns();
            
            // 如果刚才点击的这个菜单是关闭的，现在就打开它
            if (!isCurrentlyShown) {
                currentContent.classList.add('show');
            }
        });
    });

    // 为所有导航栏的链接（包括下拉菜单里的）添加点击事件
    document.querySelectorAll('#navbar a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            // 先关闭所有菜单
            closeAllDropdowns();

            // 然后平滑滚动
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 关键修复：同时监听 'click' (桌面端) 和 'touchend' (移动端) 事件来关闭菜单
    ['click', 'touchend'].forEach(function(event_type) {
        document.addEventListener(event_type, function(event) {
            // 检查点击/触摸的是否是下拉按钮本身，如果不是，则继续
            if (!event.target.closest('.dropbtn')) {
                // 检查点击/触摸的是否在下拉菜单内容之内，如果不是，则关闭
                if (!event.target.closest('.dropdown-content')) {
                    closeAllDropdowns();
                }
            }
        });
    });


    // --- 互动式清单功能 ---
    function initializeChecklists() {
        const checklists = document.querySelectorAll('.interactive-checklist');
        if (!checklists.length) return;
        let savedStatus = JSON.parse(localStorage.getItem('checklistStatus_v1')) || {};
        checklists.forEach(list => {
            list.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                if (savedStatus[checkbox.id]) {
                    checkbox.checked = true;
                }
                checkbox.addEventListener('change', function() {
                    savedStatus[this.id] = this.checked;
                    localStorage.setItem('checklistStatus_v1', JSON.stringify(savedStatus));
                });
            });
        });
    }

    // --- 实时天气组件功能 ---
    async function fetchWeather() {
        const container = document.getElementById('weather-widget-container');
        if (!container) return;
        const apiKey = '0befc4de14e844dd09545fd0e78cd485';

        if (!apiKey || apiKey === '在此处粘贴您的API密钥') {
            container.innerHTML = '<p>天气功能需要配置API密钥后才能使用。</p>';
            return;
        }

        const cities = [{ name: '宜昌', q: 'Yichang' },{ name: '恩施', q: 'Enshi' },{ name: '重庆', q: 'Chongqing' },{ name: '阳朔', q: 'Yangshuo' },{ name: '武汉', q: 'Wuhan' }];
        let weatherHTML = '';
        for (const city of cities) {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.q}&appid=${apiKey}&units=metric&lang=zh_cn`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('天气数据加载失败');
                const data = await response.json();
                weatherHTML += `<div class="weather-card"><h4>${city.name}</h4><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="weather-icon"><div class="weather-temp">${Math.round(data.main.temp)}°C</div><div class="weather-desc">${data.weather[0].description}</div></div>`;
            } catch (error) {
                weatherHTML += `<div class="weather-card"><p>${city.name}天气加载失败</p></div>`;
            }
        }
        container.innerHTML = weatherHTML;
    }

    // --- 每日记账功能 ---
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
                row.innerHTML = `<td>${expense.date}</td><td>${expense.item}</td><td>${expense.category}</td><td>${parseFloat(expense.amount).toFixed(2)}</td><td><button class="delete-btn" data-id="${expense.id}">删除</button></td>`;
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
            let csvContent = "data:text/csv;charset=utf-8,\uFEFF日期,项目,类别,金额\n";
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
    
    // 页面加载后初始化所有功能
    initializeChecklists();
    fetchWeather();
});