import { extractorToPattern, nameAndValuesGlobalPostProcessing, fuzzyRecognize, applyPattern } from 'pattern-flow';

// Nhận tất cả các thông tin cần thiết cho một email chỉ trong 1 dòng 
// Các miền cần thu thập
//
// | kí hiệu | Ý nghĩa          | Ghi chú                  |
// |---------+------------------+--------------------------|
// | @-      | email đến        | fuzzyRegconize, bắt buộc |
// | from-   | email gởi        | fuzzyRegconize           |
// | cc-     | đồng gởi         | fuzzyRegconize, multi    |
// | bc-     | đồng gởi ẩn danh | fuzzyRegconize, multi    |
// | tt-  ;; | nội dung email   | exact                    |
// | at-  ;; | attachment       | exact, multi             |

// Như vậy, có rất nhiều miền cần nhập, nhưng thực ra chỉ có miền email đến là bắt buộc, tất cả còn lại không quan trọng

// Vấn đề trong danh sách này là một emailList, hiện tại không thể lấy emailList đầy đủ được, bởi vì không có ngữ cảnh sử dụng, nên chỉ liệt kê các email mặc định ở đây, khi sử dụng, sẽ phải bổ sung thêm email vào emailList này 

const emailList = [
  "binhthanhgo@gmail.com",
  "drbinhthanh@gmail.com",
  "ringostark@tudu.com"
];

// Cấu hình data Linter cho một email hoàn chỉnh, có thể gởi email ngay trong câu lệnh
export const EmailConfig = {
  nameOfExtractor: "email linter",
  comment: "Các miền cần nhập để tạo thành một email hoàn chỉnh",

  // matchMode toàn cục, là dạng mặc định nếu các regexPatterns không khai báo khác đi
  matchMode: "single",
  regexPatterns: [
    {
      name: "fromEmail",
      matchMode: "single",
      matchPattern: /from-(?<fromEmail>\w+)/,
      defaultMatchValue: "binhthanhgo@gmail.com",
      localPostProcessingFunction: (match) => fuzzyRecognize(match.fromEmail, emailList)
    },
    {
      name: "toEmail",
      matchMode: "multi",
      defaultMatchValue: "",
      matchPattern: /@-(?<toEmail>\w+)/,
      localPostProcessingFunction: (match) => {
        return fuzzyRecognize(match.toEmail, emailList);
      }
    },
    {
      name: "ccEmail",
      matchMode: "multi",
      defaultMatchValue: "",
      matchPattern: /cc-(?<ccEmail>\w+)/,
      // hàm localPostProcessingFunction chỉ xử lý dữ liệu ở 1 lần match được
      localPostProcessingFunction: (match) => {
        return fuzzyRecognize(match.ccEmail, emailList);
      }
    },
    {
      name: "bccEmail",
      matchMode: "multi",
      defaultMatchValue: "",
      matchPattern: /bc-(?<bccEmail>\w+)/,
      localPostProcessingFunction: (match) => {
        return fuzzyRecognize(match.bccEmail, emailList);
      }
    },
    {
      name: "contentEmail",
      matchMode: "single",
      defaultMatchValue: "",
      matchPattern: /tt-(?<contentEmail>..*?);;/,
      localPostProcessingFunction: (thisMatch) => applyPattern("{{contentEmail}}", thisMatch)
    },
    {
      name: "attachmentEmail",
      matchMode: "multi",
      defaultMatchValue: "",
      matchPattern: /at-(?<attachmentEmail>..*?);;/,
      localPostProcessingFunction: (thisMatch) => applyPattern("{{attachmentEmail}}", thisMatch)
    },
  ],

  // Bắt buộc, lấy matchObject làm tham số, tham khảo cấu trúc của matchObject ở \cref{matchobject} [[#matchobject][các phần sau]]
  globalPostProcessingFunction: nameAndValuesGlobalPostProcessing
}