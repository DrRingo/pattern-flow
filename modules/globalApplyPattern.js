/*
  Sau đây là hàm applyPattern nhưng cho matchObject và template nunjucks
  Nó xử lý các lệnh render từ dữ liệu của matchObject vào bên trong template từ nunjucks và xuất ra một hoặc nhiều string là các kết quả của việc áp dụng template này.
  Kết quả nên là một đối tượng JSON và chứa một hoặc nhiều kết quả apply khác nhau

  @param {json} matchObject // Đối tượng JSON trả về trong nội bộ của hàm lintToPattern
  @param {string} template // một template nunjucks đã được thiết kế kĩ. Có các giá trị mặc định khi lỗi.
  @returns {json} một lớp các kết quả trả về từ việc apply pattern

  VẤN ĐỀ BÁO LỖI:
  - Nhiệm vụ validate của globalApplyPattern nên là gì
  - Nó hoạt động ở tầm nào, nên ở mức localPostProcessingFunction hay globalPostProcessingFunction
  - Lỗi trả về nên là gì để tránh gián đoạn các xử lý của các dòng code. Tốt nhất là không có lỗi hoặc bỏ qua lỗi, bởi vì đây là một hàm rất sâu bên dưới, còn rất nhiều lớp hàm ở trên nó nữa. Nếu nó báo lỗi thường xuyên, như vậy các mục đích áp dụng sẽ không thể hoạt động được.
*/
import nunjucks from 'nunjucks';

function render (template, matchObject) {

  return null;

};