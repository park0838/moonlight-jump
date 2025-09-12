// 간단하고 안정적인 QR 코드 생성기
// QR Server API를 사용한 실제 작동하는 버전

// Production-ready QR Generator with minimal logging

class QRGenerator {
    constructor() {
        this.debugMode = false; // Production mode
        this.init();
    }

    log(message, ...args) {
        // Production logging disabled
    }

    error(message, ...args) {
        console.error(`[QRGen ERROR] ${message}`, ...args);
    }
    
    // 🛡️ SECURITY: Input validation and sanitization
    validateAndSanitizeInput(input, type) {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }
        
        const trimmed = input.trim();
        
        // Length validation
        const maxLengths = {
            url: 2048,    // RFC 2616 reasonable URL length
            ssid: 32,     // IEEE 802.11 standard max SSID length
            password: 63  // WPA/WPA2 max password length
        };
        
        if (trimmed.length > maxLengths[type]) {
            throw new Error(`Input too long. Maximum ${maxLengths[type]} characters allowed.`);
        }
        
        if (trimmed.length === 0 && type !== 'password') {
            throw new Error('Input cannot be empty');
        }
        
        // Type-specific validation
        switch (type) {
            case 'url':
                return this.validateURL(trimmed);
            case 'ssid':
                return this.validateSSID(trimmed);
            case 'password':
                return this.validatePassword(trimmed);
            default:
                return trimmed;
        }
    }
    
    validateURL(url) {
        // Allow both URLs and plain text for QR codes
        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                new URL(url); // Validate URL format
                return url;
            } catch {
                throw new Error('Invalid URL format');
            }
        }
        
        // For plain text, just sanitize dangerous characters
        const sanitized = url.replace(/[<>"'&]/g, (match) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return entities[match];
        });
        
        return sanitized;
    }
    
    validateSSID(ssid) {
        // SSID cannot contain null characters
        if (ssid.includes('\0')) {
            throw new Error('SSID cannot contain null characters');
        }
        
        // Sanitize special characters that could cause issues
        const sanitized = ssid.replace(/[<>"'&\\]/g, (match) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;',
                '\\': '&#x5C;'
            };
            return entities[match];
        });
        
        return sanitized;
    }
    
    validatePassword(password) {
        // Allow empty password for open networks
        if (password === '') {
            return password;
        }
        
        // WPA/WPA2 password requirements
        if (password.length < 8) {
            throw new Error('WiFi password must be at least 8 characters long');
        }
        
        // Sanitize special characters
        const sanitized = password.replace(/[<>"'&\\]/g, (match) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;',
                '\\': '&#x5C;'
            };
            return entities[match];
        });
        
        return sanitized;
    }

    init() {
        this.setupTabSwitching();
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.showNotification('QR 코드 생성기가 준비되었습니다', 'success');
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-tab`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                } else {
                    this.error(`Target panel not found: ${targetTab}-tab`);
                }
            });
        });
    }

    setupEventListeners() {
        // URL Generate button
        const urlBtn = document.getElementById('url-generate-btn');
        if (urlBtn) {
            urlBtn.addEventListener('click', () => {
                this.generateUrlQR();
            });
        } else {
            this.error('URL generate button not found');
        }

        // WiFi Generate button
        const wifiBtn = document.getElementById('wifi-generate-btn');
        if (wifiBtn) {
            wifiBtn.addEventListener('click', () => {
                this.generateWifiQR();
            });
        } else {
            this.error('WiFi generate button not found');
        }

        // Download buttons
        const urlDownloadBtn = document.getElementById('url-download-btn');
        const wifiDownloadBtn = document.getElementById('wifi-download-btn');
        
        if (urlDownloadBtn) {
            urlDownloadBtn.addEventListener('click', () => this.downloadQR('url'));
        }
        if (wifiDownloadBtn) {
            wifiDownloadBtn.addEventListener('click', () => this.downloadQR('wifi'));
        }

        // Enter key support for URL input
        const urlInput = document.getElementById('url-input');
        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.generateUrlQR();
                }
            });
        }
    }

    setupPasswordToggle() {
        
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('wifi-password');
        
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                
                // 🛡️ SECURITY FIX: Replace innerHTML with secure DOM manipulation
                // Clear existing content
                passwordToggle.textContent = '';
                
                // Create icon element safely
                const icon = document.createElement('i');
                icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                passwordToggle.appendChild(icon);
                
            });
        }
    }

    async generateUrlQR() {
        const input = document.getElementById('url-input');
        const generateBtn = document.getElementById('url-generate-btn');
        const validation = document.getElementById('url-validation');
        
        if (!input) {
            this.error('URL input element not found');
            return;
        }
        
        // 🛡️ SECURITY: Validate and sanitize input
        const rawInput = input.value;
        
        // Clear previous validation
        if (validation) {
            validation.className = 'input-validation';
            validation.textContent = '';
        }

        let text;
        try {
            text = this.validateAndSanitizeInput(rawInput, 'url');
        } catch (error) {
            this.showValidationError('url-validation', error.message);
            input.focus();
            return;
        }

        // Validate URL if it looks like a URL
        if (this.looksLikeUrl(text) && !this.isValidUrl(text)) {
            this.showValidationError('url-validation', '올바른 URL을 입력해 주세요');
            return;
        }

        // Show loading state
        this.setButtonLoading(generateBtn, true);

        try {
            await this.generateQRCode('url', text);
            this.showValidationSuccess('url-validation', 'QR 코드가 성공적으로 생성되었습니다');
            this.showNotification('QR 코드가 생성되었습니다', 'success');
        } catch (error) {
            this.error('URL QR generation failed:', error);
            this.showValidationError('url-validation', 'QR 코드 생성 중 오류가 발생했습니다');
            this.showNotification('QR 코드 생성 실패', 'error');
        } finally {
            this.setButtonLoading(generateBtn, false);
        }
    }

    async generateWifiQR() {
        const ssidInput = document.getElementById('wifi-ssid');
        const passwordInput = document.getElementById('wifi-password');
        const generateBtn = document.getElementById('wifi-generate-btn');

        if (!ssidInput) {
            this.error('WiFi SSID input not found');
            return;
        }

        // 🛡️ SECURITY: Validate and sanitize WiFi inputs
        const rawSSID = ssidInput.value;
        const rawPassword = passwordInput?.value || '';
        
        let ssid, password;
        try {
            ssid = this.validateAndSanitizeInput(rawSSID, 'ssid');
            password = this.validateAndSanitizeInput(rawPassword, 'password');
        } catch (error) {
            this.showNotification(error.message, 'error');
            if (error.message.includes('SSID')) {
                ssidInput.focus();
            } else {
                passwordInput?.focus();
            }
            return;
        }
        
        const security = 'WPA'; // 기본값: WPA/WPA2 (가장 일반적)
        const hidden = false; // 기본값: 숨겨지지 않은 네트워크

        // Show loading state
        this.setButtonLoading(generateBtn, true, 'WiFi QR 코드 생성');

        try {
            // Create WiFi QR string
            const wifiString = `WIFI:T:${security};S:${this.escapeWifiString(ssid)};P:${this.escapeWifiString(password)};H:${hidden ? 'true' : 'false'};;`;
            
            await this.generateQRCode('wifi', wifiString);
            this.showNotification('WiFi QR 코드가 성공적으로 생성되었습니다', 'success');
        } catch (error) {
            this.error('WiFi QR generation failed:', error);
            this.showNotification('WiFi QR 코드 생성 중 오류가 발생했습니다', 'error');
        } finally {
            this.setButtonLoading(generateBtn, false, 'WiFi QR 코드 생성');
        }
    }

    generateQRCode(type, text) {
        return new Promise((resolve, reject) => {
            const canvas = document.getElementById(`${type}-qr-canvas`);
            const placeholder = document.getElementById(`${type}-qr-placeholder`);
            const downloadBtn = document.getElementById(`${type}-download-btn`);
            const container = document.getElementById(`${type}-qr-container`);

            if (!canvas) {
                this.error(`Canvas element not found: ${type}-qr-canvas`);
                reject(new Error('Canvas element not found'));
                return;
            }

            // Use QR Server API
            const size = 260;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            const timeout = setTimeout(() => {
                reject(new Error('QR generation timeout'));
            }, 10000);
            
            img.onload = () => {
                clearTimeout(timeout);
                
                try {
                    const ctx = canvas.getContext('2d');
                    canvas.width = size;
                    canvas.height = size;
                    ctx.clearRect(0, 0, size, size);
                    ctx.drawImage(img, 0, 0, size, size);
                    
                    this.showQRCode(type, canvas, placeholder, downloadBtn, container);
                    resolve();
                } catch (error) {
                    this.error('Error drawing QR to canvas:', error);
                    reject(error);
                }
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                // Fallback: Use img element directly instead of canvas
                this.showQRCodeAsImage(type, qrUrl, placeholder, downloadBtn, container);
                resolve();
            };
            
            img.src = qrUrl;
        });
    }

    showQRCode(type, canvas, placeholder, downloadBtn, container) {
        if (placeholder) placeholder.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (container) container.classList.add('has-qr');
        
        // QR 생성 후 광고 표시
        this.showResultAd(type);
    }

    showQRCodeAsImage(type, qrUrl, placeholder, downloadBtn, container) {
        // Create img element as fallback
        const img = document.createElement('img');
        img.src = qrUrl;
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            width: 260px;
            height: 260px;
        `;
        img.alt = 'QR Code';
        
        // Replace placeholder with image
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Add image to container
        if (container) {
            container.appendChild(img);
            container.classList.add('has-qr');
        }
        
        // Show download button (but it won't work without canvas)
        if (downloadBtn) {
            downloadBtn.style.display = 'flex';
            // Modify download function for image fallback
            downloadBtn.onclick = () => {
                this.showNotification('이미지를 우클릭하여 저장해주세요', 'info');
            };
        }
        
        // QR 생성 후 광고 표시
        this.showResultAd(type);
    }

    showResultAd(type) {
        const adContainer = document.getElementById(`${type}-ad-result`);
        if (adContainer) {
            // 약간의 지연 후 광고 표시 (사용자 경험 고려)
            setTimeout(() => {
                adContainer.style.display = 'block';
                adContainer.style.animation = 'fadeIn 0.5s ease-out';
            }, 1000);
        }
    }

    downloadQR(type) {
        const canvas = document.getElementById(`${type}-qr-canvas`);
        const downloadBtn = document.getElementById(`${type}-download-btn`);
        
        if (!canvas || canvas.style.display === 'none') {
            this.showNotification('다운로드할 QR 코드가 없습니다', 'error');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `${type === 'url' ? 'url' : 'wifi'}-qr-code.png`;
            link.href = canvas.toDataURL('image/png');
            
            // 🛡️ SECURITY FIX: Replace innerHTML with secure DOM manipulation
            if (downloadBtn) {
                // Store original content structure
                const originalIcon = downloadBtn.querySelector('i') ? downloadBtn.querySelector('i').className : 'fas fa-download';
                const originalText = downloadBtn.textContent.replace(/\s*다운로드 완료!\s*/, '').trim() || '다운로드';
                
                // Clear and set success state securely
                downloadBtn.textContent = '';
                
                const successIcon = document.createElement('i');
                successIcon.className = 'fas fa-check';
                downloadBtn.appendChild(successIcon);
                downloadBtn.appendChild(document.createTextNode(' 다운로드 완료!'));
                
                downloadBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
                
                setTimeout(() => {
                    // Restore original state securely
                    downloadBtn.textContent = '';
                    
                    const originalIconElement = document.createElement('i');
                    originalIconElement.className = originalIcon;
                    downloadBtn.appendChild(originalIconElement);
                    downloadBtn.appendChild(document.createTextNode(` ${originalText}`));
                    
                    downloadBtn.style.background = '';
                }, 2000);
            }
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('QR 코드가 다운로드되었습니다', 'success');
        } catch (error) {
            this.error('Download failed:', error);
            this.showNotification('다운로드 실패', 'error');
        }
    }

    // Utility functions
    looksLikeUrl(text) {
        return /^https?:\/\/|^www\.|^\w+\.\w+/.test(text.toLowerCase());
    }

    isValidUrl(text) {
        try {
            let url = text;
            if (!text.startsWith('http://') && !text.startsWith('https://')) {
                url = 'https://' + text;
            }
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    escapeWifiString(str) {
        return str.replace(/([\\";,:])/g, '\\$1');
    }

    setButtonLoading(button, loading, originalText = 'QR 코드 생성') {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            
            // 🛡️ SECURITY FIX: Replace innerHTML with secure DOM manipulation
            button.textContent = '';
            
            const spinnerIcon = document.createElement('i');
            spinnerIcon.className = 'fas fa-spinner fa-spin';
            button.appendChild(spinnerIcon);
            button.appendChild(document.createTextNode(' 생성 중...'));
            
        } else {
            button.disabled = false;
            const iconClass = button.id.includes('wifi') ? 'fas fa-wifi' : 'fas fa-qrcode';
            
            // Clear and rebuild content securely
            button.textContent = '';
            
            const icon = document.createElement('i');
            icon.className = iconClass;
            button.appendChild(icon);
            button.appendChild(document.createTextNode(` ${originalText}`));
        }
    }

    showValidationError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = 'input-validation error';
            element.textContent = message;
        }
    }

    showValidationSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = 'input-validation success';
            element.textContent = message;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const colors = {
            success: '#11998e',
            error: '#e74c3c',
            warn: '#f39c12',
            info: '#3498db'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            font-family: var(--font-primary, Arial, sans-serif);
            font-size: 0.9rem;
            font-weight: 500;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;

        // 🛡️ SECURITY FIX: Replace innerHTML with secure DOM manipulation
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
        
        // Safely set notification content
        notification.textContent = `${icon} ${message}`;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize application
function initApp() {
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
        return;
    }
    
    try {
        window.qrGenerator = new QRGenerator();
        
        // Add loaded class for animations
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
        
    } catch (error) {
        console.error('Failed to initialize QR Generator:', error);
        
        // Show error notification
        alert('QR 코드 생성기 초기화에 실패했습니다. 페이지를 새로고침해 주세요.');
    }
}

// Start the application
initApp();

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});