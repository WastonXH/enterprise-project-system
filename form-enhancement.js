// 表单增强功能
document.addEventListener('DOMContentLoaded', function() {
    
    // 获取所有表单
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        // 阻止默认提交
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 验证表单
            if (validateForm(form)) {
                // 显示成功提示
                showSuccessMessage(form);
                
                // 重置表单
                setTimeout(() => {
                    form.reset();
                    removeSuccessMessage(form);
                }, 3000);
            } else {
                // 显示错误提示
                showErrorMessage(form);
            }
        });
        
        // 添加实时验证
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateInput(input);
            });
            
            input.addEventListener('input', function() {
                // 移除错误状态
                input.classList.remove('error');
                const errorMsg = input.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        });
    });
    
    // 验证单个表单
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(function(input) {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // 验证单个输入框
    function validateInput(input) {
        const value = input.value.trim();
        
        // 移除旧的错误信息
        input.classList.remove('error');
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // 必填验证
        if (input.hasAttribute('required') && value === '') {
            showError(input, '此项为必填项');
            return false;
        }
        
        // 邮箱验证
        if (input.type === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError(input, '请输入有效的邮箱地址');
                return false;
            }
        }
        
        // 电话验证
        if (input.type === 'tel' && value !== '') {
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(value)) {
                showError(input, '请输入有效的手机号码');
                return false;
            }
        }
        
        // 数字验证
        if (input.type === 'number') {
            if (isNaN(value) || value === '') {
                showError(input, '请输入有效的数字');
                return false;
            }
            
            // 最小值验证
            if (input.hasAttribute('min') && parseFloat(value) < parseFloat(input.min)) {
                showError(input, `最小值为 ${input.min}`);
                return false;
            }
            
            // 最大值验证
            if (input.hasAttribute('max') && parseFloat(value) > parseFloat(input.max)) {
                showError(input, `最大值为 ${input.max}`);
                return false;
            }
        }
        
        // 长度验证
        if (input.hasAttribute('minlength') && value.length < parseInt(input.minlength)) {
            showError(input, `最少需要 ${input.minlength} 个字符`);
            return false;
        }
        
        if (input.hasAttribute('maxlength') && value.length > parseInt(input.maxlength)) {
            showError(input, `最多允许 ${input.maxlength} 个字符`);
            return false;
        }
        
        return true;
    }
    
    // 显示错误信息
    function showError(input, message) {
        input.classList.add('error');
        
        // 添加抖动动画
        input.classList.add('error-shake');
        setTimeout(() => {
            input.classList.remove('error-shake');
        }, 500);
        
        // 创建错误消息元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
            animation: fadeIn 0.3s ease-out;
        `;
        
        input.parentElement.appendChild(errorDiv);
    }
    
    // 显示成功提示
    function showSuccessMessage(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 30px 50px;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
                z-index: 10000;
                text-align: center;
                animation: successPopup 0.5s ease-out;
            ">
                <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
                <div style="font-size: 18px; font-weight: bold;">提交成功！</div>
                <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">3秒后自动关闭</div>
            </div>
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
            "></div>
        `;
        
        document.body.appendChild(successDiv);
    }
    
    // 移除成功提示
    function removeSuccessMessage(form) {
        const successMessages = document.querySelectorAll('.success-message');
        successMessages.forEach(function(msg) {
            msg.remove();
        });
    }
    
    // 显示表单整体错误
    function showErrorMessage(form) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                padding: 15px 30px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
                z-index: 10000;
                text-align: center;
                animation: fadeInUp 0.5s ease-out;
            ">
                <div style="font-size: 16px; font-weight: bold;">⚠️ 请填写所有必填项</div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 3秒后自动消失
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    // 添加输入框聚焦动画
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(function(input) {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // 添加按钮点击效果
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            // 创建涟漪效果
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// 添加涟漪动画
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
`;
document.head.appendChild(style);
