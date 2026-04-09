async function testAdminBot() {
  const BUID_URL = 'http://localhost:3000/api/orchestrator';
  console.log('🧪 Bắt đầu kiểm tra Admin Bot API (FACEBOT Orchestrator)...\\n');

  try {
    // 1. Kiểm tra trạng thái hiện tại (GET)
    console.log('1️⃣ Kiểm tra Status:');
    let res = await fetch(`${BUID_URL}?action=status`);
    let data = await res.json();
    if (data.success) {
      console.log(`✅ Status hoạt động. Đang chạy: ${data.data.orchestrator.isRunning}`);
    } else {
      console.error(`❌ Lỗi Status:`, data);
    }

    // 2. Tạo thử 1 bot (POST)
    console.log('\\n2️⃣ Tạo thử 1 bot ngẫu nhiên:');
    res = await fetch(BUID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_bots', count: 1 })
    });
    data = await res.json();
    if (data.success) {
      console.log(`✅ Đã tạo thành công.`);
    } else {
      console.error(`❌ Lỗi tạo bot:`, data);
    }

    // 3. Khởi động Orchestrator (POST)
    console.log('\\n3️⃣ Khởi động Orchestrator (Start):');
    res = await fetch(BUID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    });
    data = await res.json();
    if (data.success) {
      console.log(`✅ Đã Start thành công.`);
    } else {
      console.error(`❌ Lỗi Start:`, data);
    }

    // 4. Báo Bot tự đăng bài (POST)
    console.log('\\n4️⃣ Gọi thủ công kích hoạt Random Post:');
    res = await fetch(BUID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'trigger_random_post' })
    });
    data = await res.json();
    if (data.success) {
      console.log(`✅ Đã kích hoạt 1 Random Post.`);
    } else {
      console.error(`❌ Lỗi Trigger Post:`, data);
    }

    // 5. Kiểm tra Logs / Activities (GET)
    console.log('\\n5️⃣ Kiểm tra xem API Activities có hiện Logs không:');
    res = await fetch(`${BUID_URL}?action=activities&limit=5`);
    data = await res.json();
    if (data.success) {
      console.log(`✅ Có ${data.data.length} activities gần nhất.`);
    } else {
      console.error(`❌ Lỗi lấy Activities:`, data);
    }

    // 6. Dừng Orchestrator (POST)
    console.log('\\n6️⃣ Dừng Orchestrator (Stop):');
    res = await fetch(BUID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' })
    });
    data = await res.json();
    if (data.success) {
      console.log(`✅ Đã Stop thành công.`);
    } else {
      console.error(`❌ Lỗi Stop:`, data);
    }

    console.log('\\n🎉 HOÀN TẤT BÀI TEST CHỨC NĂNG ADMIN BOT!');
  } catch (err) {
    console.error('\\n❌ MÁY CHỦ CHƯA CHẠY HOẶC CÓ LỖI KẾT NỐI:');
    console.log('-> ' + err.message);
    console.log('\\n💡 Lưu ý: Cần chạy npm run dev ở thư mục /app trước khi test nhé!');
  }
}

testAdminBot();
