# Issue: Prisma CLI không chạy được trong Docker runner stage

## Thời gian
- Phát hiện: 2026-04-27
- Hoàn thành: 2026-04-27

## Tóm tắt
`deploy.sh --migrate` thất bại vì runner stage của Dockerfile không có đủ node_modules để chạy Prisma CLI. Runner stage thiết kế chỉ để chạy Next.js standalone build.

## Hiện tượng
3 lỗi tuần tự khi cố chạy prisma migrate trong container:
1. `Cannot find module 'prisma/config'` (npx tải prisma mới, không tìm được config)
2. `no such file: node_modules/.bin/prisma` (binary không tồn tại trong runner)
3. `Cannot find module 'effect'` (copy prisma package → thiếu dependency chain: `prisma` → `@prisma/config` → `effect`)

## Nguyên nhân gốc
Dockerfile là multi-stage build:
- **Builder stage**: có ĐẦY ĐỦ node_modules (build app ở đây)
- **Runner stage**: chỉ copy standalone output + `.prisma` (client runtime)

Runner **không có và không thể có** prisma CLI vì dependency chain quá lớn.

## Cách xử lý
Dùng builder stage làm temp container để chạy `prisma db push`:

```bash
# deploy.sh — build temp container từ builder target
docker build --target builder -t cancotn-migrator -f app/Dockerfile app/ -q
docker run --rm --network cancotn \
  -e DATABASE_URL="$DATABASE_URL" \
  cancotn-migrator npx prisma db push --skip-generate
```

Builder image đã được build sẵn (Docker cache), nên step này gần như instant.

## File đã thay đổi
- `app/Dockerfile` — reverted về original (không copy prisma CLI vào runner)
- `deploy.sh` — sử dụng builder stage temp container thay vì docker exec

## Phòng ngừa
- **Không copy prisma CLI** vào runner stage
- Migration luôn chạy qua builder stage temp container
- Nếu cần `prisma migrate deploy` (thay `db push`), chỉ cần đổi command trong deploy.sh

## Tags
`debug`, `docker`, `prisma`, `deploy`
