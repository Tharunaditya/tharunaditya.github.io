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
     * Generate certificate canvas
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
        
        // Certificate dimensions (A4-ish landscape)
        canvas.width = 1200;
        canvas.height = 850;
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(0.5, '#0d1117');
        gradient.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Decorative border
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Inner border
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);
        
        // Corner decorations
        drawCornerDecoration(ctx, 20, 20, 60, 1, 1);
        drawCornerDecoration(ctx, canvas.width - 20, 20, 60, -1, 1);
        drawCornerDecoration(ctx, 20, canvas.height - 20, 60, 1, -1);
        drawCornerDecoration(ctx, canvas.width - 20, canvas.height - 20, 60, -1, -1);
        
        // Circuit pattern decorations
        drawCircuitPattern(ctx, 50, 100, 100, 200);
        drawCircuitPattern(ctx, canvas.width - 150, 100, 100, 200);
        drawCircuitPattern(ctx, 50, canvas.height - 300, 100, 200);
        drawCircuitPattern(ctx, canvas.width - 150, canvas.height - 300, 100, 200);
        
        // Header text
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('THARUNADITYA.DEV', canvas.width / 2, 70);
        
        // Certificate title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px "Georgia", serif';
        ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 140);
        
        // Decorative line
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(300, 160);
        ctx.lineTo(900, 160);
        ctx.stroke();
        
        // "This is to certify that"
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '20px "Georgia", serif';
        ctx.fillText('This is to certify that', canvas.width / 2, 220);
        
        // Name
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 44px "Georgia", serif';
        ctx.fillText(name.toUpperCase(), canvas.width / 2, 280);
        
        // Decorative line under name
        const nameWidth = ctx.measureText(name.toUpperCase()).width;
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo((canvas.width - nameWidth) / 2 - 20, 295);
        ctx.lineTo((canvas.width + nameWidth) / 2 + 20, 295);
        ctx.stroke();
        
        // "has successfully completed"
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '20px "Georgia", serif';
        ctx.fillText('has successfully completed the', canvas.width / 2, 350);
        
        // Series name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Georgia", serif';
        ctx.fillText(series, canvas.width / 2, 400);
        
        // Parts info
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '18px "Georgia", serif';
        ctx.fillText(`Comprising ${partsCompleted} comprehensive parts`, canvas.width / 2, 440);
        
        // Date
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px "Georgia", serif';
        ctx.fillText(`Completed on ${formatDate(date)}`, canvas.width / 2, 490);
        
        // Load and draw badge if available
        if (badgeUrl) {
            try {
                const badge = await loadImage(badgeUrl);
                const badgeSize = 120;
                ctx.save();
                ctx.shadowColor = '#00ff41';
                ctx.shadowBlur = 20;
                ctx.drawImage(badge, canvas.width / 2 - badgeSize / 2, 510, badgeSize, badgeSize);
                ctx.restore();
            } catch (e) {
                // Badge load failed, continue without it
                console.log('Badge could not be loaded');
            }
        }
        
        // Signature area
        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 24px "Georgia", serif';
        ctx.fillText('Tharunaditya Anuganti', canvas.width / 2, 700);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 120, 710);
        ctx.lineTo(canvas.width / 2 + 120, 710);
        ctx.stroke();
        
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '14px "Georgia", serif';
        ctx.fillText('Content Creator & Security Researcher', canvas.width / 2, 730);
        
        // Credential ID
        ctx.fillStyle = '#00ff41';
        ctx.font = '12px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Credential ID: ${credentialId.substring(0, 50)}...`, 60, canvas.height - 50);
        
        // Verification URL
        ctx.textAlign = 'right';
        ctx.fillStyle = '#a0a0a0';
        ctx.fillText('Verify at: tharunaditya.dev/verify', canvas.width - 60, canvas.height - 50);
        
        // QR-like decoration (simplified pattern)
        drawQRDecoration(ctx, canvas.width - 140, canvas.height - 130, 60);
        
        return canvas;
    }
    
    /**
     * Draw corner decoration
     */
    function drawCornerDecoration(ctx, x, y, size, dirX, dirY) {
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + (size * dirY));
        ctx.lineTo(x, y);
        ctx.lineTo(x + (size * dirX), y);
        ctx.stroke();
    }
    
    /**
     * Draw circuit pattern decoration
     */
    function drawCircuitPattern(ctx, x, y, width, height) {
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i < 5; i++) {
            const lineY = y + (i * height / 4);
            ctx.beginPath();
            ctx.moveTo(x, lineY);
            ctx.lineTo(x + width, lineY);
            ctx.stroke();
            
            // Node dots
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
                ctx.beginPath();
                ctx.arc(x + width / 2, lineY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Vertical lines
        for (let i = 0; i < 3; i++) {
            const lineX = x + (i * width / 2);
            ctx.beginPath();
            ctx.moveTo(lineX, y);
            ctx.lineTo(lineX, y + height);
            ctx.stroke();
        }
    }
    
    /**
     * Draw QR-like decoration
     */
    function drawQRDecoration(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
        const cellSize = size / 8;
        
        // Random-ish pattern
        const pattern = [
            [1,1,1,0,0,1,1,1],
            [1,0,1,0,0,1,0,1],
            [1,1,1,0,0,1,1,1],
            [0,0,0,1,1,0,0,0],
            [0,0,0,1,1,0,0,0],
            [1,1,1,0,0,1,1,1],
            [1,0,1,0,0,1,0,1],
            [1,1,1,0,0,1,1,1]
        ];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (pattern[row][col]) {
                    ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize - 1, cellSize - 1);
                }
            }
        }
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
