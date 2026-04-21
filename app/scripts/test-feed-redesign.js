const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:4000';
const ARTIFACT_DIR = path.join(process.env.USERPROFILE || '', '.gemini', 'antigravity', 'brain', 'e2b9d41d-80b3-4323-850c-7053de641daa');

if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function run() {
    console.log('🚀 Bắt đầu smoke test Feed Redesign Option C (Desktop & Mobile)');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // --- BÀI TEST 1: DESKTOP GUEST BROWSE ---
        await page.setViewport({ width: 1280, height: 800 });
        console.log('1️⃣ Kiểm tra Desktop: Load trang chủ mặc định (Guest)...');
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

        // Đợi feed load
        await page.waitForSelector('.wm-light', { timeout: 10000 });

        const desktopFeedPath = path.join(ARTIFACT_DIR, `optC_desktop_feed_${Date.now()}.webp`);
        await page.screenshot({ path: desktopFeedPath, type: 'webp', fullPage: true });
        console.log(`✅ Chụp màn hình Desktop Feed thành công: ${path.basename(desktopFeedPath)}`);

        // --- BÀI TEST 2: AUTHENTICATION GATE ---
        console.log('2️⃣ Kiểm tra Auth Gate: Bấm nút Đàm phán (Guest)...');
        const negotiateButtons = await page.$$('button');
        let foundNegotiate = false;
        for (const btn of negotiateButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('Đàm phán')) {
                await btn.click();
                foundNegotiate = true;
                break;
            }
        }

        if (foundNegotiate) {
            await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
            await new Promise(r => setTimeout(r, 1000));
            const authGatePath = path.join(ARTIFACT_DIR, `optC_auth_gate_${Date.now()}.webp`);
            await page.screenshot({ path: authGatePath, type: 'webp' });
            console.log(`✅ Chụp màn hình Auth Gate thành công: ${path.basename(authGatePath)}`);
        } else {
            console.log('⚠️ Không tìm thấy nút Đàm phán để test Auth Gate.');
        }

        // --- BÀI TEST 3: MOBILE LAYOUT ---
        console.log('3️⃣ Kiểm tra Mobile (375px): Viewport rendering...');
        await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
        await page.waitForSelector('.wm-light');

        const mobileFeedPath = path.join(ARTIFACT_DIR, `optC_mobile_feed_${Date.now()}.webp`);
        await page.screenshot({ path: mobileFeedPath, type: 'webp', fullPage: true });
        console.log(`✅ Chụp màn hình Mobile Feed thành công: ${path.basename(mobileFeedPath)}`);

        console.log('🎉 Smoke test hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi trong lúc test:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

run();
