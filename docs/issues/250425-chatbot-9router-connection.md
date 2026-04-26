# Issue: Chatbot báo "Tổng đài AI đang bận"

**Ngày:** 2026-04-25  
**Môi trường:** Production (`khanhoatoday.com`)  
**Status:** ✅ Đã fix

---

## Triệu chứng

Chatbot NHA.AI hiển thị: _"Xin lỗi, tổng đài AI đang bận. Bạn thử lại sau nhé!"_

Logs trong `can-co_app`:
```
[AI] ❌ 9Router lỗi: Connection error.
[AI] ❌ SimpleVerse lỗi: 401 Invalid API key.
```

---

## Root Cause Analysis

### Lỗi 1: `Connection error` — 9Router không resolve được

**Nguyên nhân:**  
`can-co_app` gọi `9router_app` qua Docker internal hostname (`http://9router_app:20128/v1`).  
Tuy nhiên `9router_app` chỉ ở network `cloudflare-net`, không ở `shared` network — nơi `can-co_app` đang kết nối.

```
can-co_app  → networks: [cancotn, shared]
9router_app → networks: [cloudflare-net]   ← không có shared!
```

**Chẩn đoán:**
```bash
docker inspect 9router_app --format='{{json .NetworkSettings.Networks}}'
# → Chỉ thấy "cloudflare-net", không có "shared"

docker exec can-co_app wget -qO- http://9router_app:20128/v1/models
# → "wget: bad address '9router_app:20128'"
```

**Fix:**
```bash
docker network connect shared 9router_app
```

**Persist vĩnh viễn:**  
Thêm vào docker-compose của `9router_app`:
```yaml
services:
  9router:
    networks:
      - cloudflare-net
      - shared          # ← thêm dòng này

networks:
  shared:
    external: true
```

---

### Lỗi 2: `404 No active credentials for provider: openai`

**Nguyên nhân:**  
Sau khi network fix xong, `9router_app` đã reachable nhưng model được cấu hình (`canco-chatbot`, `cb1-chatbot-opencode`) yêu cầu **OpenAI credentials** bên trong 9Router — credentials này chưa được setup.

**Env lúc lỗi:**
```
AI_PRIMARY_MODEL=canco-chatbot   # ← model cần OpenAI creds
```

**Chẩn đoán — test từng model:**
```bash
docker exec can-co_app wget -qO- \
  --header="Authorization: Bearer <AI_PRIMARY_API_KEY>" \
  --header="Content-Type: application/json" \
  --post-data='{"model":"n8n-agent","messages":[{"role":"user","content":"test"}],"max_tokens":10}' \
  http://9router_app:20128/v1/chat/completions
# → model "n8n-agent" trả về response OK ✅
```

**Fix:**
```bash
sed -i 's/AI_PRIMARY_MODEL=.*/AI_PRIMARY_MODEL=n8n-agent/' /opt/can-co-tn/.env.production

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate app
```

---

### Lỗi 3: `docker compose restart` không reload env vars

**Nguyên nhân:**  
`docker compose restart` không tạo lại container — env vars cũ vẫn còn hiệu lực.

**Fix:**  
Dùng `up --force-recreate` thay vì `restart` khi thay đổi `.env.production`:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate app
```

---

### Lỗi 4: `docker compose restart <service>` → "no such service"

**Nguyên nhân:**  
Nhầm lẫn giữa **service name** và **container name**:
- `app` → service name trong compose file (dùng cho lệnh `docker compose`)
- `can-co_app` → container name (dùng cho `docker exec`, `docker logs`)

**Fix:**
```bash
# ✅ Đúng:
docker compose -f docker-compose.prod.yml restart app

# ❌ Sai:
docker compose -f docker-compose.prod.yml restart can-co_app
```

---

## Tóm tắt fix hoàn chỉnh

| # | Lỗi | Fix |
|---|-----|-----|
| 1 | 9Router không reachable từ can-co_app | `docker network connect shared 9router_app` |
| 2 | Model không có credentials | Đổi `AI_PRIMARY_MODEL=n8n-agent` trong `.env.production` |
| 3 | env vars không được reload | Dùng `up -d --force-recreate` thay vì `restart` |
| 4 | "no such service" | Dùng service name `app`, không phải container name `can-co_app` |

---

## Cấu hình hiện tại (sau fix)

```
AI_PRIMARY_BASE_URL=http://9router_app:20128/v1
AI_PRIMARY_MODEL=n8n-agent
AI_PRIMARY_API_KEY=sk-e68c...
```

## ⚠️ Việc cần làm

- [ ] Persist `shared` network cho `9router_app` vào docker-compose để không mất sau restart
- [ ] Config OpenAI credentials trong 9Router dashboard cho model `canco-chatbot` nếu muốn dùng lại
- [ ] Xóa hoặc để trống `AI_FALLBACK_*` nếu không dùng SimpleVerse
