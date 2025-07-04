import os

# Đường dẫn tới thư mục chứa các file cần đổi đuôi
root_dir = "d:/Github/Warehouse-Management-System/front-end/src/"

# Hàm để duyệt qua tất cả các file trong thư mục và đổi đuôi .js thành .jsx
def rename_js_to_jsx(directory):
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            # Nếu file có đuôi .js, ta sẽ đổi tên file
            if filename.endswith(".js"):
                # Tạo đường dẫn mới với đuôi .jsx
                old_path = os.path.join(dirpath, filename)
                new_path = os.path.join(dirpath, filename.replace(".js", ".jsx"))
                # Đổi tên file
                os.rename(old_path, new_path)
                print(f"Đổi tên file: {old_path} thành {new_path}")

# Gọi hàm để đổi tên các file trong thư mục
rename_js_to_jsx(root_dir)
