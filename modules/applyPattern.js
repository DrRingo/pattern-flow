/* --------- HÀM SỐ APPLY PATTERN --------------------------------- */

// Áp dụng các biến số vào một pattern, có 2 dạng biến số ở đây
// - dạng số, là thứ tự của các biến. Dạng số thường dành cho môi trường localPostProcessingFunction, do các group regex được match lúc này không có tên, và cũng khó để đặt tên cho từng chi tiết.
// - dạng tên name, là tên của từng biến, thuận tiện hơn trong viết và đọc pattern, nhưng cũng mất công đầu tư hơn để viết.
// Lưu ý cách thể hiện của 2 loại biến số này trong pattern,
// - dạng số sẽ có dạng $1, $2....
// - dạng tên sẽ có dạng {{name}}, không có khoảng cách giữa 2 dấu {{ }} và name.
//
// data trong hàm applyPattern là một json có dạng như sau 
// const data = {
//   name: "Ringo",
//   surname: "Stark",
//   job: "doctor"
// }
// đây cũng sẽ là dạng data chuẩn để lưu trữ kết quả match trong dataLinter
//
// Lưu ý: tôi có thể sử dụng thư viện [[https://mustache.github.io/][Mustache]] để làm việc này

// Lưu ý 2: hàm apply pattern này có tác dụng ở nhiều nơi, không chỉ trong bài toán này

// Render các pater dạng số $1, $2... ứng với thứ tự điểm dữ liệu trong data, bắt đầu từ 1
export function numberedPlaceholderRender(pattern, data) {
  const values = Object.values(data);
  return pattern.replace(/\$(\d+)/g, (match, groupName) => {
    const val = values[groupName - 1];
    return (val !== undefined && val !== null) ? val.toString() : match;
  });
};

// Render các pattern dạng name {{name}}
export function namePlaceholderRender(pattern, data) {
  return pattern.replace(/\{\{(\w+)\}\}/g, (match, groupName) => {
    return data[groupName] || match;
  });
};

export default function applyPattern(pattern, data) {
  // Xử lý phần số trước, sau đó tìm các pattern theo tên để thay thế giá trị
  return namePlaceholderRender(numberedPlaceholderRender(pattern, data), data);
}

// const _applyPattern = applyPattern;
// export { _applyPattern as applyPattern };
// Việc có hàm applyPattern sẽ chấm dứt các tính năng pattern cho các matching local, để tập trung xử lý các tác vụ phức tạp hơn nữa.
/* ---------------------------------------------------------------- */
