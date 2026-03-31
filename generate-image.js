const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateReportImage() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for consistent sizing
        await page.setViewport({
            width: 1200,
            height: 3000,
            deviceScaleFactor: 2
        });
        
        // Load the HTML file
        const htmlPath = path.join(__dirname, 'index.html');
        await page.goto('file://' + htmlPath, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        // Wait for fonts and styles to load
        await page.waitForTimeout(2000);
        
        // Hide the screenshot button
        await page.evaluate(() => {
            const btn = document.querySelector('button[onclick="generateImage()"]');
            if (btn) btn.style.display = 'none';
        });
        
        // Get full page height
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.setViewport({
            width: 1200,
            height: bodyHeight + 100,
            deviceScaleFactor: 2
        });
        
        // Take screenshot
        const timestamp = new Date().toISOString().split('T')[0];
        const outputPath = path.join(__dirname, `環球財經簡報_${timestamp}.png`);
        
        await page.screenshot({
            path: outputPath,
            fullPage: true,
            type: 'png'
        });
        
        console.log('✅ 圖片生成成功:', outputPath);
        return outputPath;
        
    } catch (error) {
        console.error('❌ 生成圖片失敗:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run if called directly
if (require.main === module) {
    generateReportImage()
        .then(path => console.log('完成:', path))
        .catch(err => process.exit(1));
}

module.exports = { generateReportImage };