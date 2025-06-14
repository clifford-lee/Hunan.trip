document.addEventListener('DOMContentLoaded', function() {
    console.log("旅行指南(功能增强版)已加载！");

    // ===================================================================
    // 功能一：互动式清单
    // ===================================================================
    function initializeChecklists() {
        const checklists = document.querySelectorAll('.interactive-checklist');
        if (checklists.length === 0) return;

        // 从localStorage加载已保存的状态
        let savedStatus = JSON.parse(localStorage.getItem('checklistStatus_v1')) || {};

        checklists.forEach(list => {
            const checkboxes = list.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                // 初始化时设置勾选状态
                if (savedStatus[checkbox.id]) {
                    checkbox.checked = true;
                }
                // 添加事件监听
                checkbox.addEventListener('change', function() {
                    savedStatus[this.id] = this.checked;
                    localStorage.setItem('checklistStatus_v1', JSON.stringify(savedStatus));
                });
            });
        });
    }
    
    // ===================================================================
    // 功能二：实时天气组件
    // ===================================================================
    async function fetchWeather() {
        const container = document.getElementById('weather-widget-container');
        if (!container) return;
        
        // --- 请在这里替换成您自己的API密钥 ---
        // 您需要去 OpenWeatherMap 官网注册一个免费账户来获取。
        // 官网地址: https://openweathermap.org/
        const apiKey = '0befc4de14e844dd09545fd0e78cd485'; // 这是一个示例，需要您自己替换

        if (apiKey === '0befc4de14e844dd09545fd0e78cd485') {
            container.innerHTML = '<p>天气功能需要配置API密钥后才能使用。</p>';
            return;
        }

        const cities = [
            { name: '宜昌', q: 'Yichang' },
            { name: '恩施', q: 'Enshi' },
            { name: '重庆', q: 'Chongqing' },
            { name: '阳朔', q: 'Yangshuo' },
            { name: '武汉', q: 'Wuhan' }
        ];

        let weatherHTML = '';
        for (const city of cities) {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.q}&appid=${apiKey}&units=metric&lang=zh_cn`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`天气数据加载失败: ${response.statusText}`);
                const data = await response.json();
                
                weatherHTML += `
                    <div class="weather-card">
                        <h4>${city.name}</h4>
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="weather-icon">
                        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
                        <div class="weather-desc">${data.weather[0].description}</div>
                    </div>
                `;
            } catch (error) {
                console.error(`获取${city.name}天气失败:`, error);
                weatherHTML += `<div class="weather-card"><p>${city.name}天气加载失败</p></div>`;
            }
        }
        container.innerHTML = weatherHTML;
    }

    // ===================================================================
    // 旧功能：记账、导出、平滑滚动等 (代码无变化)
    // ===================================================================
    // ... (此处省略您已有的记账、导出、邮件发送、平滑滚动等JS代码)
    // 请确保您旧的script.js中的这部分代码被完整保留在这里

    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        // ... (所有记账相关的代码)
    }

    // ===================================================================
    // 页面加载后，初始化所有功能
    // ===================================================================
    initializeChecklists();
    fetchWeather();
    // 这里也应该包含您旧的记账功能初始化代码，如 renderExpenses();
});