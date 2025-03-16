document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const adminSettings = document.getElementById('adminSettings');
    const adminPassword = document.getElementById('adminPassword');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const passwordHistoryTable = document.getElementById('passwordHistoryTable');
    const exportButton = document.getElementById('exportButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const showAdminSettings = document.getElementById('showAdminSettings');
    const newAdminPassword = document.getElementById('newAdminPassword');
    const confirmAdminPassword = document.getElementById('confirmAdminPassword');
    const changePasswordButton = document.getElementById('changePasswordButton');

    // 默认管理员密码（如果未设置）
    const DEFAULT_ADMIN_PASSWORD = 'admin123';
    
    // 检查是否已经登录
    let isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    // 初始化管理员密码（如果未设置）
    if (!localStorage.getItem('adminPassword')) {
        localStorage.setItem('adminPassword', DEFAULT_ADMIN_PASSWORD);
    }
    
    // 如果已登录，显示管理面板
    if (isLoggedIn) {
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        loadPasswordHistory();
    }
    
    // 登录按钮点击事件
    loginButton.addEventListener('click', function() {
        const password = adminPassword.value;
        const storedPassword = localStorage.getItem('adminPassword');
        
        if (password === storedPassword) {
            // 登录成功
            sessionStorage.setItem('adminLoggedIn', 'true');
            loginForm.style.display = 'none';
            adminPanel.style.display = 'block';
            adminPassword.value = '';
            loadPasswordHistory();
        } else {
            // 登录失败
            alert('密码错误，请重试');
        }
    });
    
    // 回车键登录
    adminPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
    
    // 退出登录按钮点击事件
    logoutButton.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        loginForm.style.display = 'block';
        adminPanel.style.display = 'none';
        adminSettings.style.display = 'none';
    });
    
    // 显示管理员设置
    showAdminSettings.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (isLoggedIn) {
            adminSettings.style.display = adminSettings.style.display === 'none' ? 'block' : 'none';
        } else {
            alert('请先登录管理员账户');
        }
    });
    
    // 更改管理员密码
    changePasswordButton.addEventListener('click', function() {
        const newPassword = newAdminPassword.value;
        const confirmPassword = confirmAdminPassword.value;
        
        if (!newPassword) {
            alert('请输入新密码');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        // 更新密码
        localStorage.setItem('adminPassword', newPassword);
        alert('管理员密码已更新');
        
        // 清空输入框
        newAdminPassword.value = '';
        confirmAdminPassword.value = '';
        
        // 隐藏设置面板
        adminSettings.style.display = 'none';
    });
    
    // 导出密码历史数据
    exportButton.addEventListener('click', function() {
        const passwordHistory = getPasswordHistoryFromStorage();
        
        if (passwordHistory.length === 0) {
            alert('没有可导出的密码历史记录');
            return;
        }
        
        // 创建CSV内容
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += '密码,使用场景,生成时间,密码强度\n';
        
        passwordHistory.forEach(function(item) {
            csvContent += `${item.password},${item.usage || '未指定'},${item.timestamp},${item.strength}\n`;
        });
        
        // 创建下载链接
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `密码历史记录_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        
        // 触发下载
        link.click();
        
        // 移除链接
        document.body.removeChild(link);
    });
    
    // 清空所有密码历史记录
    clearAllButton.addEventListener('click', function() {
        if (confirm('确定要清空所有密码历史记录吗？此操作不可恢复。')) {
            localStorage.removeItem('passwordHistory');
            loadPasswordHistory();
            alert('所有密码历史记录已清空');
        }
    });
    
    // 从localStorage获取密码历史记录
    function getPasswordHistoryFromStorage() {
        const historyJson = localStorage.getItem('passwordHistory');
        return historyJson ? JSON.parse(historyJson) : [];
    }
    
    // 加载密码历史记录到表格
    function loadPasswordHistory() {
        const passwordHistory = getPasswordHistoryFromStorage();
        
        // 清空表格
        passwordHistoryTable.innerHTML = '';
        
        // 如果没有历史记录，显示提示
        if (passwordHistory.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 4;
            emptyCell.className = 'text-center text-muted';
            emptyCell.textContent = '暂无密码历史记录';
            emptyRow.appendChild(emptyCell);
            passwordHistoryTable.appendChild(emptyRow);
            return;
        }
        
        // 添加每条历史记录
        passwordHistory.forEach(function(item, index) {
            const row = document.createElement('tr');
            
            // 密码单元格
            const passwordCell = document.createElement('td');
            passwordCell.className = 'password-text';
            passwordCell.textContent = item.password;
            
            // 使用场景单元格
            const usageCell = document.createElement('td');
            usageCell.textContent = item.usage || '未指定';
            
            // 时间单元格
            const timeCell = document.createElement('td');
            timeCell.textContent = new Date(item.timestamp).toLocaleString();
            
            // 强度单元格
            const strengthCell = document.createElement('td');
            let strengthClass = '';
            let strengthText = '';
            
            if (item.strengthScore < 25) {
                strengthClass = 'text-danger';
                strengthText = '非常弱';
            } else if (item.strengthScore < 50) {
                strengthClass = 'text-danger';
                strengthText = '弱';
            } else if (item.strengthScore < 75) {
                strengthClass = 'text-primary';
                strengthText = '中等';
            } else if (item.strengthScore < 90) {
                strengthClass = 'text-success';
                strengthText = '强';
            } else {
                strengthClass = 'text-info';
                strengthText = '非常强';
            }
            
            strengthCell.className = strengthClass;
            strengthCell.textContent = strengthText;
            
            // 操作单元格
            const actionsCell = document.createElement('td');
            
            // 复制按钮
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm btn-outline-primary me-2';
            copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
            copyBtn.title = '复制密码';
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(item.password)
                    .then(() => {
                        // 显示复制成功提示
                        const originalText = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('无法复制密码: ', err);
                        alert('复制失败，请手动复制密码');
                    });
            });
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.title = '删除此记录';
            deleteBtn.addEventListener('click', function() {
                if (confirm('确定要删除此密码记录吗？')) {
                    // 从数组中删除
                    passwordHistory.splice(index, 1);
                    
                    // 更新localStorage
                    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
                    
                    // 重新加载表格
                    loadPasswordHistory();
                }
            });
            
            actionsCell.appendChild(copyBtn);
            actionsCell.appendChild(deleteBtn);
            
            // 添加所有单元格到行
            row.appendChild(passwordCell);
            row.appendChild(usageCell);
            row.appendChild(timeCell);
            row.appendChild(strengthCell);
            row.appendChild(actionsCell);
            
            // 添加行到表格
            passwordHistoryTable.appendChild(row);
        });
    }
}); 