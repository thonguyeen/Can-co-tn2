# 💡 BRIEF: Bot System Revamp — Từ "Máy Bịa" Sang "Máy Thu Thập Thật"

> **Nguyên tắc thiết kế:** Category-Agnostic — Kiến trúc bot phải hoạt động cho BẤT KỲ ngành nào (BĐS, tuyển dụng, mua bán, rao vặt). Thêm ngành mới = tạo bot mới + paste prompt. Không sửa code.

**Ngày tạo:** 2026-04-11
**Brainstorm cùng:** Tech Lead Checkpoint + Owner

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Hệ thống Bot hiện tại (9 bot FACEBOT + 5 Envoy Bot) đang dùng LLM để **tự sáng tạo nội dung từ trí tưởng tượng**. Điều này dẫn đến:
- Nội dung không đáng tin cậy (fake data, không có nguồn)
- Không phù hợp với nền tảng BĐS cần dữ liệu thật
- Chi phí AI cao do gọi LLM liên tục cho mọi thao tác
- Các topic bài viết cứng, generic (AI, Crypto, Esports...) — không liên quan BĐS

## 2. GIẢI PHÁP ĐỀ XUẤT

**Chuyển đổi toàn bộ hệ thống Bot sang mô hình "Data-First":**
- Bot KHÔNG tự BỊA nội dung. Mọi bài đăng phải có nguồn dữ liệu thật từ bên ngoài.
- LLM chỉ được dùng để: parse/chuẩn hóa dữ liệu thô, phân tích/tổng hợp dữ liệu thật, bình luận trên dữ liệu thật.
- Mỗi bài đăng CẦN/CÓ luôn kèm link nguồn gốc.

**Tích hợp Global Chatbot (NHA.AI):**
- Trở thành "The Interface" (Giao diện Tương tác) của hệ thống bot ngầm.
- Đọc được báo cáo từ Analyst Bot để trả lời.
- Trở thành "Trợ lý cá nhân hóa" với khả năng NHỚ user và lưu trữ lịch sử qua từng phiên (Persistence & Memory).

## 3. ĐỐI TƯỢNG SỬ DỤNG

- **Primary:** Người mua/bán/thuê BĐS cần nguồn tin tổng hợp đáng tin cậy
- **Secondary:** Admin quản lý và cấu hình hệ thống bot

## 4. KIẾN TRÚC BOT MỚI

### 5 Loại Bot Chức Năng:

| Loại | Vai trò | Dùng LLM? |
|------|---------|-----------|
| 🕷️ **Crawler Bot** | Cào dữ liệu từ web + Facebook Groups | ❌ Không |
| 📋 **Curator Bot** | Parse dữ liệu thô → Intent CẦN/CÓ có cấu trúc. **Parse schema theo category** (BĐS: giá/diện tích/quận; Tuyển dụng: lương/vị trí/kinh nghiệm; Rao vặt: giá/tình trạng/loại). Schema nằm trong System Prompt, Admin tự chỉnh. | ✅ Chỉ parse/clean |
| 📊 **Analyst Bot** | TẠO BÁO CÁO tự động từ dữ liệu thật. **Report template theo category** (BĐS: giá TB/xu hướng; Tuyển dụng: lương TB/ngành hot; Rao vặt: mặt hàng phổ biến). Template nằm trong Knowledge Text. | ✅ Chỉ tổng hợp data thật |
| 🔔 **Alert Bot** | Thông báo user khi có tin khớp nhu cầu | ❌ Không (logic matching) |
| 💬 **Global Chatbot** | (NHA.AI) Giao tiếp với user trên app. Đọc DB từ Analyst Bot để trả lời có dẫn chứng số liệu. Ghi nhớ lịch sử người dùng và điều chỉnh phản hồi theo category. | ✅ Tương tác 2 chiều |

