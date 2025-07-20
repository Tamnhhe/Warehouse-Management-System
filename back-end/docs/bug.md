Product:Sai, Thiếu xót
Tạo sản phẩm:Tạo kệ bên trong tạo sản phẩm,tạo danh mục bên trong tạo sản phẩm,(Chọn kho và nhập tồn kho cho từng kho: => chọn kệ và nhập tồn kho), kiểm tra kệ có đủ dung tích chứa hay không trước khi nhập, và tất cả các vị trí đặt sản phẩm tối đa sẽ bằng total stock, và thường thì là chọn kệ là sẽ đẩy hết total stock hiện tại

Thêm 1 trường ngưỡng tồn kho(để nếu sản phẩm thấp dưới mức này sẽ cần nhập),

Hình ảnh khi tạo sản phẩm là không bắt buộc,

Có thể thêm supplier ngay bên trong tạo sản phẩm

Tất cả các phần thêm bên trong tạo sản phẩm đều là modal hiển thị và có nút x

Xem danh sách sản phẩm:thêm bộ lọc filter bên gocs bên phải để chỉnh những gì muốn xem trong danh sách: tất cả bao gồm, hình ảnh, tên sản phẩm,đơn vị, nhà cung cấp, kệ, danh mục, trạng thái,

Update sản phẩm: danh mục cũng được tạo bên trong cập nhật sản phẩm,

Chọn kho và nhập tồn kho cho từng kho: => chọn kệ và nhập tồn kho, khi sửa đổi kệ khi cập nhật, phải chắc chắn số lượng cập nhật bằng với total stock chứ không được hơn hoặc thiếu

Quản lý kệ hàng:

các trường thông tin:

tên kệ(vị trí)

danh mục

sản phẩm

max quantiative

currentQuantitative tính tổng số lượng product có trong kệ

Kệ sẽ hiển thị các sản phẩm có bên trong kệ bằng mối quan hệ kệ và sản phẩm, và khi tạo kệ bỏ phần cân năng tối đa, và phần kệ này nếu nhập hàng thì sẽ được cộng vào kệ còn trống cũ của sản phẩm, và nếu kệ đó không còn đủ chỗ trống để lưu sản phẩm thì sẽ đẩy sản phẩm mới số còn lại sang kệ cùng danh mục, nếu số lượng quá lớn mà tất cả các kệ cùng danh mục không thể đáp ứng sẽ không cho phép nhập, khi xuất hàng sẽ xuất hàng từ kệ đầu tiên mà sản phẩm được add vào.

Kiểm kê: Kiểm kê cho phép chọn nhiều kệ để kiểm kê 1 lúc và sẽ lấy ra các sản phẩm muốn kiểm ở kệ đó, rồi lấy số lượng sản phẩm có chính xác trong kệ để kiểm kê

ví dụ trường hợp 1 : Sản phẩm a có 100 sản phẩm và lưu ở 2 kệ là kệ 2 80 sản phẩm và kệ 3 20 sản phẩm, thì kếu kiểm kê kệ 1 sẽ chỉ hiện thị số 80 và nếu điều chỉnh sửa lại thành 60 thì ở bên kệ sẽ còn 60 cho sản phẩm đó và trong sản phẩm ở danh sách sản phẩm sẽ chỉ còn 80 sản phẩm(=60 sp kệ 2 và 20 sản phẩm kệ 3),

xuất hàng, nếu xuất sản phẩm có trong nhiều kệ thì sẽ xuất từ kệ đầu tiên đến kệ cuối cùng theo số lượng sản phẩm

ví dụ có 100sp bột, mà để ở lần lượt 3 kệ là kệ 1 25, kệ 2 35, kệ 3 40 thì khi xuất 50 sản phẩm sẽ trừ 25 ở kệ 1 và trừ tiếp 25 ở kệ 2.
