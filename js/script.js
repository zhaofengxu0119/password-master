document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const passwordOutput = document.getElementById('passwordOutput');
    const copyButton = document.getElementById('copyButton');
    const generateButton = document.getElementById('generateButton');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const uppercaseCheck = document.getElementById('uppercaseCheck');
    const lowercaseCheck = document.getElementById('lowercaseCheck');
    const numbersCheck = document.getElementById('numbersCheck');
    const symbolsCheck = document.getElementById('symbolsCheck');
    const easyToReadCheck = document.getElementById('easyToReadCheck');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const crackTimeText = document.getElementById('crackTimeText');
    const passwordHistory = document.getElementById('passwordHistory');
    const usageSelect = document.getElementById('usageSelect');
    const customUsage = document.getElementById('customUsage');

    // 字符集
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    // 易读模式排除的字符
    const confusingChars = /[0O1lI]/g;

    // 历史密码数组
    let passwordHistoryArray = [];
    const maxHistoryItems = 5;

    // 更新密码长度显示
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // 生成密码
    generateButton.addEventListener('click', generatePassword);

    // 复制密码到剪贴板
    copyButton.addEventListener('click', function() {
        if (passwordOutput.value) {
            navigator.clipboard.writeText(passwordOutput.value)
                .then(() => {
                    // 显示复制成功提示
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '<i class="bi bi-check-lg"></i>';
                    copyButton.classList.add('copy-success');
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.classList.remove('copy-success');
                    }, 2000);
                })
                .catch(err => {
                    console.error('无法复制密码: ', err);
                    alert('复制失败，请手动复制密码');
                });
        }
    });
    
    // 使用场景选择变化事件
    usageSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customUsage.style.display = 'block';
            customUsage.focus();
        } else {
            customUsage.style.display = 'none';
        }
    });

    // 生成密码函数
    function generatePassword() {
        // 检查至少选择了一种字符类型
        if (!uppercaseCheck.checked && !lowercaseCheck.checked && 
            !numbersCheck.checked && !symbolsCheck.checked) {
            alert('请至少选择一种字符类型');
            return;
        }

        const length = parseInt(lengthSlider.value);
        let charset = '';
        
        // 构建字符集
        if (uppercaseCheck.checked) charset += uppercaseChars;
        if (lowercaseCheck.checked) charset += lowercaseChars;
        if (numbersCheck.checked) charset += numberChars;
        if (symbolsCheck.checked) charset += symbolChars;
        
        // 易读模式
        if (easyToReadCheck.checked) {
            charset = charset.replace(confusingChars, '');
        }
        
        // 生成密码
        let password = '';
        let crypto = window.crypto || window.msCrypto;
        let randomValues = new Uint32Array(length);
        
        // 使用加密安全的随机数生成器
        crypto.getRandomValues(randomValues);
        
        // 确保密码包含所有选择的字符类型
        let charTypes = [];
        if (uppercaseCheck.checked) charTypes.push('uppercase');
        if (lowercaseCheck.checked) charTypes.push('lowercase');
        if (numbersCheck.checked) charTypes.push('numbers');
        if (symbolsCheck.checked) charTypes.push('symbols');
        
        // 生成初始密码
        for (let i = 0; i < length; i++) {
            const randomIndex = randomValues[i] % charset.length;
            password += charset.charAt(randomIndex);
        }
        
        // 确保密码包含所有选择的字符类型
        let validPassword = validatePasswordCharTypes(password, charTypes);
        
        // 如果密码不包含所有选择的字符类型，重新生成
        while (!validPassword) {
            password = '';
            crypto.getRandomValues(randomValues);
            
            for (let i = 0; i < length; i++) {
                const randomIndex = randomValues[i] % charset.length;
                password += charset.charAt(randomIndex);
            }
            
            validPassword = validatePasswordCharTypes(password, charTypes);
        }
        
        // 显示密码
        passwordOutput.value = password;
        
        // 评估密码强度
        const strengthScore = evaluatePasswordStrength(password);
        
        // 获取使用场景
        let usage = usageSelect.value;
        if (usage === 'custom') {
            usage = customUsage.value.trim() || '未指定';
        } else if (!usage) {
            usage = '未指定';
        }
        
        // 添加到历史记录
        addToHistory(password, strengthScore, usage);
    }

    // 验证密码是否包含所有选择的字符类型
    function validatePasswordCharTypes(password, charTypes) {
        let hasUppercase = false;
        let hasLowercase = false;
        let hasNumbers = false;
        let hasSymbols = false;
        
        for (let i = 0; i < password.length; i++) {
            const char = password.charAt(i);
            
            if (uppercaseChars.includes(char)) hasUppercase = true;
            else if (lowercaseChars.includes(char)) hasLowercase = true;
            else if (numberChars.includes(char)) hasNumbers = true;
            else if (symbolChars.includes(char)) hasSymbols = true;
        }
        
        let valid = true;
        
        if (charTypes.includes('uppercase') && !hasUppercase) valid = false;
        if (charTypes.includes('lowercase') && !hasLowercase) valid = false;
        if (charTypes.includes('numbers') && !hasNumbers) valid = false;
        if (charTypes.includes('symbols') && !hasSymbols) valid = false;
        
        return valid;
    }

    // 评估密码强度
    function evaluatePasswordStrength(password) {
        // 基础分数
        let score = 0;
        
        // 长度评分 (最多50分)
        score += Math.min(50, password.length * 2);
        
        // 字符多样性评分 (最多50分)
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);
        
        const charTypesCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
        score += charTypesCount * 12.5;
        
        // 设置强度条
        strengthBar.style.width = score + '%';
        strengthBar.setAttribute('aria-valuenow', score);
        
        // 移除所有强度类
        strengthBar.classList.remove('strength-weak', 'strength-medium', 'strength-strong', 'strength-very-strong');
        
        // 设置强度文本和类
        let strengthClass = '';
        let strengthDescription = '';
        let crackTime = '';
        
        if (score < 25) {
            strengthClass = 'strength-weak';
            strengthDescription = '非常弱';
            crackTime = '几秒内';
        } else if (score < 50) {
            strengthClass = 'strength-weak';
            strengthDescription = '弱';
            crackTime = '几分钟内';
        } else if (score < 75) {
            strengthClass = 'strength-medium';
            strengthDescription = '中等';
            crackTime = '几天内';
        } else if (score < 90) {
            strengthClass = 'strength-strong';
            strengthDescription = '强';
            crackTime = '几年内';
        } else {
            strengthClass = 'strength-very-strong';
            strengthDescription = '非常强';
            crackTime = '几百年以上';
        }
        
        strengthBar.classList.add(strengthClass);
        strengthText.textContent = strengthDescription;
        crackTimeText.textContent = `破解时间: ${crackTime}`;
        
        return score;
    }

    // 添加密码到历史记录
    function addToHistory(password, strengthScore, usage) {
        // 创建密码历史记录对象
        const passwordData = {
            password: password,
            timestamp: new Date().toISOString(),
            strengthScore: strengthScore,
            strength: getStrengthText(strengthScore),
            usage: usage
        };
        
        // 添加到数组开头
        passwordHistoryArray.unshift(password);
        
        // 限制历史记录数量
        if (passwordHistoryArray.length > maxHistoryItems) {
            passwordHistoryArray.pop();
        }
        
        // 更新历史记录显示
        updateHistoryDisplay();
        
        // 保存到localStorage
        savePasswordToStorage(passwordData);
    }
    
    // 获取强度文本
    function getStrengthText(score) {
        if (score < 25) return '非常弱';
        else if (score < 50) return '弱';
        else if (score < 75) return '中等';
        else if (score < 90) return '强';
        else return '非常强';
    }
    
    // 保存密码到localStorage
    function savePasswordToStorage(passwordData) {
        // 从localStorage获取现有历史记录
        let passwordHistory = getPasswordHistoryFromStorage();
        
        // 添加新密码到开头
        passwordHistory.unshift(passwordData);
        
        // 保存回localStorage
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    }
    
    // 从localStorage获取密码历史记录
    function getPasswordHistoryFromStorage() {
        const historyJson = localStorage.getItem('passwordHistory');
        return historyJson ? JSON.parse(historyJson) : [];
    }

    // 更新历史记录显示
    function updateHistoryDisplay() {
        // 清空当前历史记录
        passwordHistory.innerHTML = '';
        
        // 如果没有历史记录，显示提示
        if (passwordHistoryArray.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'list-group-item text-center text-muted';
            emptyItem.textContent = '暂无历史记录';
            passwordHistory.appendChild(emptyItem);
            return;
        }
        
        // 获取完整历史记录
        const fullHistory = getPasswordHistoryFromStorage();
        const recentHistory = fullHistory.slice(0, maxHistoryItems);
        
        // 添加每个历史密码
        recentHistory.forEach((item, index) => {
            const password = item.password;
            const usage = item.usage || '未指定';
            
            const item_element = document.createElement('li');
            item_element.className = 'list-group-item password-history-item';
            
            const passwordInfo = document.createElement('div');
            passwordInfo.className = 'password-info';
            
            const passwordText = document.createElement('span');
            passwordText.className = 'password-text';
            passwordText.textContent = password;
            
            const usageText = document.createElement('small');
            usageText.className = 'text-muted d-block';
            usageText.textContent = `使用场景: ${usage}`;
            
            passwordInfo.appendChild(passwordText);
            passwordInfo.appendChild(usageText);
            
            const actions = document.createElement('div');
            actions.className = 'password-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm btn-outline-primary';
            copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
            copyBtn.title = '复制密码';
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(password)
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
            
            const useBtn = document.createElement('button');
            useBtn.className = 'btn btn-sm btn-outline-success';
            useBtn.innerHTML = '<i class="bi bi-arrow-up-circle"></i>';
            useBtn.title = '使用此密码';
            useBtn.addEventListener('click', function() {
                passwordOutput.value = password;
                evaluatePasswordStrength(password);
            });
            
            actions.appendChild(copyBtn);
            actions.appendChild(useBtn);
            
            item_element.appendChild(passwordInfo);
            item_element.appendChild(actions);
            
            passwordHistory.appendChild(item_element);
        });
    }

    // 初始化
    updateHistoryDisplay();
}); 