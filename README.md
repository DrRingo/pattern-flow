# PatternFlow

[![NPM Version](https://img.shields.io/npm/v/pattern-flow.svg?style=flat)](https://www.npmjs.com/package/pattern-flow)
[![Build Status](https://img.shields.io/travis/com/your-username/pattern-flow.svg)](https://travis-ci.com/your-username/pattern-flow)

**PatternFlow** là một công cụ linh hoạt, dựa trên cấu hình để trích xuất, xử lý và định dạng dữ liệu từ văn bản thô. Hãy xem nó như một framework nhỏ để "phân tích" hoặc "sàng lọc" dữ liệu theo các quy tắc bạn tự định nghĩa.

---

## Mục lục

- [Tại sao lại cần PatternFlow?](#tại-sao-lại-cần-patternflow)
- [Cài đặt](#cài-đặt)
- [Cách hoạt động](#cách-hoạt-động)
- [Ví dụ](#ví-dụ)
  - [Ví dụ 1: Tạo Mục lục cho file Org-mode](#ví-dụ-1-tạo-mục-lục-cho-file-org-mode)
  - [Ví dụ 2: Phân tích cú pháp Email từ dòng lệnh](#ví-dụ-2-phân-tích-cú-pháp-email-từ-dòng-lệnh)
- [Lộ trình phát triển](#lộ-trình-phát-triển)
- [Đóng góp](#đóng-góp)

## Tại sao lại cần PatternFlow?

Trong công việc hàng ngày, chúng ta thường xuyên phải xử lý các tác vụ lặp đi lặp lại: lấy một thông tin cụ thể từ file log, trích xuất các đầu mục trong một file ghi chú, hay phân tích dữ liệu từ một dòng lệnh.

Thay vì phải viết một script mới cho mỗi tác vụ, **PatternFlow** cho phép bạn tách biệt **logic (công cụ)** và **quy tắc (cấu hình)**. Bạn chỉ cần viết một tệp cấu hình mới để định nghĩa dữ liệu cần tìm, PatternFlow sẽ lo phần còn lại.

**Lợi ích:**

- **Tái sử dụng:** Viết một lần, áp dụng cho nhiều loại văn bản.
- **Dễ bảo trì:** Khi định dạng văn bản thay đổi, bạn chỉ cần cập nhật tệp cấu hình.
- **Rõ ràng:** Tệp cấu hình mô tả chính xác dữ liệu bạn muốn lấy ra, giúp người khác dễ dàng đọc hiểu.

## Cài đặt

Dự án này sử dụng Node.js và có thể được cài đặt qua NPM.

```bash
npm install string-similarity
```

_Lưu ý: Hiện tại dự án chưa được đóng gói lên NPM. Bạn có thể clone repository và sử dụng trực tiếp các module._

## Cách hoạt động

Luồng xử lý của PatternFlow rất đơn giản:

1.  **Văn bản đầu vào**: Chuỗi ký tự thô bạn muốn xử lý.
2.  **Đối tượng cấu hình**: Một file JavaScript định nghĩa các quy tắc trích xuất.
3.  **Engine PatternFlow (`extractor.js`)**:
    - Đọc tệp cấu hình.
    - Áp dụng tuần tự các `regexPatterns` để tìm và bóc tách dữ liệu.
    - Mỗi mẩu dữ liệu được xử lý bởi một hàm `localPostProcessingFunction`.
    - Toàn bộ kết quả được xử lý bởi `globalPostProcessingFunction` để định dạng output cuối cùng.
4.  **Dữ liệu có cấu trúc**: Kết quả trả về thường là một đối tượng JSON.

## Ví dụ

### Ví dụ 1: Tạo Mục lục cho file Org-mode

**Mục tiêu:** Trích xuất tất cả các tiêu đề cấp 1 (`* Heading`) từ một file Org-mode.

**1. Tệp cấu hình (`templates/orgmodeTOC.js`)**

```javascript
import extractorToPattern, { id } from "../modules/extractor.js";
import applyPattern from "../modules/applyPattern.js";

const TOCConfig = {
  nameOfExtractor: "orgmodeHeading",
  comment: "Tách các heading cấp 1 trong orgmode để tạo mục lục.",
  regexPatterns: [
    {
      name: "title",
      matchMode: "single",
      matchPattern: /^#\+[Tt][Ii][Tt][Ll][Ee]:\s*(?<title>.+)$/m,
      localPostProcessingFunction: (match) => match.title,
    },
    {
      name: "header",
      matchMode: "multi",
      matchPattern: /^\*\s+(?<header>[^\r\n]+)/gm,
      localPostProcessingFunction: (match) => match.header,
    },
  ],
  globalPostProcessingFunction: (matchObject) => {
    const title = matchObject.title[0]?.postProcessValue || "Không có tiêu đề";
    const headers = matchObject.header.map((h) => `- ${h.postProcessValue}`);
    return `${title}\n${headers.join("\n")}`;
  },
};

// Cách sử dụng sẽ được mô tả bên dưới
```

**2. Dữ liệu mẫu (`content.org`)**

```org
#+TITLE: Ghi chú của tôi

* Hướng đi của toán ứng dụng
- Làm thạc sĩ về giải tích lồi.
- Kiếm một giáo sư nào đó.

* Bài trình minizinc
Giới thiệu ngôn ngữ và các tính năng cơ bản.
```

**3. Cách chạy**

```javascript
import fs from "fs";
import extractorToPattern from "./modules/extractor.js";
// Giả sử TOCConfig được export từ file trên
import { TOCConfig } from "./templates/orgmodeTOC.js";

const content = fs.readFileSync("content.org", "utf-8");
const result = extractorToPattern(content, TOCConfig);

console.log(result);
```

**4. Kết quả**

```
Ghi chú của tôi
- Hướng đi của toán ứng dụng
- Bài trình minizinc
```

### Ví dụ 2: Phân tích cú pháp Email từ dòng lệnh

Ví dụ này sử dụng `fuzzyRecognize` để tìm email gần đúng và trích xuất nhiều trường thông tin khác nhau. Vui lòng xem chi tiết tại `templates/linter/email.js`.

## Lộ trình phát triển

PatternFlow vẫn đang được phát triển với nhiều ý tưởng thú vị:

- **Trích xuất lồng nhau (Nested Extraction):** Hỗ trợ các `subPatterns` để có thể phân tích các cấu trúc dữ liệu có thứ bậc (ví dụ: mục lục đa cấp `*`, `**`, `***`).
- **Xử lý lỗi nâng cao:** Thay vì dừng chương trình khi có lỗi, PatternFlow sẽ thu thập tất cả lỗi vào một mảng và trả về cùng với kết quả, giúp việc gỡ lỗi dễ dàng hơn.
- **Hỗ trợ Template Engine mạnh mẽ:** Tích hợp các thư viện như Nunjucks để tạo ra các định dạng output phức tạp một cách linh hoạt.
- **Xác thực cấu hình:** Kiểm tra tệp cấu hình trước khi chạy để đảm bảo các thuộc tính cần thiết không bị thiếu.

## Đóng góp

Mọi sự đóng góp đều được chào đón! Bạn có thể giúp đỡ dự án bằng cách:

1.  **Báo lỗi (Reporting Bugs):** Nếu bạn tìm thấy lỗi, hãy tạo một issue trên GitHub.
2.  **Đề xuất tính năng (Feature Requests):** Có ý tưởng để làm PatternFlow tốt hơn? Hãy cho chúng tôi biết.
3.  **Viết thêm Templates:** Xây dựng các tệp cấu hình cho những định dạng văn bản phổ biến (markdown, log files, csv,...) và chia sẻ chúng.
4.  **Cải thiện tài liệu:** Giúp tài liệu trở nên rõ ràng và dễ hiểu hơn.

**Quy trình đóng góp:**

1.  Fork repository này.
2.  Tạo một branch mới (`git checkout -b feature/ten-tinh-nang-moi`).
3.  Thực hiện các thay đổi của bạn.
4.  Commit thay đổi (`git commit -am 'Add: Thêm tính năng X'`).
5.  Push lên branch (`git push origin feature/ten-tinh-nang-moi`).
6.  Tạo một Pull Request mới.

Cảm ơn bạn đã quan tâm đến PatternFlow!
