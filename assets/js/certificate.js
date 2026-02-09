/**
 * Certificate Generation and Verification System
 * Author: Tharunaditya Anuganti
 * 
 * This system generates verifiable certificates for completing blog series.
 * Uses a hash-based credential system that encodes certificate data for verification.
 */

const CertificateSystem = (function() {
    'use strict';
    
    // Secret salt for hash generation (client-side, so not truly secret, but adds complexity)
    const SALT = 'THARUN_CERT_2024_v1';
    const VERSION = '1';
    
    /**
     * Generate a simple hash from string
     * Uses a combination of operations for a unique fingerprint
     */
    function generateHash(str) {
        let hash = 0;
        const combined = SALT + str + SALT;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Convert to positive hex string
        const positiveHash = (hash >>> 0).toString(16).toUpperCase();
        return positiveHash.padStart(8, '0');
    }
    
    /**
     * Encode data to base64-like credential ID
     */
    function encodeCredential(data) {
        const jsonStr = JSON.stringify(data);
        // Simple encoding: base64 with custom alphabet
        const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
        // Add version prefix and hash suffix
        const hash = generateHash(jsonStr);
        return `${VERSION}-${encoded}-${hash}`;
    }
    
    /**
     * Decode credential ID back to data
     */
    function decodeCredential(credentialId) {
        try {
            const parts = credentialId.split('-');
            if (parts.length < 3) return null;
            
            const version = parts[0];
            const hash = parts[parts.length - 1];
            const encoded = parts.slice(1, -1).join('-');
            
            // Decode the data
            const jsonStr = decodeURIComponent(escape(atob(encoded)));
            const data = JSON.parse(jsonStr);
            
            // Verify hash
            const expectedHash = generateHash(jsonStr);
            if (hash !== expectedHash) {
                return { valid: false, error: 'Invalid credential hash' };
            }
            
            return { valid: true, data: data };
        } catch (e) {
            return { valid: false, error: 'Invalid credential format' };
        }
    }
    
    /**
     * Format date for certificate
     */
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    }
    
    /**
     * Generate credential ID for a certificate
     */
    function generateCredentialId(name, series, date) {
        const data = {
            n: name.trim(),
            s: series,
            d: date,
            t: Date.now()
        };
        return encodeCredential(data);
    }
    
    /**
     * Generate certificate canvas - Modern Premium Design
     */
    async function generateCertificateCanvas(options) {
        const {
            name,
            series,
            date,
            credentialId,
            partsCompleted = 5,
            badgeUrl
        } = options;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Certificate dimensions (landscape)
        canvas.width = 1400;
        canvas.height = 900;
        
        const W = canvas.width;
        const H = canvas.height;
        
        // === BACKGROUND ===
        // Deep gradient background
        const bgGradient = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7);
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(0.5, '#0f0f1a');
        bgGradient.addColorStop(1, '#050510');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, W, H);
        
        // === GEOMETRIC PATTERNS ===
        drawModernGeometry(ctx, W, H);
        
        // === GLOWING ACCENT LINES ===
        drawGlowingAccents(ctx, W, H);
        
        // === BORDER FRAME ===
        drawModernBorder(ctx, W, H);
        
        // === HEADER SECTION ===
        // Top badge/logo area
        ctx.save();
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 30;
        
        // Hexagon badge at top
        drawHexagon(ctx, W/2, 80, 45, '#00ff41', 0.3);
        drawHexagon(ctx, W/2, 80, 35, '#00ff41', 0.6);
        
        // Shield icon in center
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⬡', W/2, 90);
        ctx.restore();
        
        // Site name
        ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
        ctx.font = '600 14px "Segoe UI", Arial, sans-serif';
        ctx.letterSpacing = '4px';
        ctx.textAlign = 'center';
        ctx.fillText('T H A R U N A D I T Y A . D E V', W/2, 145);
        
        // === CERTIFICATE TITLE ===
        // Gradient text effect simulation
        const titleGradient = ctx.createLinearGradient(W/2 - 300, 0, W/2 + 300, 0);
        titleGradient.addColorStop(0, '#ffffff');
        titleGradient.addColorStop(0.5, '#00ff41');
        titleGradient.addColorStop(1, '#ffffff');
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '300 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText('CERTIFICATE OF', W/2, 200);
        
        ctx.fillStyle = titleGradient;
        ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
        ctx.fillText('COMPLETION', W/2, 255);
        
        // Decorative line with diamond
        drawDecorativeLine(ctx, W/2 - 250, 280, 500);
        
        // === RECIPIENT SECTION ===
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '300 18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('This is to certify that', W/2, 340);
        
        // Name with glow effect
        ctx.save();
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
        ctx.fillText(name, W/2, 400);
        ctx.restore();
        
        // Name underline with gradient
        const nameWidth = ctx.measureText(name).width;
        const underlineGradient = ctx.createLinearGradient(W/2 - nameWidth/2, 0, W/2 + nameWidth/2, 0);
        underlineGradient.addColorStop(0, 'rgba(0, 255, 65, 0)');
        underlineGradient.addColorStop(0.5, 'rgba(0, 255, 65, 1)');
        underlineGradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
        
        ctx.strokeStyle = underlineGradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W/2 - nameWidth/2 - 40, 420);
        ctx.lineTo(W/2 + nameWidth/2 + 40, 420);
        ctx.stroke();
        
        // === SERIES INFO ===
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '300 18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('has successfully completed the', W/2, 470);
        
        // Series name with accent
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.fillText(series, W/2, 520);
        
        // Series subtitle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '300 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`A comprehensive ${partsCompleted}-part learning journey`, W/2, 555);
        
        // === BADGE & DATE SECTION ===
        // Left side: Date info in a box
        drawInfoBox(ctx, 200, 610, 200, 80, 'COMPLETED', formatDate(date));
        
        // Center: Badge
        if (badgeUrl) {
            try {
                const badge = await loadImage(badgeUrl);
                const badgeSize = 130;
                
                // Badge glow
                ctx.save();
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = 40;
                
                // Circular clip for badge
                ctx.beginPath();
                ctx.arc(W/2, 670, badgeSize/2 + 5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.drawImage(badge, W/2 - badgeSize/2, 605, badgeSize, badgeSize);
                ctx.restore();
            } catch (e) {
                // Draw placeholder if badge fails
                drawHexagon(ctx, W/2, 670, 50, '#00ff41', 0.3);
            }
        }
        
        // Right side: Parts info
        drawInfoBox(ctx, W - 400, 610, 200, 80, 'MODULES', `${partsCompleted} Parts`);
        
        // === SIGNATURE SECTION ===
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '300 12px "Segoe UI", Arial, sans-serif';
        ctx.fillText('ISSUED BY', W/2, 760);
        
        // Signature line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W/2 - 100, 800);
        ctx.lineTo(W/2 + 100, 800);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 22px "Georgia", serif';
        ctx.fillText('Tharunaditya Anuganti', W/2, 795);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '300 13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Security Researcher & Content Creator', W/2, 820);
        
        // === FOOTER: CREDENTIAL & VERIFICATION ===
        // Left: Credential
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.7)';
        ctx.font = '600 10px "Courier New", monospace';
        ctx.fillText('CREDENTIAL ID', 50, H - 45);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px "Courier New", monospace';
        const shortCredential = credentialId.length > 60 ? credentialId.substring(0, 60) + '...' : credentialId;
        ctx.fillText(shortCredential, 50, H - 28);
        
        // Right: Verification
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.7)';
        ctx.font = '600 10px "Courier New", monospace';
        ctx.fillText('VERIFY CERTIFICATE', W - 50, H - 45);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText('tharunaditya.dev/verify', W - 50, H - 28);
        
        // Decorative QR-like pattern
        drawModernQR(ctx, W - 120, H - 100, 50);
        
        return canvas;
    }
    
    /**
     * Draw modern geometric background patterns
     */
    function drawModernGeometry(ctx, W, H) {
        ctx.save();
        
        // Floating geometric shapes
        const shapes = [
            { x: 100, y: 150, size: 80, rotation: 15 },
            { x: W - 120, y: 200, size: 60, rotation: -20 },
            { x: 80, y: H - 200, size: 70, rotation: 45 },
            { x: W - 100, y: H - 180, size: 55, rotation: -10 },
            { x: W/2 - 400, y: 500, size: 40, rotation: 30 },
            { x: W/2 + 400, y: 450, size: 45, rotation: -25 }
        ];
        
        shapes.forEach(shape => {
            ctx.save();
            ctx.translate(shape.x, shape.y);
            ctx.rotate(shape.rotation * Math.PI / 180);
            
            // Outer hexagon
            ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)';
            ctx.lineWidth = 1;
            drawHexagonPath(ctx, 0, 0, shape.size);
            ctx.stroke();
            
            // Inner hexagon
            ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
            drawHexagonPath(ctx, 0, 0, shape.size * 0.6);
            ctx.stroke();
            
            ctx.restore();
        });
        
        // Grid dots pattern
        ctx.fillStyle = 'rgba(0, 255, 65, 0.03)';
        for (let x = 50; x < W; x += 40) {
            for (let y = 50; y < H; y += 40) {
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Draw glowing accent lines
     */
    function drawGlowingAccents(ctx, W, H) {
        ctx.save();
        
        // Top left corner accent
        const gradient1 = ctx.createLinearGradient(0, 0, 200, 200);
        gradient1.addColorStop(0, 'rgba(0, 255, 65, 0.3)');
        gradient1.addColorStop(1, 'rgba(0, 255, 65, 0)');
        
        ctx.strokeStyle = gradient1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 100);
        ctx.lineTo(50, 50);
        ctx.lineTo(100, 50);
        ctx.stroke();
        
        // Top right corner accent
        const gradient2 = ctx.createLinearGradient(W, 0, W - 200, 200);
        gradient2.addColorStop(0, 'rgba(0, 255, 65, 0.3)');
        gradient2.addColorStop(1, 'rgba(0, 255, 65, 0)');
        
        ctx.strokeStyle = gradient2;
        ctx.beginPath();
        ctx.moveTo(W, 100);
        ctx.lineTo(W - 50, 50);
        ctx.lineTo(W - 100, 50);
        ctx.stroke();
        
        // Bottom accents
        const gradient3 = ctx.createLinearGradient(0, H, 200, H - 200);
        gradient3.addColorStop(0, 'rgba(0, 255, 65, 0.2)');
        gradient3.addColorStop(1, 'rgba(0, 255, 65, 0)');
        
        ctx.strokeStyle = gradient3;
        ctx.beginPath();
        ctx.moveTo(0, H - 100);
        ctx.lineTo(50, H - 50);
        ctx.lineTo(150, H - 50);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Draw modern border frame
     */
    function drawModernBorder(ctx, W, H) {
        const padding = 25;
        const cornerSize = 40;
        
        ctx.save();
        
        // Outer subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, padding, W - padding * 2, H - padding * 2);
        
        // Corner accents with glow
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(padding, padding + cornerSize);
        ctx.lineTo(padding, padding);
        ctx.lineTo(padding + cornerSize, padding);
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(W - padding - cornerSize, padding);
        ctx.lineTo(W - padding, padding);
        ctx.lineTo(W - padding, padding + cornerSize);
        ctx.stroke();
        
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(padding, H - padding - cornerSize);
        ctx.lineTo(padding, H - padding);
        ctx.lineTo(padding + cornerSize, H - padding);
        ctx.stroke();
        
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(W - padding - cornerSize, H - padding);
        ctx.lineTo(W - padding, H - padding);
        ctx.lineTo(W - padding, H - padding - cornerSize);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Draw hexagon shape
     */
    function drawHexagon(ctx, x, y, size, color, alpha) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2;
        drawHexagonPath(ctx, x, y, size);
        ctx.stroke();
        ctx.restore();
    }
    
    function drawHexagonPath(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }
    
    /**
     * Draw decorative line with diamond center
     */
    function drawDecorativeLine(ctx, x, y, width) {
        const centerX = x + width / 2;
        
        ctx.save();
        
        // Left line
        const leftGradient = ctx.createLinearGradient(x, 0, centerX - 20, 0);
        leftGradient.addColorStop(0, 'rgba(0, 255, 65, 0)');
        leftGradient.addColorStop(1, 'rgba(0, 255, 65, 0.6)');
        
        ctx.strokeStyle = leftGradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(centerX - 15, y);
        ctx.stroke();
        
        // Right line
        const rightGradient = ctx.createLinearGradient(centerX + 20, 0, x + width, 0);
        rightGradient.addColorStop(0, 'rgba(0, 255, 65, 0.6)');
        rightGradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
        
        ctx.strokeStyle = rightGradient;
        ctx.beginPath();
        ctx.moveTo(centerX + 15, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
        
        // Diamond in center
        ctx.fillStyle = '#00ff41';
        ctx.beginPath();
        ctx.moveTo(centerX, y - 6);
        ctx.lineTo(centerX + 6, y);
        ctx.lineTo(centerX, y + 6);
        ctx.lineTo(centerX - 6, y);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Draw info box
     */
    function drawInfoBox(ctx, x, y, width, height, label, value) {
        ctx.save();
        
        // Box background
        ctx.fillStyle = 'rgba(0, 255, 65, 0.05)';
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
        ctx.lineWidth = 1;
        
        // Rounded rectangle
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Label
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.7)';
        ctx.font = '600 10px "Segoe UI", Arial, sans-serif';
        ctx.fillText(label, x + width/2, y + 25);
        
        // Value
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 18px "Segoe UI", Arial, sans-serif';
        ctx.fillText(value, x + width/2, y + 55);
        
        ctx.restore();
    }
    
    /**
     * Draw modern QR-like decoration
     */
    function drawModernQR(ctx, x, y, size) {
        ctx.save();
        
        const cellSize = size / 6;
        const pattern = [
            [1, 1, 1, 0, 1, 1],
            [1, 0, 1, 1, 0, 1],
            [1, 1, 0, 0, 1, 1],
            [0, 1, 0, 1, 1, 0],
            [1, 0, 1, 0, 0, 1],
            [1, 1, 1, 1, 1, 1]
        ];
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (pattern[row][col]) {
                    ctx.fillStyle = `rgba(0, 255, 65, ${0.2 + Math.random() * 0.3})`;
                    ctx.fillRect(
                        x + col * cellSize,
                        y + row * cellSize,
                        cellSize - 2,
                        cellSize - 2
                    );
                }
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Load image helper
     */
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    /**
     * Download certificate as PNG
     */
    function downloadCertificate(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename || 'certificate.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Save certificate to localStorage
     */
    function saveCertificate(credentialId, data) {
        const certificates = JSON.parse(localStorage.getItem('tharun_certificates') || '{}');
        certificates[credentialId] = {
            ...data,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('tharun_certificates', JSON.stringify(certificates));
    }
    
    /**
     * Get saved certificates
     */
    function getSavedCertificates() {
        return JSON.parse(localStorage.getItem('tharun_certificates') || '{}');
    }
    
    /**
     * Verify a credential ID
     */
    function verifyCredential(credentialId) {
        const result = decodeCredential(credentialId);
        if (result.valid) {
            return {
                valid: true,
                name: result.data.n,
                series: result.data.s,
                date: result.data.d,
                timestamp: result.data.t
            };
        }
        return result;
    }
    
    // Public API
    return {
        generateCredentialId,
        generateCertificateCanvas,
        downloadCertificate,
        saveCertificate,
        getSavedCertificates,
        verifyCredential,
        formatDate
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CertificateSystem;
}
