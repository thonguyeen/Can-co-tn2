# Phase 03: Smoke Test & n8n Connect
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Verify toàn bộ pipeline hoạt động: web, auth, feed, webhook, n8n internal network.

## Implementation Steps

### 1. Web Smoke Test
- [ ] Mở browser → `https://cancotn.com` → trang chủ load OK
- [ ] Feed hiển thị intents
- [ ] Click vào 1 intent → detail page load
- [ ] Map load đúng (Leaflet tiles)
- [ ] Mobile responsive OK

### 2. Auth Test
- [ ] Đăng nhập / đăng ký hoạt động
- [ ] Auth gate modal hiện khi guest click "Quan tâm"
- [ ] Profile page load sau khi đăng nhập

### 3. n8n Webhook Internal Test
- [ ] Từ VPS SSH: `docker exec n8n_app wget -qO- http://can-co_app:4000/api/webhook/n8n-intents` → verify connection
- [ ] Đổi URL webhook trong n8n workflow: `http://can-co_app:4000/api/webhook/n8n-intents`
- [ ] Test push 1 bài từ n8n → verify intent xuất hiện trên feed
- [ ] Confirm latency < 10ms (Docker internal)

### 4. Deploy Update Test (zero-downtime)
- [ ] Sửa 1 dòng code nhỏ (VD: thêm comment)
- [ ] Commit + push
- [ ] SSH vào VPS → chạy `./deploy.sh`
- [ ] Verify web vẫn truy cập được trong lúc build
- [ ] Verify thay đổi hiển thị sau khi deploy xong

## Test Criteria
- [ ] Tất cả test trên PASS
- [ ] n8n webhook call internal < 10ms
- [ ] Deploy update không gây lỗi trang web
