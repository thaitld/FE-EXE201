## 🎯 Hệ Thống Đăng Nhập & Admin Dashboard

### Tính Năng Mới

#### 1. **Xác Thực Đăng Nhập (Authentication)**
- Tạo context `AuthContext` để quản lý trạng thái đăng nhập
- Lưu thông tin người dùng vào `localStorage`
- Bảo vệ các trang yêu cầu xác thực

#### 2. **Trang Admin Dashboard**
Trang admin hiển thị:
- **Thống kê**: Tổng số người dùng, phiên hoạt động, mức độ tham gia, trạng thái hệ thống
- **Danh sách người dùng gần đây**: Trạng thái hoạt động của người dùng
- **Trạng thái hệ thống**: Kiểm tra API, Database, CDN

#### 3. **Chuyển Hướng Tự Động**
- Sau khi đăng nhập thành công, hiển thị loading animation
- Tự động chuyển hướng đến trang Admin sau ~1.5 giây
- Nếu không chuyển hướng tự động, có link thủ công

### 🛣️ Luồng Điều Hướng

```
Trang Chủ (#/)
    ↓
Đăng Nhập (#/login)
    ↓ (Thành công)
Loading Screen → Redirect
    ↓ (After 1.5s)
Admin Dashboard (#/admin)
    ↓ (Logout)
Trang Chủ (#/)
```

### 🔐 Bảo Vệ Route

- **Admin** (`#/admin`) được bảo vệ - chỉ người dùng đã đăng nhập mới có thể truy cập
- Nếu truy cập trực tiếp mà chưa đăng nhập → Tự động chuyển hướng đến trang đăng nhập

### 📁 Cấu Trúc File Mới

```
src/
├── contexts/
│   └── AuthContext.tsx          # Quản lý xác thực
├── pages/
│   ├── Login.tsx                # Trang đăng nhập (cập nhật)
│   ├── Admin.tsx                # Trang Admin dashboard (mới)
│   ├── Homepage.tsx
│   └── Register.tsx
├── components/
│   └── ui/
│       └── button.tsx           # Shadcn Button component
├── lib/
│   └── utils.ts                 # Utility functions
└── App.tsx                      # Router (cập nhật)
```

### 🚀 Sử Dụng

#### Đăng Nhập
1. Click "Sign in" trên trang Login
2. Nhập email bất kỳ (e.g., `demo@example.com`)
3. Nhập password bất kỳ
4. Click "Sign in"
5. Chờ loading → Tự động chuyển hướng đến Admin

#### Đăng Xuất
1. Click nút "Logout" ở góc trên phải của Admin
2. Quay lại trang chủ

#### Truy Cập Trực Tiếp
- Đã đăng nhập: Truy cập `#/admin` bình thường
- Chưa đăng nhập: Tự động redirect về `#/login`

### 🎨 Styling

- Sử dụng **Tailwind CSS** cho phong cách hiện đại
- Sử dụng **Shadcn/ui** components cho giao diện nhất quán
- Dark theme với gradient backgrounds
- Responsive design cho tất cả thiết bị

### 💾 Lưu Trữ Dữ Liệu

- Token xác thực lưu trong `localStorage` (key: `auth_token`)
- Email người dùng lưu trong `localStorage` (key: `user_email`)
- Dữ liệu tự động xóa khi đăng xuất

### 📝 Ghi Chú

- Hiện tại sử dụng mock authentication (không có backend thực)
- Có thể thay thế bằng API thực khi có sẵn
- Tất cả dữ liệu trên Admin dashboard là mock data
