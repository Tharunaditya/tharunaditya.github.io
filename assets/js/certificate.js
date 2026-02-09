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
     * Generate certificate canvas - A4 Landscape with Sidebar Design
     */
    async function generateCertificateCanvas(options) {
        const {
            name,
            title, // designation
            series,
            date,
            credentialId,
            partsCompleted = 5,
            badgeUrl
        } = options;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // A4 Landscape dimensions (297mm x 210mm at 96 DPI scaled)
        canvas.width = 1400;
        canvas.height = 990;
        
        const W = canvas.width;
        const H = canvas.height;
        const SIDEBAR_WIDTH = Math.floor(W / 3); // 1/3 for sidebar
        const CONTENT_START = SIDEBAR_WIDTH;
        const CONTENT_WIDTH = W - SIDEBAR_WIDTH; // 2/3 for content
        
        // === MAIN BACKGROUND (Content Area) ===
        const mainBg = ctx.createLinearGradient(SIDEBAR_WIDTH, 0, W, H);
        mainBg.addColorStop(0, '#0d0d15');
        mainBg.addColorStop(1, '#050508');
        ctx.fillStyle = mainBg;
        ctx.fillRect(SIDEBAR_WIDTH, 0, CONTENT_WIDTH, H);
        
        // Subtle grid pattern on main area
        drawGridPattern(ctx, SIDEBAR_WIDTH, 0, CONTENT_WIDTH, H);
        
        // === SIDEBAR (1/3) ===
        const sidebarGradient = ctx.createLinearGradient(0, 0, SIDEBAR_WIDTH, H);
        sidebarGradient.addColorStop(0, '#00ff41');
        sidebarGradient.addColorStop(0.3, '#00cc33');
        sidebarGradient.addColorStop(0.7, '#009926');
        sidebarGradient.addColorStop(1, '#006619');
        ctx.fillStyle = sidebarGradient;
        ctx.fillRect(0, 0, SIDEBAR_WIDTH, H);
        
        // Sidebar geometric pattern overlay
        drawSidebarPattern(ctx, SIDEBAR_WIDTH, H);
        
        // === SIDEBAR CONTENT ===
        const sidebarCenterX = SIDEBAR_WIDTH / 2;
        
        // Top section: Badge
        if (badgeUrl) {
            try {
                const badge = await loadImage(badgeUrl);
                const badgeSize = 180;
                const badgeY = 120;
                
                // Badge circular frame
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 30;
                ctx.shadowOffsetY = 10;
                
                // White circle background
                ctx.beginPath();
                ctx.arc(sidebarCenterX, badgeY + badgeSize/2, badgeSize/2 + 15, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(sidebarCenterX, badgeY + badgeSize/2, badgeSize/2 + 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fill();
                
                // Draw badge
                ctx.drawImage(badge, sidebarCenterX - badgeSize/2, badgeY, badgeSize, badgeSize);
                ctx.restore();
                
            } catch (e) {
                // Fallback badge placeholder
                drawBadgePlaceholder(ctx, sidebarCenterX, 210, 80);
            }
        } else {
            drawBadgePlaceholder(ctx, sidebarCenterX, 210, 80);
        }
        
        // Series name under badge
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(series, sidebarCenterX, 380);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`${partsCompleted} Part Series`, sidebarCenterX, 405);
        ctx.restore();
        
        // Decorative line
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 450);
        ctx.lineTo(SIDEBAR_WIDTH - 60, 450);
        ctx.stroke();
        
        // Bottom section: Certificate of Completion text (vertical feel)
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '300 14px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '3px';
        ctx.fillText('C E R T I F I C A T E', sidebarCenterX, H - 280);
        
        ctx.font = '300 14px "Segoe UI", Arial, sans-serif';
        ctx.fillText('O F', sidebarCenterX, H - 250);
        
        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        ctx.fillText('COMPLETION', sidebarCenterX, H - 210);
        ctx.restore();
        
        // Website branding at very bottom
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('tharunaditya.dev', sidebarCenterX, H - 40);
        
        // === MAIN CONTENT AREA (2/3) ===
        const contentCenterX = CONTENT_START + CONTENT_WIDTH / 2;
        const marginLeft = CONTENT_START + 80;
        const marginRight = W - 80;
        
        // Top decorative corner accents
        drawCornerAccent(ctx, CONTENT_START + 30, 30, 50, 1, 1);
        drawCornerAccent(ctx, W - 30, 30, 50, -1, 1);
        drawCornerAccent(ctx, CONTENT_START + 30, H - 30, 50, 1, -1);
        drawCornerAccent(ctx, W - 30, H - 30, 50, -1, -1);
        
        // "This is to certify that" section
        let currentY = 180;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '300 18px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('This is to certify that', contentCenterX, currentY);
        
        currentY += 70;
        
        // Recipient Name with glow
        ctx.save();
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
        ctx.fillText(name, contentCenterX, currentY);
        ctx.restore();
        
        // Name underline
        const nameMetrics = ctx.measureText(name);
        const underlineWidth = Math.min(nameMetrics.width + 80, CONTENT_WIDTH - 160);
        
        const underlineGradient = ctx.createLinearGradient(
            contentCenterX - underlineWidth/2, 0, 
            contentCenterX + underlineWidth/2, 0
        );
        underlineGradient.addColorStop(0, 'rgba(0, 255, 65, 0)');
        underlineGradient.addColorStop(0.2, 'rgba(0, 255, 65, 0.8)');
        underlineGradient.addColorStop(0.8, 'rgba(0, 255, 65, 0.8)');
        underlineGradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
        
        ctx.strokeStyle = underlineGradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(contentCenterX - underlineWidth/2, currentY + 15);
        ctx.lineTo(contentCenterX + underlineWidth/2, currentY + 15);
        ctx.stroke();
        
        currentY += 50;
        
        // Designation (if provided)
        if (title && title.trim()) {
            ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
            ctx.font = '400 18px "Segoe UI", Arial, sans-serif';
            ctx.fillText(title, contentCenterX, currentY);
            currentY += 50;
        } else {
            currentY += 20;
        }
        
        // Completion message
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '300 20px "Segoe UI", Arial, sans-serif';
        ctx.fillText('has successfully completed the', contentCenterX, currentY);
        
        currentY += 55;
        
        // Series name
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.fillText(series, contentCenterX, currentY);
        
        currentY += 35;
        
        // Series details
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '300 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`A comprehensive ${partsCompleted}-part learning series`, contentCenterX, currentY);
        
        currentY += 40;
        
        // Completion date
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '400 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`Completed on ${formatDate(date)}`, contentCenterX, currentY);
        
        // === ISSUED BY SECTION ===
        const issuedY = H - 200;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '300 12px "Segoe UI", Arial, sans-serif';
        ctx.fillText('ISSUED BY', contentCenterX, issuedY);
        
        // Signature line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(contentCenterX - 120, issuedY + 45);
        ctx.lineTo(contentCenterX + 120, issuedY + 45);
        ctx.stroke();
        
        // Issuer name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 24px "Georgia", serif';
        ctx.fillText('Tharunaditya Anuganti', contentCenterX, issuedY + 38);
        
        // Title
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '400 14px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Security Researcher', contentCenterX, issuedY + 65);
        
        // === CREDENTIAL FOOTER ===
        const footerY = H - 55;
        
        // Left: Credential ID
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.6)';
        ctx.font = '600 10px "Segoe UI", Arial, sans-serif';
        ctx.fillText('CREDENTIAL ID', marginLeft, footerY - 18);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '11px "Courier New", monospace';
        const displayCredential = credentialId.length > 55 
            ? credentialId.substring(0, 55) + '...' 
            : credentialId;
        ctx.fillText(displayCredential, marginLeft, footerY);
        
        // Right: Verification
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.6)';
        ctx.font = '600 10px "Segoe UI", Arial, sans-serif';
        ctx.fillText('VERIFY AT', marginRight, footerY - 18);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText('tharunaditya.dev/verify', marginRight, footerY);
        
        return canvas;
    }
    
    /**
     * Draw subtle grid pattern
     */
    function drawGridPattern(ctx, x, y, width, height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.03)';
        ctx.lineWidth = 1;
        
        const spacing = 30;
        
        for (let i = x; i < x + width; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(i, y);
            ctx.lineTo(i, y + height);
            ctx.stroke();
        }
        
        for (let j = y; j < y + height; j += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, j);
            ctx.lineTo(x + width, j);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * Draw sidebar decorative pattern
     */
    function drawSidebarPattern(ctx, width, height) {
        ctx.save();
        
        // Diagonal lines pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        
        for (let i = -height; i < width + height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
            ctx.stroke();
        }
        
        // Circle decorations
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(width * 0.3, height * 0.6, 100, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(width * 0.7, height * 0.75, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Draw badge placeholder
     */
    function drawBadgePlaceholder(ctx, x, y, size) {
        ctx.save();
        
        // Outer circle
        ctx.beginPath();
        ctx.arc(x, y, size + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // Icon
        ctx.fillStyle = 'rgba(0, 150, 50, 0.8)';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x, y);
        
        ctx.restore();
    }
    
    /**
     * Draw corner accent
     */
    function drawCornerAccent(ctx, x, y, size, dirX, dirY) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y + (size * dirY));
        ctx.lineTo(x, y);
        ctx.lineTo(x + (size * dirX), y);
        ctx.stroke();
        
        // Small dot at corner
        ctx.fillStyle = '#00ff41';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
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
