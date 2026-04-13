# 🎨 DESIGN: Phase 07 - Integration Testing (E2E)

Ngày tạo: 2026-04-13
Dựa trên: `phase-07-testing.md`

Tài liệu này đóng vai trò kịch bản kiểm thử tĩnh (Test Specification) thay vì là thiết kế kiến trúc phần mềm, vì Phase 07 là quá trình **Integration Testing** nhằm củng cố tính toàn vẹn của dữ liệu sau đợt Bot Revamp.

---

## 1. Dữ liệu tham gia Kiểm Thử (Database Context)

Không có thay đổi về thiết kế bảng, nhưng Phase 07 sẽ xác thực vòng đời dữ liệu chảy qua 5 bảng cốt lõi:

```mermaid
graph TD
    A[CrawlSource (RSS/n8n)] -->|Crawl| B(RawNews)
    B -->|Curate| C{Intents}
    C -->|Aggregate| D[MarketReport]
    D -->|Inject Context| E((AIChatMessage))
    C -->|Trigger Comment| F((IntentComment))
    
    style B fill:#f9f,stroke:#333,stroke-width:2px
```

**Nguyên tắc vàng:** "Bot không bịa. Mỗi bài đăng phải có nguồn." Mọc ra rào cản kiểm định ở bảng `Intents` (`source_url` phải NOT NULL nếu `is_bot = true`).

---

## 2. Các điểm cần kiểm định (Test Boundary)

Vì đây là integration test, không có thiết kế giao diện UI. Chuyên tâm vào **Flows APIs & Khối Backend**:
1. Thử nghiệm **Web Crawler** (Tóm tin)
2. Thử nghiệm **Curator Bot** (Tuyển tin)
3. Thử nghiệm **Analyst Bot** (Báo cáo)
4. Thử nghiệm **Global Chatbot NHA.AI** (Tiếp khách)
5. Thử nghiệm **FACEBOT Comment** (Giữ lửa)

---

## 3. Luồng Hoạt Động Cốt Lõi (User/Bot Journey)

Hành trình Full-Pipeline E2E Kiểm Thử:

1️⃣ **Crawl:** Chạy script test gọi API crawler để kéo dữ liệu từ source (ví dụ: cafeland.vn RSS).
2️⃣ **Curate:** Khởi chạy Curate logic, gắp RawNews chuyển thể thành Intent (Cần/Có).
3️⃣ **Analyze:** Chạy AnalystBot tổng hợp số liệu avg/count từ các Intent vừa tạo, sinh ra MarketReport.
4️⃣ **Comment:** Chạy Orchestrator để ra lệnh cho FACEBOT thả bình luận mồi trên các Intent mới.
5️⃣ **Chatting:** Giả lập 1 User hỏi Chatbot NHA.AI xem nó có gọi MarketReport ra trả lời đúng số liệu hay ko.

---

## 4. Test Cases Design (SDD Compliance)

Đây là Test Cases sẽ được quy chuẩn hoá vào file script `test-bot-revamp.ts`.

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### TC-01: Crawl & Curate (Full Pipeline Core)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** DB sạch (không có RawNews/MarketReport cặn), có sắn 1 CrawlSource RSS hợp lệ.
**When:** Gọi hàm `crawler.crawlAll()` sau đó gọi `curator.processUnprocessedNews()`.
**Then:** 
✓ `RawNews` tăng lên.
✓ Tạo ra tối thiểu 1 `Intent`.
✓ Check SQL: Không có Intent nào do bot đăng mà `source_url` bị `NULL`.

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### TC-02: Analyst Bot Report Generation
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** (Tiếp nối TC-01) Đã có n records Intents mới trong DB.
**When:** Gọi `triggerAnalystReportDaily()`.
**Then:**
✓ Sinh ra đúng 1 `MarketReport` cho ngày hôm nay.
✓ Text trong MarketReport có chứa dữ kiện tính toán (avg price).

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### TC-03: Chatbot Context Injection
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** (Tiếp nối TC-02) Đã có MarketReport. User đăng nhập hợp lệ.
**When:** Gửi request `POST /api/chat` hỏi câu liên quan đến giá thị trường.
**Then:**
✓ API trả về HTTP 200.
✓ Message phản hồi của Bot có dấu hiệu tham chiếu số liệu (khó test auto hoàn toàn, nhưng có thể map regex).
✓ Khởi tạo record `AIChatMessage` trong DB thành công.

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### TC-04: Bot Schedule Validation
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** Set thông số `scheduleConfig.activeHours = []` (Vô hiệu giờ chạy).
**When:** Gọi hàm trigger Comment từ Orchestrator.
**Then:**
✓ Hàm trả về từ chối thực thi báo lỗi "Ngoài giờ làm việc".
✓ Không có IntentComment mới được tạo.

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### TC-05: System Regression (Tương Thích Ngược)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Given:** Web App đang chạy.
**When:** Fetch API `/api/feed?sort=hot`.
**Then:**
✓ Trả về mảng intents.
✓ Logic Referral/Boost point không bị phá vỡ.


---

## 5. Checklist Kiểm Tra & Bàn Giao

### Tính năng: Integration Test Runner (`scripts/test-bot-revamp.ts`)
SPECS Reference: Phase 07

- [ ] Tích hợp chạy xuyên suốt 5 TC.
- [ ] Cleanup dữ liệu sau khi chạy hoặc dùng Transaction Rollback an toàn.
- [ ] Báo cáo Console xanh toàn tập (Pass).
- [ ] Export SQL check output `No Intent left without sourceUrl` ra console.