### Bot FACEBOT cũ (9 bot):
- **GIỮ LẠI** tất cả nhưng **CHUYỂN ĐỔI VAI TRÒ**:
  - ❌ Không còn tự tạo bài viết (post)
  - ✅ Chỉ bình luận/thảo luận trên các tin CẦN/CÓ đã được crawl
  - ✅ Phản ứng với báo cáo thị trường từ Analyst Bot
  - ✅ Tranh luận với nhau dựa trên dữ liệu thật
  - Ví dụ: Tin CÓ "Căn hộ 3PN Quận 7 giá 4.5 tỷ" → @mai_finance comment: "Giá này hợp lý so với mặt bằng chung khu vực, risk/reward ratio tốt"

### Bot Assignment mở rộng:
- Hiện tại: Gán bot theo **khu vực** (Quận 7, Cầu Giấy...)
- Mở rộng: Gán bot theo **khu vực + category** (BĐS Q7, Tuyển dụng IT toàn quốc...)
- Field `assignedCategories` trong schema Bot **đã có sẵn** → chỉ cần dùng đúng.
- Ví dụ:
  ```
  Bot A → Quận 7, category: ["real_estate"]
  Bot B → Toàn quốc, category: ["recruitment"], subcategory: IT
  Bot C → TP.HCM, category: ["marketplace", "classifieds"]
  ```

## 5. NGUỒN DỮ LIỆU

### Ưu tiên cào cả 2 nguồn đồng thời:

#### A. Trang web BĐS:
| Nguồn | Loại | Ưu tiên |
|-------|------|---------|
| batdongsan.com.vn | HTML scraping / RSS | Cao |
| alonhadat.com.vn | HTML scraping | Cao |
| chotot.com (BĐS) | API / Scraping | Cao |
| nhadat247.com.vn | HTML scraping | Trung bình |
| cafeland.vn (tin tức) | RSS | Trung bình |
| vnexpress.net/bat-dong-san | RSS | Thấp |

#### B. Facebook Groups:
| Nguồn | Cách tiếp cận | Ưu tiên |
|-------|--------------|---------|
| Groups BĐS theo quận/huyện | Facebook Graph API hoặc Scraping tool | Cao |
| Groups phòng trọ/nhà thuê | Facebook Graph API | Trung bình |
| Pages môi giới BĐS | Facebook Page Feed API | Thấp |

## 6. LUỒNG DỮ LIỆU

```
NGUỒN NGOÀI                      HỆ THỐNG CẦN & CÓ
────────────                      ──────────────────

Web BĐS ────┐
             ├── Crawler Bot ──► RawNews (DB)
FB Groups ──┘    [Lịch: 1-2h]       │
                                     ▼
                              Curator Bot (LLM parse)
                                     │
                                     ▼
                              Intents CẦN/CÓ (DB)
                              + source_url bắt buộc
                                  │         │
                                  ▼         ▼
                          Analyst Bot    Alert Bot
                          (Báo cáo       (Notify
                           tuần/ngày)     user)
                               │
                               ▼
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼                     
 FACEBOT Bots                                GLOBAL CHATBOT (NHA.AI)
 (Bình luận trên                             (Truy vấn DB Analyst Bot,
  báo cáo + tin)                              trả lời User, nhớ DB History)
```

## 7. TÍNH NĂNG

### 🚀 MVP (Bắt buộc có):
- [ ] **Crawler Bot mở rộng** — Thêm nguồn web BĐS mới (batdongsan, alonhadat, chotot)
- [ ] **Facebook Crawler** — Cào dữ liệu từ Facebook Groups BĐS
- [ ] **Curator Bot** — LLM parse dữ liệu thô → Intent CẦN/CÓ có cấu trúc + source_url bắt buộc
- [ ] **Schedule Bot** — Lịch hoạt động cho từng bot (giờ làm việc, tần suất, ngày nghỉ)
- [ ] **System Prompt Editor** — Admin chỉnh system prompt từ giao diện (field DB đã có)
- [ ] **Knowledge Text** — Admin paste kiến thức tham khảo cho bot (bảng giá, quy hoạch khu vực)
- [ ] **FACEBOT chuyển vai** — Bot cũ chỉ bình luận, không tự tạo bài
- [ ] **Analyst Bot** — Tạo báo cáo thị trường tự động từ dữ liệu crawl thật
- [ ] **Global Chatbot Memory (NHA.AI)** — Thêm record Bot riêng cho NHA.AI trong DB. Thêm model `AIChatMessage` lưu history. `GET /api/chat/history` logic load history.
- [ ] **Context-aware Chatbot** — Bơm ngữ cảnh lịch sử + data từ `MarketReports` (của Analyst Bot) vào prompt trước khi gọi AI để tư vấn cho User.

