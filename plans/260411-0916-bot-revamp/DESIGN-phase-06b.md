# 🎨 DESIGN: Phase 06b - n8n Crawler Infrastructure

Ngày tạo: 2026-04-13  
Dựa trên: `plans/260411-0916-bot-revamp/phase-06b-n8n-infra.md`  
Status: **✅ APPROVED - Ready to Code**

---

## 🏗️ 1. Tóm tắt Kiến trúc (Architecture)

**Vấn đề:** Trình cào dữ liệu hiện tại (GenericCrawler) thỉnh thoảng bị chặn bởi các trang web phức tạp (SPA, cần chạy JavaScript, hoặc có anti-bot).  
**Giải pháp:** Thêm **n8n** - một công cụ tự động hóa cực mạnh, chạy độc lập. n8n đóng vai trò như một "nhân viên cào dữ liệu siêu đẳng", có thể dùng trình duyệt ẩn (Puppeteer) để lướt web như người dùng thật. Sau khi cào xong, n8n đóng gói dữ liệu và gửi thẳng về API của dự án qua Webhook.

💡 **Mô hình Hybrid:** Hai "nhân viên cào dữ liệu" hoạt động song song. Nếu n8n lăn ra ngủ, ứng dụng chính (Next.js) vẫn chạy bình thường với nhân viên cũ (GenericCrawler).

---

## 🗄️ 2. Cách Lưu Thông Tin & Kết Nối (Data Flow)

### Sơ đồ Nguồn Dữ Liệu:

```
┌─────────────────┐            ┌────────────────────────────────┐
│  Nguồn Web Gắt  │ ─────────► │ ✨ n8n (Puppeteer Workflow)   │
│ (SPA, Anti-Bot) │            │ Phân tích HTML → Trích xuất JS │
└─────────────────┘            └──────────────┬─────────────────┘
                                              │ Gửi cục dữ liệu (JSON)
                                              │ Kèm "Mật khẩu" (Webhook Secret)
                                              ▼
┌─────────────────┐            ┌────────────────────────────────┐
│ Mạng Xã Hội,    │ ─────────► │ 🏢 NEXT.JS API ROUTE           │
│ API đơn giản    │            │ (POST /api/crawler/webhook)    │
└─────────────────┘            └──────────────┬─────────────────┘
                                              │ Kiểm tra "Mật khẩu"
                                              │ Nếu OK, đổ vào hồ bơi
                                              ▼
                               ┌────────────────────────────────┐
                               │ 🗄️ RAWMARKET (hoặc INTENT DB)│
                               └────────────────────────────────┘
```

---

## 📱 3. Danh Sách Các Màn Hình & Cấu Hình

| # | Thành phần | Mô tả | 
|---|------------|-------|
| 1 | **Docker Config** | Dựng "nhà" cho n8n bằng `docker-compose.yml` (Port 5678, kết nối vào mạng nội bộ của ứng dụng). |
| 2 | **API Webhook** | Xây một cánh cửa `api/crawler/webhook/route.ts` để n8n ném dữ liệu vào. Phải có kiểm tra MẬT KHẨU (`N8N_WEBHOOK_SECRET`). |
| 3 | **n8n Workflow** | Thiết lập trực tiếp trên giao diện của n8n (localhost:5678): Tạo Cron (chuông báo thức) → Fetch trang web → Phân tích dữ liệu → Gửi vào Webhook. |
| 4 | **Admin UI (Phụ)** | Tại tab *"Quản lý Nguồn"*, thêm huy hiệu 🤖 (Badge) cho những nguồn được gắn mác "managed by n8n". |

---

## 🚶 4. Lộ Trình Vận Hành (Data Journey)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  
📍 **HÀNH TRÌNH: Từ Trang Web đến Database (Mỗi 30 phút)**  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  

1️⃣ Đồng hồ n8n điểm giờ (Cron Trigger).  
2️⃣ n8n khởi động trình duyệt ẩn (Puppeteer Node), truy cập trang "ChoTot".  
3️⃣ Đợi JavaScript tải xong trang web, n8n trích xuất 10 tin nhà đất mới nhất.  
4️⃣ n8n đóng gói 10 tin này thành tệp JSON.  
5️⃣ n8n gõ cửa API dự án: `POST localhost:3000/api/crawler/webhook` kèm chìa khóa `Bearer super_secret`.  
6️⃣ API Next.js mở cửa, kiểm tra chìa khóa. OK!  
7️⃣ API nhận 10 tin, so sánh trùng lặp, rồi nhét vào DB (`RawNews` hoặc `Intent`).  
8️⃣ Trả lời n8n: "200 OK, Cảm ơn nhé!"

---

## ✅ 5. Checklist Kiểm Tra Bàn Giao (Acceptance Criteria)

### Tính năng: Hệ thống Cào Dữ Liệu n8n (Phase 06b)

✅ **Cơ Sở Hạ Tầng (DevOps):**
  - [ ] Chạy `docker compose up` thành công, truy cập được giao diện n8n ở cổng 5678.
  - [ ] Thêm biến `N8N_WEBHOOK_SECRET` vào `.env.local`.

✅ **Bảo Mật API:**
  - [ ] Gọi POST `/api/crawler/webhook` KHÔNG có API key → Bị đuổi (401 Unauthorized).
  - [ ] Gọi POST `/api/crawler/webhook` CÓ API key đúng → Được nhận (200 OK) và lưu dữ liệu.

✅ **Thử Nghiệm Thực Tế:**
  - [ ] Một workflow chạy thử trên n8n có thể tự động đẩy data vào database của dự án.
  - [ ] Tắt n8n đi, ứng dụng chính vẫn không bị lỗi (Độc lập module).

---

## 🧪 6. Test Cases (Sẵn sàng cho Testing)

**TC-01: API Key Verification**
- **Given:** Webhook endpoint đang mở.
- **When:** Gửi request chứa mảng data nhưng Header 'Authorization' là sai hoặc trống.
- **Then:** Server đáp trả HTTP 401. Không lưu gì vào DB.

**TC-02: Data Insertion via Webhook**
- **Given:** Cung cấp mảng 2 `RawCrawlItem` hợp lệ và đúng API Key.
- **When:** Webhook nhận đủ dữ liệu.
- **Then:** Phản hồi 200 OK, kèm số logic báo `{ saved: 2, duplicates: 0 }`. Mở DB thấy 2 tin này thật.

---

*Tạo bởi AWF 4.0 - Design Phase*
