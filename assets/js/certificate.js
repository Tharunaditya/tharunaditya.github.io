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
     * Generate certificate canvas - Premium A4 Landscape with Sidebar Design
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
        
        // Higher resolution A4 Landscape for crisp output
        canvas.width = 1800;
        canvas.height = 1272;
        
        const W = canvas.width;
        const H = canvas.height;
        const SIDEBAR_WIDTH = Math.floor(W * 0.30);
        const CONTENT_START = SIDEBAR_WIDTH;
        const CONTENT_WIDTH = W - SIDEBAR_WIDTH;
        
        // === MAIN BACKGROUND (Content Area) ===
        const mainBg = ctx.createLinearGradient(SIDEBAR_WIDTH, 0, W, H);
        mainBg.addColorStop(0, '#0a0a12');
        mainBg.addColorStop(0.5, '#0d0d18');
        mainBg.addColorStop(1, '#060609');
        ctx.fillStyle = mainBg;
        ctx.fillRect(SIDEBAR_WIDTH, 0, CONTENT_WIDTH, H);
        
        // Subtle grid pattern on main area
        drawGridPattern(ctx, SIDEBAR_WIDTH, 0, CONTENT_WIDTH, H);
        
        // Ambient glow from sidebar edge
        const edgeGlow = ctx.createLinearGradient(SIDEBAR_WIDTH, 0, SIDEBAR_WIDTH + 200, 0);
        edgeGlow.addColorStop(0, 'rgba(0, 255, 65, 0.06)');
        edgeGlow.addColorStop(1, 'rgba(0, 255, 65, 0)');
        ctx.fillStyle = edgeGlow;
        ctx.fillRect(SIDEBAR_WIDTH, 0, 200, H);
        
        // === SIDEBAR ===
        const sidebarGradient = ctx.createLinearGradient(0, 0, SIDEBAR_WIDTH, H);
        sidebarGradient.addColorStop(0, '#00e63a');
        sidebarGradient.addColorStop(0.25, '#00cc33');
        sidebarGradient.addColorStop(0.6, '#00a329');
        sidebarGradient.addColorStop(1, '#007a1f');
        ctx.fillStyle = sidebarGradient;
        ctx.fillRect(0, 0, SIDEBAR_WIDTH, H);
        
        // Sidebar geometric overlay
        drawSidebarPattern(ctx, SIDEBAR_WIDTH, H);
        
        // Sidebar inner shadow (right edge)
        const sidebarEdge = ctx.createLinearGradient(SIDEBAR_WIDTH - 30, 0, SIDEBAR_WIDTH, 0);
        sidebarEdge.addColorStop(0, 'rgba(0, 0, 0, 0)');
        sidebarEdge.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        ctx.fillStyle = sidebarEdge;
        ctx.fillRect(SIDEBAR_WIDTH - 30, 0, 30, H);
        
        // === SIDEBAR CONTENT ===
        const sidebarCenterX = SIDEBAR_WIDTH / 2;
        
        // Badge area
        if (badgeUrl) {
            try {
                const badge = await loadImage(badgeUrl);
                const badgeSize = 200;
                const badgeY = 130;
                
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 35;
                ctx.shadowOffsetY = 8;
                
                // Outer glow ring
                ctx.beginPath();
                ctx.arc(sidebarCenterX, badgeY + badgeSize/2, badgeSize/2 + 20, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fill();
                
                // White circle frame
                ctx.beginPath();
                ctx.arc(sidebarCenterX, badgeY + badgeSize/2, badgeSize/2 + 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
                ctx.fill();
                
                // Clip and draw badge
                ctx.beginPath();
                ctx.arc(sidebarCenterX, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(badge, sidebarCenterX - badgeSize/2, badgeY, badgeSize, badgeSize);
                ctx.restore();
                
            } catch (e) {
                drawBadgePlaceholder(ctx, sidebarCenterX, 230, 90);
            }
        } else {
            drawBadgePlaceholder(ctx, sidebarCenterX, 230, 90);
        }
        
        // Series name under badge
        ctx.save();
        ctx.textAlign = 'center';
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
        wrapText(ctx, series, sidebarCenterX, 420, SIDEBAR_WIDTH - 60, 28);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`${partsCompleted}-Part Series`, sidebarCenterX, 460);
        ctx.restore();
        
        // Ornamental divider
        drawOrnamentalDivider(ctx, sidebarCenterX, 510, SIDEBAR_WIDTH - 100, 'rgba(0, 0, 0, 0.25)');
        
        // Certificate of Completion
        ctx.save();
        ctx.textAlign = 'center';
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '300 15px "Segoe UI", Arial, sans-serif';
        ctx.fillText('C E R T I F I C A T E', sidebarCenterX, H - 330);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.font = '300 14px "Segoe UI", Arial, sans-serif';
        ctx.fillText('O F', sidebarCenterX, H - 302);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
        ctx.fillText('COMPLETION', sidebarCenterX, H - 260);
        ctx.restore();
        
        // Ornamental divider below
        drawOrnamentalDivider(ctx, sidebarCenterX, H - 230, SIDEBAR_WIDTH - 100, 'rgba(0, 0, 0, 0.2)');
        
        // Completion date on sidebar
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.font = '400 14px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Awarded on', sidebarCenterX, H - 170);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.font = '600 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(formatDate(date), sidebarCenterX, H - 145);
        ctx.restore();
        
        // Branding at bottom
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.font = '700 13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('tharunaditya.dev', sidebarCenterX, H - 45);
        ctx.restore();
        
        // === MAIN CONTENT AREA ===
        const contentCenterX = CONTENT_START + CONTENT_WIDTH / 2;
        const marginLeft = CONTENT_START + 80;
        const marginRight = W - 80;
        
        // Decorative double-border frame on content area
        drawContentFrame(ctx, CONTENT_START + 25, 25, CONTENT_WIDTH - 50, H - 50);
        
        // Corner ornaments
        drawCornerOrnament(ctx, CONTENT_START + 40, 40, 60, 1, 1);
        drawCornerOrnament(ctx, W - 40, 40, 60, -1, 1);
        drawCornerOrnament(ctx, CONTENT_START + 40, H - 40, 60, 1, -1);
        drawCornerOrnament(ctx, W - 40, H - 40, 60, -1, -1);
        
        // "This is to certify that" section
        let currentY = 200;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '300 19px "Segoe UI", Arial, sans-serif';
        ctx.fillText('T H I S   I S   T O   C E R T I F Y   T H A T', contentCenterX, currentY);
        ctx.restore();
        
        currentY += 85;
        
        // Recipient Name — large with glow
        ctx.save();
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 255, 65, 0.5)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 56px "Georgia", "Times New Roman", serif';
        ctx.fillText(name, contentCenterX, currentY);
        // Double render for stronger glow
        ctx.shadowBlur = 15;
        ctx.fillText(name, contentCenterX, currentY);
        ctx.restore();
        
        // Ornamental underline beneath name
        ctx.save();
        ctx.font = 'bold 56px "Georgia", serif';
        const nameMetrics = ctx.measureText(name);
        const underlineW = Math.min(nameMetrics.width + 100, CONTENT_WIDTH - 200);
        
        drawOrnamentalDivider(ctx, contentCenterX, currentY + 22, underlineW, 'rgba(0, 255, 65, 0.6)');
        ctx.restore();
        
        currentY += 60;
        
        // Designation (if provided)
        if (title && title.trim()) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
            ctx.font = 'italic 400 20px "Segoe UI", Arial, sans-serif';
            ctx.fillText(title, contentCenterX, currentY);
            ctx.restore();
            currentY += 55;
        } else {
            currentY += 25;
        }
        
        // "has successfully completed the"
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '300 21px "Segoe UI", Arial, sans-serif';
        ctx.fillText('has successfully completed the', contentCenterX, currentY);
        ctx.restore();
        
        currentY += 60;
        
        // Series name — prominent
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
        ctx.shadowColor = 'rgba(0, 255, 65, 0.3)';
        ctx.shadowBlur = 12;
        ctx.fillText(series, contentCenterX, currentY);
        ctx.restore();
        
        currentY += 38;
        
        // Series details
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '300 17px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`A comprehensive ${partsCompleted}-part learning series on tharunaditya.dev`, contentCenterX, currentY);
        ctx.restore();
        
        // === ISSUED BY + SEAL SECTION ===
        const issuedY = H - 260;
        
        // Thin separator line
        const sepGrad = ctx.createLinearGradient(contentCenterX - 200, 0, contentCenterX + 200, 0);
        sepGrad.addColorStop(0, 'rgba(0, 255, 65, 0)');
        sepGrad.addColorStop(0.3, 'rgba(0, 255, 65, 0.15)');
        sepGrad.addColorStop(0.7, 'rgba(0, 255, 65, 0.15)');
        sepGrad.addColorStop(1, 'rgba(0, 255, 65, 0)');
        ctx.strokeStyle = sepGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(contentCenterX - 200, issuedY - 20);
        ctx.lineTo(contentCenterX + 200, issuedY - 20);
        ctx.stroke();
        
        // Seal/stamp on the right
        const sealX = contentCenterX + 220;
        const sealY = issuedY + 50;
        drawVerificationSeal(ctx, sealX, sealY, 58);
        
        // Signature column (left of seal)
        const sigCenterX = contentCenterX - 40;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '300 13px "Segoe UI", Arial, sans-serif';
        ctx.fillText('ISSUED BY', sigCenterX, issuedY + 5);
        
        // Signature (handwritten style)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 28px "Georgia", "Times New Roman", serif';
        ctx.fillText('Tharunaditya Anuganti', sigCenterX, issuedY + 52);
        
        // Signature underline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sigCenterX - 150, issuedY + 62);
        ctx.lineTo(sigCenterX + 150, issuedY + 62);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '400 15px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Security Researcher & Developer', sigCenterX, issuedY + 85);
        ctx.restore();
        
        // === CREDENTIAL FOOTER ===
        const footerY = H - 65;
        
        // Footer background strip
        ctx.fillStyle = 'rgba(0, 255, 65, 0.04)';
        ctx.fillRect(CONTENT_START + 25, footerY - 30, CONTENT_WIDTH - 50, 45);
        
        // Left: Credential ID
        ctx.save();
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.55)';
        ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
        ctx.fillText('CREDENTIAL ID', marginLeft, footerY - 14);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '12px "Courier New", monospace';
        const displayCredential = credentialId.length > 60 
            ? credentialId.substring(0, 60) + '...' 
            : credentialId;
        ctx.fillText(displayCredential, marginLeft, footerY + 4);
        ctx.restore();
        
        // Right: Verification URL
        ctx.save();
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(0, 255, 65, 0.55)';
        ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
        ctx.fillText('VERIFY AT', marginRight, footerY - 14);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText('tharunaditya.dev/verify', marginRight, footerY + 4);
        ctx.restore();
        
        return canvas;
    }
    
    /**
     * Word-wrap helper for text
     */
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
    }
    
    /**
     * Draw subtle grid pattern
     */
    function drawGridPattern(ctx, x, y, width, height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.025)';
        ctx.lineWidth = 0.5;
        
        const spacing = 35;
        
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
        
        // Subtle diagonal lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        
        for (let i = -height; i < width + height; i += 45) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
            ctx.stroke();
        }
        
        // Subtle circle accents
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(width * 0.25, height * 0.55, 120, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(width * 0.75, height * 0.8, 70, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(width * 0.6, height * 0.15, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Draw ornamental divider (diamond + line)
     */
    function drawOrnamentalDivider(ctx, cx, cy, width, color) {
        ctx.save();
        const halfW = width / 2;
        
        // Left line
        const leftGrad = ctx.createLinearGradient(cx - halfW, 0, cx - 8, 0);
        leftGrad.addColorStop(0, 'rgba(0,0,0,0)');
        leftGrad.addColorStop(1, color);
        ctx.strokeStyle = leftGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - halfW, cy);
        ctx.lineTo(cx - 8, cy);
        ctx.stroke();
        
        // Right line
        const rightGrad = ctx.createLinearGradient(cx + 8, 0, cx + halfW, 0);
        rightGrad.addColorStop(0, color);
        rightGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = rightGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy);
        ctx.lineTo(cx + halfW, cy);
        ctx.stroke();
        
        // Center diamond
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx + 4, cy);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 4, cy);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Draw badge placeholder (star-in-circle)
     */
    function drawBadgePlaceholder(ctx, x, y, size) {
        ctx.save();
        
        // Soft outer glow
        ctx.beginPath();
        ctx.arc(x, y, size + 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fill();
        
        // White circle
        ctx.beginPath();
        ctx.arc(x, y, size + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fill();
        
        // Inner colored circle
        ctx.beginPath();
        ctx.arc(x, y, size - 8, 0, Math.PI * 2);
        const innerGrad = ctx.createRadialGradient(x, y - 15, 0, x, y, size);
        innerGrad.addColorStop(0, '#00cc33');
        innerGrad.addColorStop(1, '#007a1f');
        ctx.fillStyle = innerGrad;
        ctx.fill();
        
        // Star icon
        drawStar(ctx, x, y, 5, size * 0.45, size * 0.22, 'rgba(255, 255, 255, 0.95)');
        
        ctx.restore();
    }
    
    /**
     * Draw a 5-pointed star
     */
    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    
    /**
     * Draw premium content frame (double border with gap)
     */
    function drawContentFrame(ctx, x, y, w, h) {
        ctx.save();
        
        // Outer border
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        
        // Inner border with slight inset
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
        
        ctx.restore();
    }
    
    /**
     * Draw corner ornament (L-shape with dot and inner dash)
     */
    function drawCornerOrnament(ctx, x, y, size, dirX, dirY) {
        ctx.save();
        
        // Outer L-shape
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + (size * dirY));
        ctx.lineTo(x, y);
        ctx.lineTo(x + (size * dirX), y);
        ctx.stroke();
        
        // Inner shorter L
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
        ctx.lineWidth = 1;
        const inner = size * 0.55;
        ctx.beginPath();
        ctx.moveTo(x + 6 * dirX, y + (inner * dirY));
        ctx.lineTo(x + 6 * dirX, y + 6 * dirY);
        ctx.lineTo(x + (inner * dirX), y + 6 * dirY);
        ctx.stroke();
        
        // Corner dot
        ctx.fillStyle = '#00ff41';
        ctx.shadowColor = 'rgba(0, 255, 65, 0.6)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Draw verification seal / stamp
     */
    function drawVerificationSeal(ctx, cx, cy, radius) {
        ctx.save();
        
        // Outer scalloped edge
        const points = 24;
        const outerR = radius;
        const innerR = radius - 6;
        
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 255, 65, 0.06)';
        ctx.fill();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Checkmark icon
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.8)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy + 2);
        ctx.lineTo(cx - 4, cy + 12);
        ctx.lineTo(cx + 16, cy - 10);
        ctx.stroke();
        
        // "VERIFIED" text curved at top
        ctx.fillStyle = 'rgba(0, 255, 65, 0.55)';
        ctx.font = 'bold 9px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawCurvedText(ctx, 'VERIFIED', cx, cy, radius - 24, -Math.PI * 0.7, Math.PI * 0.7);
        
        ctx.restore();
    }
    
    /**
     * Draw text along a curved path
     */
    function drawCurvedText(ctx, text, cx, cy, radius, startAngle, endAngle) {
        ctx.save();
        const totalAngle = endAngle - startAngle;
        const angleStep = totalAngle / (text.length - 1 || 1);
        
        for (let i = 0; i < text.length; i++) {
            const angle = startAngle + i * angleStep;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
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
