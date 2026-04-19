// Route /can-co đã được tắt. Redirect về trang chủ.
// Để bật lại: xóa file này
import { redirect } from 'next/navigation';

export default function CanCoDisabledPage() {
  redirect('/');
}
