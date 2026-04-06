# Phase 02: AI Tuning (JSON Parser Optimization)
Status: ✅ Complete
Dependencies: None

## Objective
Cải thiện tỷ lệ đọc tin tức và trích xuất Intents chuẩn xác từ AI lên hơn 90%.

## Requirements
### Functional
- [x] Phát hiện JSON bị cắt đứt hoặc sai cú pháp (unterminated string, missing bracket...).
- [x] Tự động validate bằng Zod schema xem có đủ các trường required không.
- [x] Nếu lỗi, Reprompt lại AI: "Dữ liệu bị lỗi cú pháp XYZ, xin hãy trả về JSON chuẩn".

## Implementation Steps
1. [x] Hàm `chatWithJSON` (hoặc tương đương) tự động bắt lỗi `JSON.parse` và ném exception.
2. [x] Có loop chạy lại request nội bộ (max `2` lần) khi exception xảy ra.
3. [x] Tinh chỉnh prompt: "TRẢ LỜI BẰNG JSON HỢP LỆ. KHÔNG BAO GỒM VĂN BẢN NÀO KHÁC BÊN NGOÀI."

## Files to Create/Modify
- `d:/SW/Can-co-tn/app/lib/ai/client.ts`
- `d:/SW/Can-co-tn/app/lib/openclaw/orchestrator.ts`

## Next Phase: phase-03-automation.md
