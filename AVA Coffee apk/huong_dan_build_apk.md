# HƯỚNG DẪN BUILD FILE APK CHO ỨNG DỤNG AVA COFFEE

Tài liệu này hướng dẫn cách build ứng dụng **AVA Coffee** thành ứng dụng Android (`.apk`) có hỗ trợ in nhiệt trực tiếp qua mạng Wi-Fi tới máy in **Zywell ZY908** (hoặc bất kỳ máy in K80 nào có cổng LAN/Wi-Fi).

---

## 1. CƠ CHẾ IN TRỰC TIẾP QUA WIFI (IP / PORT 9100)

Ứng dụng sử dụng gói plugin **Capacitor TCP Client** (`@devioarts/capacitor-tcpclient`) để truyền trực tiếp chuỗi byte lệnh **ESC/POS** qua giao thức TCP Socket tới cổng **9100** của máy in (mặc định IP: `192.168.1.232`).
* **Không qua trung gian:** App gửi trực tiếp dữ liệu thô, máy in sẽ in ngay lập tức.
* **Xử lý tiếng Việt chuẩn K80 (72mm / 48 ký tự):** Tự động loại bỏ dấu tiếng Việt (ví dụ: `"Cà phê sữa đá"` -> `"Ca phe sua da"`) để tránh tình trạng lỗi font chữ / ký tự lạ khi in trên các dòng máy in nhiệt không hỗ trợ Unicode tiếng Việt đầy đủ.
* **Tự động cắt giấy:** Gửi mã lệnh cắt giấy chuẩn ESC/POS (`0x1D 0x56 0x00`) sau khi đẩy giấy ra thêm 4 dòng.

---

## 2. CÁC BƯỚC ĐỂ BUILD FILE APK CHO ANDROID

Do máy tính của bạn hiện tại chưa cài đặt **Android SDK** (bộ công cụ biên dịch Android), bạn cần thực hiện các bước sau để có thể build:

### Bước 1: Cài đặt Android Studio & SDK
1. Tải và cài đặt **Android Studio** tại: [https://developer.android.com/studio](https://developer.android.com/studio)
2. Mở Android Studio sau khi cài đặt. Làm theo các bước thiết lập mặc định (Setup Wizard) để chương trình tự động tải về **Android SDK** và **Build Tools**.
3. Mặc định Android SDK sẽ được tải về thư mục: `C:\Users\<Tên_Máy_Bạn>\AppData\Local\Android\Sdk`.

### Bước 2: Chạy File Auto-Build APK
Chúng tôi đã tạo sẵn cho bạn một kịch bản build tự động có tên là `build_apk.bat` nằm ngay trong thư mục này (`AVA Coffee apk\build_apk.bat`).

1. Bấm đúp chuột (Double click) vào file `build_apk.bat`.
2. File script sẽ tự động thực hiện:
   * Cấu hình JDK 17 (sử dụng Java Runtime đi kèm trong phần mềm IntelliJ IDEA trên máy của bạn).
   * Kiểm tra và nhận diện Android SDK.
   * Chạy lệnh build tĩnh Next.js (`npm run build` xuất ra thư mục `out`).
   * Đồng bộ tài nguyên Web vào Capacitor Android (`npx cap sync android`).
   * Biên dịch ứng dụng thành file APK Debug (`app-debug.apk`).
   * Copy file APK vừa build ra thư mục này và đặt tên là `AVA_Coffee.apk`.

3. Sau khi kết thúc, bạn chỉ cần lấy file `AVA_Coffee.apk` trong thư mục này cài đặt vào điện thoại hoặc máy tính bảng Android.

---

## 3. LƯU Ý KHI SỬ DỤNG
* **Kết nối Wi-Fi:** Thiết bị Android chạy App AVA Coffee **phải kết nối cùng mạng Wi-Fi** nội bộ với máy in hóa đơn (IP máy in mặc định là `192.168.1.232`).
* **Trình duyệt Web:** Nếu chạy thử nghiệm trên trình duyệt Web máy tính (localhost), khi bấm "Gửi Nhà Bếp", app sẽ ghi nhận đơn vào Supabase bình thường và hiển thị log thông tin đơn in ra Console (F12) chứ không gửi kết nối TCP (vì trình duyệt web chặn kết nối socket trực tiếp để bảo mật). Tính năng in chỉ hoạt động thực tế khi chạy bên trong ứng dụng Android (`.apk`).
