# Issue: Prisma CLI không chạy được trong Docker runner stage

## Thời gian
- Phát hiện: 2026-04-27 ~12:20
- Hoàn thành: 2026-04-27 ~15:40

## Tóm tắt
`deploy.sh --migrate` thất bại qua nhiều vòng lặp vì runner stage của Dockerfile (multi-stage build) không có Prisma CLI — chỉ có Prisma **client** runtime. Giải pháp cuối cùng là dùng **builder stage** (có full `node_modules`) làm temp container để chạy `prisma db push`.

## Hiện tượng
Chạy `./deploy.sh --migrate` trên VPS → migration thất bại với nhiều lỗi khác nhau.

## Chuỗi lỗi (theo thứ tự xảy ra)

### Lỗi 1 — `npx prisma` tải bản mới, không tìm được config
```
Failed to load config file "/app/prisma.config.ts"
Error: Cannot find module 'prisma/config'
```
**Nguyên nhân:** `npx prisma` bên trong container tải Prisma mới từ npm registry (không có project's `node_modules` context).

### Lỗi 2 — Copy `.bin/prisma` nhưng không tồn tại
```
OCI runtime exec failed: exec: "node_modules/.bin/prisma": no such file or directory
```
**Nguyên nhân:** Runner stage không có `.bin/prisma` — Dockerfile không copy nó.

### Lỗi 3 — Copy `.bin/prisma` OK nhưng thiếu `.wasm`
```
Error: ENOENT: no such file or directory
  '/app/node_modules/.bin/prisma_schema_build_bg.wasm'
```
**Nguyên nhân:** `.bin/prisma` khi copy vào `.bin/` có `__dirname` = `/app/node_modules/.bin/` → tìm wasm sai chỗ. Wasm thật ở trong `node_modules/prisma/build/`.

### Lỗi 4 — Copy `node_modules/prisma` OK nhưng thiếu `effect`
```
Error: Cannot find module 'effect'
Require stack: @prisma/config/dist/index.js → prisma/build/index.js
```
**Nguyên nhân:** Prisma CLI có dependency chain dài: `prisma` → `@prisma/config` → `effect` → ... Runner không có các package này.

### Lỗi 5 — Builder stage approach hoạt động nhưng flag sai
```
! unknown or unexpected option: --skip-generate
```
**Nguyên nhân:** Prisma 7.x đã bỏ flag `--skip-generate` khỏi `db push`.

## Nguyên nhân gốc

Multi-stage Dockerfile tách `builder` (full deps) và `runner` (minimal — chỉ standalone + prisma client). Runner **không thể** chạy Prisma CLI vì thiếu toàn bộ dependency chain. Không có cách nào copy "một phần" CLI mà hoạt động được.

## Giải pháp cuối cùng

Dùng **builder stage** làm temp container để chạy migration — builder đã có full `node_modules`, chỉ cần pass `DATABASE_URL` và kết nối vào network `cancotn`:

```bash
# deploy.sh -- section migrate
docker build --target builder -t cancotn-migrator -f app/Dockerfile app/ -q
docker run --rm \
  --network cancotn \
  -e DATABASE_URL="$DATABASE_URL" \
  -e DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}" \
  cancotn-migrator \
  npx prisma db push --accept-data-loss
```

> **Tại sao builder build nhanh?** Docker cache — builder stage không thay đổi nếu code không đổi → gần như instant.

## Files đã thay đổi

| File | Thay đổi |
|------|---------|
| `deploy.sh` | Migrate section → dùng builder temp container |
| `app/Dockerfile` | Reverted về original (bỏ các COPY prisma CLI thất bại) |

## Commits liên quan
- `fde9ad3` — copy prisma CLI (failed attempt)
- `8996a11` — dùng `node prisma/build/index.js` (failed, missing `effect`)
- `46e0d26` — revert Dockerfile, dùng builder temp container ✅

## Cách kiểm tra lại
```bash
# Trên VPS
./deploy.sh --migrate
# → "✓ Database schema synced"
```

## Phòng ngừa

- **Không copy prisma CLI** vào runner stage — sẽ luôn thiếu dependency
- Migration luôn chạy qua builder stage temp container
- Prisma 7.x: dùng `npx prisma db push --accept-data-loss` (không có `--skip-generate`)

## Tags
`debug`, `docker`, `prisma`, `deploy`, `multi-stage-build`