### 🎁 Phase 2 (Làm sau):
- [ ] **Alert Bot** — Thông báo user khi có tin khớp nhu cầu CẦN
- [ ] **Anti-duplicate nâng cao** — So sánh nội dung tương tự cross-source
- [ ] **Tin giả detection** — AI phát hiện tin lừa đảo/giả mạo
- [ ] **Zalo Groups crawler** — Nếu có API

### 💭 Backlog:
- [ ] **User tự tạo bot** — Mỗi user có bot riêng với knowledge base riêng
- [ ] **RAG cho bot** — Khi codebase data đủ lớn, bật vector search

## 8. ƯỚC TÍNH SƠ BỘ

| Module | Độ phức tạp | Thời gian |
|--------|------------|-----------|
| Crawler mở rộng (web BĐS) | 🟡 Trung bình | 2-3 ngày |
| Facebook Crawler | 🔴 Khó (API restrictions) | 3-5 ngày |
| Curator Bot (LLM parse) | 🟡 Trung bình (đã có nền) | 1-2 ngày |
| Schedule System | 🟢 Dễ | 1 ngày |
| System Prompt + Knowledge Editor | 🟢 Dễ | 1 ngày |
| FACEBOT chuyển vai | 🟡 Trung bình (refactor orchestrator) | 1-2 ngày |
| Analyst Bot (báo cáo tự động) | 🟡 Trung bình | 2-3 ngày |
| Global Chatbot Personalization | 🟡 Trung bình | 2 ngày |

**Tổng ước tính: ~2.5 - 3.5 tuần**

## 9. RỦI RO

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Facebook chặn scraping | Cao | Dùng official Graph API, tuân thủ rate limit |
| Web BĐS thay đổi HTML structure | Trung bình | Viết adapter pattern, dễ update selector |
| Chi phí LLM cho parse | Thấp | Parse chỉ cần model rẻ (gpt-4o-mini), không cần model mạnh |
| Dữ liệu trùng lặp cross-source | Trung bình | Check duplicate bằng URL + content hash |

## 10. NGUYÊN TẮC VÀNG

> **"Bot không bịa. Bot chỉ thu thập, chuẩn hóa, và phân tích dữ liệu thật. Mỗi bài đăng phải có nguồn."**

> **"Category-Agnostic. Thêm ngành mới = tạo bot mới + paste prompt/knowledge. Không sửa code."**

## 11. MỞ RỘNG ĐA NGÀNH (Thiết kế sẵn, triển khai sau)

| Ngành | Category ID | Parse Schema | Nguồn cào tiềm năng |
|-------|-------------|-------------|---------------------|
| 🏠 BĐS | `real_estate` | giá, diện tích, quận, loại BĐS, hướng | batdongsan, alonhadat, chotot, FB Groups |
| 💼 Tuyển dụng | `recruitment` | lương, vị trí, kinh nghiệm, công ty | vietnamworks, topcv, FB Groups HR |
| 🛒 Mua bán | `marketplace` | giá, tình trạng, loại sản phẩm | chotot, FB Marketplace |
| 📋 Rao vặt | `classifieds` | giá, mô tả, liên hệ | chotot, raovat.vn, FB Groups |
| 🚗 Xe cộ | `vehicles` | giá, hãng, đời xe, km | bonbanh, chotot, FB Groups |

**Để thêm 1 ngành mới, Admin chỉ cần:**
1. Tạo CrawlSource mới với `category = "recruitment"` + URL nguồn
2. Tạo Curator Bot mới → paste System Prompt hướng dẫn parse schema cho ngành đó
3. Tạo Analyst Bot mới → paste Knowledge Text + Report template
4. Xong — bot sẽ tự crawl, parse, tạo báo cáo cho ngành mới.

## 12. BƯỚC TIẾP THEO
→ Chạy `/plan` để thiết kế chi tiết từng module
