# Hướng Dẫn Sử Dụng PatternFlow — Từ Cơ Bản Đến Thực Tiễn

> **Dành cho:** Người mới bắt đầu muốn tự viết file cấu hình JS để trích xuất và xử lý dữ liệu văn bản với PatternFlow.

---

## Mục lục

1. [PatternFlow là gì và tại sao dùng nó?](#1-patternflow-là-gì-và-tại-sao-dùng-nó)
2. [Cài đặt](#2-cài-đặt)
3. [Kiến trúc tổng quan](#3-kiến-trúc-tổng-quan)
4. [Cấu trúc của một file cấu hình](#4-cấu-trúc-của-một-file-cấu-hình)
   - 4.1 [Các trường cấp cao nhất](#41-các-trường-cấp-cao-nhất)
   - 4.2 [Mảng `regexPatterns`](#42-mảng-regexpatterns)
   - 4.3 [Hàm `globalPostProcessingFunction`](#43-hàm-globalpostprocessingfunction)
5. [Danh sách hàm Utility có sẵn](#5-danh-sách-hàm-utility-có-sẵn)
   - 5.1 [`extractorToPattern`](#51-extractortopattern)
   - 5.2 [`applyPattern`](#52-applypattern)
   - 5.3 [`numberedPlaceholderRender`](#53-numberedplaceholderrender)
   - 5.4 [`namePlaceholderRender`](#54-nameplaceholderrender)
   - 5.5 [`textSplliter`](#55-textsplliter)
   - 5.6 [`fuzzyRecognize`](#56-fuzzyrecognize)
   - 5.7 [`id`](#57-id)
   - 5.8 [`nameAndValuesGlobalPostProcessing`](#58-nameandvaluesglobalpostprocessing)
6. [Hiểu về `matchObject` — Trái tim của kết quả](#6-hiểu-về-matchobject--trái-tim-của-kết-quả)
7. [Các ví dụ thực tế từ dự án](#7-các-ví-dụ-thực-tế-từ-dự-án)
   - 7.1 [Ví dụ 1: Tạo mục lục Org-mode](#71-ví-dụ-1-tạo-mục-lục-org-mode-cấp-1-và-2)
   - 7.2 [Ví dụ 2: Phân tích biên bản họp](#72-ví-dụ-2-phân-tích-biên-bản-họp)
   - 7.3 [Ví dụ 3: Phân tích log web server](#73-ví-dụ-3-phân-tích-log-web-server)
   - 7.4 [Ví dụ 4: Soạn email nhanh từ một dòng lệnh](#74-ví-dụ-4-soạn-email-nhanh-từ-một-dòng-lệnh)
8. [Hướng dẫn viết file cấu hình từ đầu](#8-hướng-dẫn-viết-file-cấu-hình-từ-đầu-step-by-step)
9. [Sử dụng qua CLI](#9-sử-dụng-qua-cli)
10. [Sử dụng như một thư viện JS](#10-sử-dụng-như-một-thư-viện-js)
11. [Mẹo và lỗi thường gặp](#11-mẹo-và-lỗi-thường-gặp)
12. [Tổng kết](#12-tổng-kết)

---

## 1. PatternFlow là gì và tại sao dùng nó?

Trong công việc hàng ngày, chúng ta rất hay phải làm những việc như:

- Lấy ra danh sách việc cần làm từ một file ghi chú.
- Tách các dòng lỗi từ file log hàng trăm ngàn dòng.
- Phân tích biên bản họp để tổng hợp công việc theo từng người.
- Trích xuất địa chỉ email, số điện thoại, ngày giờ từ văn bản thô.

Cách làm truyền thống là mỗi bài toán viết một script riêng, script đó không tái sử dụng được. **PatternFlow** giải quyết điều này bằng cách **tách biệt công cụ và quy tắc**:

- **Công cụ** (engine): PatternFlow lo phần đọc văn bản, chạy regex, thu thập kết quả.
- **Quy tắc** (file cấu hình JS): *Bạn* chỉ cần viết một file JS mô tả "tôi muốn lấy gì" và "định dạng kết quả ra sao".

Khi văn bản thay đổi định dạng, bạn chỉ sửa file cấu hình, không cần đụng vào engine. Khi cần xử lý loại văn bản mới, bạn viết thêm một file cấu hình mới mà không cần hiểu lại cơ chế bên trong.

**Khi nào nên dùng PatternFlow?**

| Tình huống | Phù hợp? |
|---|---|
| Trích xuất thông tin có quy luật từ văn bản thô | ✅ Rất phù hợp |
| Xử lý log file, ghi chú, biên bản | ✅ Rất phù hợp |
| Cần tái sử dụng quy tắc trích xuất cho nhiều file | ✅ Rất phù hợp |
| Phân tích JSON, XML có cấu trúc chặt | ⚠️ Cần cân nhắc (dùng parser chuyên dụng) |
| Xử lý ngôn ngữ tự nhiên phức tạp | ❌ Không phải thế mạnh |

---

## 2. Cài đặt

### 2.1 Cài đặt làm công cụ dòng lệnh (CLI)

```bash
npm install -g pattern-flow
```

Sau khi cài, bạn có thể gọi lệnh `pattern-flow` ở bất cứ đâu:

```bash
pattern-flow <đường_dẫn_config.js> <đường_dẫn_file_văn_bản>
```

Nếu không muốn cài global, dùng `npx`:

```bash
npx pattern-flow ./myConfig.js ./input.txt
```

**Cài đặt qua Homebrew (macOS / Linux):**

```bash
brew tap DrRingo/pattern-flow https://github.com/DrRingo/pattern-flow
brew install pattern-flow
```

**Cài đặt qua Scoop (Windows):**

```bash
scoop install https://raw.githubusercontent.com/DrRingo/pattern-flow/main/packaging/pattern-flow.json
```

### 2.2 Cài đặt làm thư viện trong dự án Node.js

```bash
npm install pattern-flow
```

Sau đó import trong code:

```javascript
import { extractorToPattern, applyPattern, textSplliter, fuzzyRecognize, id, nameAndValuesGlobalPostProcessing } from 'pattern-flow';
```

> **Lưu ý:** PatternFlow dùng ES Modules. Hãy đảm bảo file `package.json` của bạn có `"type": "module"` hoặc dùng phần mở rộng `.mjs`.

---

## 3. Kiến trúc tổng quan

```
┌──────────────────────────────────────────────┐
│             Văn bản đầu vào (text)            │
└─────────────────────┬────────────────────────┘
                      │
┌─────────────────────▼────────────────────────┐
│          File cấu hình JS (config)            │
│  - regexPatterns[]                            │
│  - localPostProcessingFunction (mỗi pattern) │
│  - globalPostProcessingFunction               │
└─────────────────────┬────────────────────────┘
                      │
┌─────────────────────▼────────────────────────┐
│       extractorToPattern() — Engine           │
│  1. Duyệt từng regexPattern                  │
│  2. Match văn bản (single hoặc multi)        │
│  3. Xóa phần đã match khỏi chuỗi còn lại    │
│  4. Chạy localPostProcessingFunction         │
│  5. Chạy globalPostProcessingFunction         │
└─────────────────────┬────────────────────────┘
                      │
┌─────────────────────▼────────────────────────┐
│         Kết quả (object JSON hoặc string)     │
└──────────────────────────────────────────────┘
```

**Điểm quan trọng về cơ chế hoạt động theo thứ tự:**

PatternFlow xử lý các `regexPatterns` theo **thứ tự từ trên xuống dưới**. Sau khi một pattern match thành công, phần văn bản đã match được **xóa đi** khỏi chuỗi đang xử lý (thay bằng chuỗi separator `///`). Điều này có nghĩa là:

1. Thứ tự khai báo các pattern **có ảnh hưởng** đến kết quả.
2. Mỗi pattern chỉ hoạt động trên **phần văn bản chưa được pattern trước xử lý**.
3. Đây là cơ chế để tránh match chéo giữa các pattern với nhau.

---

## 4. Cấu trúc của một file cấu hình

Mỗi file cấu hình là một object JavaScript với các trường sau:

```javascript
export const MyConfig = {
  // 1. Tên định danh (tùy chọn)
  nameOfExtractor: "TenCuaExtractor",

  // 2. Ghi chú mục đích (tùy chọn)
  comment: "Mô tả ngắn gọn file cấu hình này làm gì",

  // 3. Chế độ match mặc định (tùy chọn, mặc định: "single")
  matchMode: "single", // hoặc "multi"

  // 4. Danh sách các pattern (bắt buộc)
  regexPatterns: [ /* ... */ ],

  // 5. Hàm xử lý kết quả cuối cùng (bắt buộc)
  globalPostProcessingFunction: (matchObject) => { /* ... */ }
};
```

### 4.1 Các trường cấp cao nhất

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `nameOfExtractor` | `string` | Không | Tên dễ nhận biết cho config này |
| `comment` | `string` | Không | Ghi chú mục đích, dành cho người đọc config |
| `matchMode` | `"single"` \| `"multi"` | Không | Chế độ match mặc định cho toàn bộ patterns. Mặc định: `"single"` |
| `regexPatterns` | `Array` | **Có** | Mảng các regex pattern cần áp dụng |
| `globalPostProcessingFunction` | `Function` | Không | Hàm tổng hợp kết quả. Mặc định: `nameAndValuesGlobalPostProcessing` |

### 4.2 Mảng `regexPatterns`

Mỗi phần tử trong `regexPatterns` là một object mô tả **một loại thông tin** bạn muốn trích xuất:

```javascript
{
  // Tên nhận dạng, dùng để truy cập trong globalPostProcessingFunction
  name: "tenPattern",

  // Chế độ match: "single" = chỉ lấy kết quả đầu tiên, "multi" = lấy tất cả
  matchMode: "single", // hoặc "multi"

  // Regex để tìm kiếm. CẦN đặt tên cho các capturing groups bằng (?<tên>...)
  matchPattern: /regex-của-ban/gm,

  // Giá trị mặc định khi không match được gì
  defaultMatchValue: "",

  // Hàm xử lý kết quả của MỘT lần match
  localPostProcessingFunction: (match) => {
    // match chứa các groups đã đặt tên và các thuộc tính: matched, index, match
    return match.tenGroup; // Trả về giá trị bạn muốn lưu
  }
}
```

**Giải thích chi tiết các trường:**

**`name`** — Tên này rất quan trọng! Đây là "chìa khóa" để bạn truy cập kết quả pattern này trong `globalPostProcessingFunction`. Ví dụ nếu `name: "attendees"` thì trong hàm global bạn viết `matchObject.attendees`.

**`matchMode`**:
- `"single"`: Chỉ lấy lần xuất hiện **đầu tiên** của pattern. Dùng khi bạn biết thông tin chỉ xuất hiện một lần (ví dụ: tiêu đề email, ngày tháng của biên bản).
- `"multi"`: Lấy **tất cả** các lần xuất hiện. Dùng khi thông tin có thể lặp lại (ví dụ: danh sách người tham dự, danh sách công việc).

**`matchPattern`** — Đây là trái tim của pattern. Một số lưu ý quan trọng:
- **Bắt buộc phải dùng named capturing groups** `(?<tenGroup>...)` để có thể truy cập kết quả trong `localPostProcessingFunction`.
- Với `matchMode: "multi"`, nên thêm cờ `g` (global) vào regex.
- Nên thêm cờ `m` (multiline) khi pattern cần match đầu/cuối dòng với `^` và `$`.

**`defaultMatchValue`** — Giá trị trả về khi không tìm thấy match. Thường để chuỗi rỗng `""` hoặc mảng rỗng `[]`.

**`localPostProcessingFunction`** — Hàm nhận vào một object `match` chứa:
- `match.matched`: `true` nếu có kết quả
- `match.match`: toàn bộ chuỗi đã match
- `match.index`: vị trí trong văn bản gốc
- `match.<tenGroup>`: giá trị của từng named group trong regex

### 4.3 Hàm `globalPostProcessingFunction`

Đây là hàm chạy **cuối cùng**, sau khi tất cả patterns đã được xử lý. Nó nhận vào `matchObject` — một object chứa kết quả của tất cả patterns — và trả về kết quả cuối cùng bạn muốn.

```javascript
globalPostProcessingFunction: (matchObject) => {
  // matchObject có cấu trúc: { "tenPattern1": [...], "tenPattern2": [...] }
  // Mỗi phần tử trong mảng là: { matched, match, groups, postProcessValue, index }

  const results = matchObject.tenPattern1
    .filter(item => item.matched)      // Chỉ lấy các kết quả match thành công
    .map(item => item.postProcessValue); // Lấy giá trị đã qua xử lý local

  return results; // Trả về bất kỳ kiểu dữ liệu nào bạn muốn
}
```

---

## 5. Danh sách hàm Utility có sẵn

PatternFlow export sẵn một số hàm tiện ích để bạn dùng ngay trong file cấu hình mà không cần tự viết lại.

```javascript
import {
  extractorToPattern,
  applyPattern,
  textSplliter,
  fuzzyRecognize,
  id,
  nameAndValuesGlobalPostProcessing
} from 'pattern-flow';
```

### 5.1 `extractorToPattern`

**Đây là hàm engine chính** của PatternFlow.

```javascript
extractorToPattern(textToExtract, config, errors?)
```

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `textToExtract` | `string` | Văn bản thô cần xử lý |
| `config` | `object` | Object cấu hình PatternFlow |
| `errors` | `Array` (tuỳ chọn) | Mảng để thu thập lỗi, mặc định `[]` |

**Trả về:** Kết quả của `globalPostProcessingFunction` — có thể là object, string, mảng, tùy bạn định nghĩa.

**Ví dụ:**

```javascript
import fs from 'fs';
import { extractorToPattern } from 'pattern-flow';
import { MyConfig } from './myConfig.js';

const text = fs.readFileSync('./input.txt', 'utf-8');
const result = extractorToPattern(text, MyConfig);
console.log(JSON.stringify(result, null, 2));
```

---

### 5.2 `applyPattern`

Điền các biến vào một template string. Hỗ trợ 2 kiểu placeholder:
- **Dạng số:** `$1`, `$2`, `$3`... (theo thứ tự các key trong data)
- **Dạng tên:** `{{tenBien}}` (theo tên key trong data)

```javascript
applyPattern(templateString, dataObject)
```

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `templateString` | `string` | Chuỗi template với các placeholder |
| `dataObject` | `object` | Object chứa các giá trị cần điền |

**Trả về:** `string` — Chuỗi đã được điền các biến.

**Ví dụ:**

```javascript
import { applyPattern } from 'pattern-flow';

const data = { name: "Ringo", age: "30", city: "Hà Nội" };

// Dạng tên
applyPattern("Xin chào, {{name}}! Bạn {{age}} tuổi, sống tại {{city}}.", data);
// => "Xin chào, Ringo! Bạn 30 tuổi, sống tại Hà Nội."

// Dạng số
applyPattern("$1 - $2 ($3)", data);
// => "Ringo - 30 (Hà Nội)"

// Kết hợp cả hai
applyPattern("Người dùng: {{name}}, Tuổi: $2", data);
// => "Người dùng: Ringo, Tuổi: 30"
```

Hàm này rất hữu dụng trong `localPostProcessingFunction` để tạo chuỗi kết quả có định dạng:

```javascript
localPostProcessingFunction: (match) => applyPattern("{{hour}}:{{minute}}", match)
```

---

### 5.3 `numberedPlaceholderRender`

Phần render chỉ dành cho placeholder dạng số `$1`, `$2`...

```javascript
numberedPlaceholderRender(pattern, data)
```

Hàm này được `applyPattern` gọi nội bộ. Bạn có thể dùng trực tiếp nếu chỉ cần render dạng số.

---

### 5.4 `namePlaceholderRender`

Phần render chỉ dành cho placeholder dạng tên `{{name}}`.

```javascript
namePlaceholderRender(pattern, data)
```

Tương tự, được `applyPattern` gọi nội bộ.

---

### 5.5 `textSplliter`

Chia một đoạn văn bản lớn thành các phần nhỏ để xử lý riêng biệt. Đặc biệt hữu ích khi bạn muốn chạy `extractorToPattern` **trên từng đoạn** của văn bản thay vì toàn bộ cùng lúc.

```javascript
textSplliter(text, pattern, mode, omitLastLine?)
```

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `text` | `string` | Văn bản cần chia |
| `pattern` | `string` \| `Array` | Pattern để chia (tuỳ theo mode) |
| `mode` | `string` | Chế độ chia: `"normal"`, `"regex"`, `"beginEnd"` |
| `omitLastLine` | `boolean` | Có bỏ dòng cuối mỗi phần không? (chỉ dùng với `"beginEnd"`) |

**Ba chế độ hoạt động:**

**`"normal"`** — Chia theo câu (dựa trên dấu `.`, `!`, `?`):

```javascript
textSplliter(longText, null, 'normal');
// => ["Câu đầu tiên.", "Câu thứ hai!", ...]
```

**`"regex"`** — Trích xuất tất cả các đoạn khớp với regex:

```javascript
// Lấy tất cả các từ có đúng 5 chữ cái
textSplliter(text, '\\b\\w{5}\\b', 'regex');
// => ["hello", "world", "great", ...]
```

**`"beginEnd"`** — Tách các đoạn từ pattern mở đầu đến pattern kết thúc. Rất hữu ích cho văn bản có cấu trúc đầu-cuối lặp lại:

```javascript
// Tách từng section của file Markdown (từ heading đến heading tiếp theo)
const sections = textSplliter(
  markdownText,
  ['^#\\s.*', '(?=^#\\s.*|$)'], // [beginPattern, endPattern]
  'beginEnd'
);
// Sau đó xử lý từng section riêng biệt
sections.forEach(section => {
  const result = extractorToPattern(section, MySectionConfig);
});
```

**Ví dụ thực tế — chia email thành từng email riêng biệt:**

```javascript
import { textSplliter, extractorToPattern } from 'pattern-flow';

const emailLog = fs.readFileSync('emails.txt', 'utf-8');

// Mỗi email bắt đầu bằng "From:" và kết thúc trước "From:" tiếp theo
const emails = textSplliter(
  emailLog,
  ['^From:', '^From:'],
  'beginEnd'
);

const results = emails.map(email => extractorToPattern(email, EmailConfig));
```

---

### 5.6 `fuzzyRecognize`

So sánh một chuỗi đầu vào với một danh sách và tìm ra phần tử **giống nhất** (dùng thuật toán string similarity). Rất hữu ích khi người dùng nhập viết tắt hoặc không chính xác.

```javascript
fuzzyRecognize(inputString, dataSet)
```

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `inputString` | `string` | Chuỗi cần tìm kiếm |
| `dataSet` | `Array<string>` | Danh sách các chuỗi để so sánh |

**Trả về:** `string` — Phần tử trong `dataSet` giống với `inputString` nhất.

**Ví dụ:**

```javascript
import { fuzzyRecognize } from 'pattern-flow';

const emailList = [
  "alice@company.com",
  "bob@company.com",
  "charlie@company.com"
];

fuzzyRecognize("alice", emailList);   // => "alice@company.com"
fuzzyRecognize("bob", emailList);     // => "bob@company.com"
fuzzyRecognize("charle", emailList);  // => "charlie@company.com" (dù viết sai)
```

Hàm này lý tưởng để dùng trong `localPostProcessingFunction` khi bạn muốn người dùng có thể nhập viết tắt:

```javascript
localPostProcessingFunction: (match) => fuzzyRecognize(match.username, userList)
```

---

### 5.7 `id`

Hàm **identity** — nhận vào gì, trả về đúng đó. Nghe có vẻ vô dụng, nhưng đây là pattern cực kỳ quan trọng trong lập trình hàm, giúp **"bỏ trống"** một bước xử lý mà không gây lỗi.

```javascript
id(arg) // => arg (trả về nguyên xi)
```

**Khi nào dùng:**

1. Khi bạn không muốn xử lý gì ở bước local, chỉ muốn giữ nguyên `matchObject`:

```javascript
globalPostProcessingFunction: id // Trả về toàn bộ matchObject thô
```

2. Khi debug, bạn muốn xem rawdata trước khi áp dụng transformation:

```javascript
// Thay vì globalPostProcessingFunction phức tạp, thử id trước
globalPostProcessingFunction: id
```

3. Trong code, dùng làm fallback khi không có hàm được truyền vào:

```javascript
let fn = userProvidedFunction || id;
```

---

### 5.8 `nameAndValuesGlobalPostProcessing`

Hàm `globalPostProcessingFunction` **mặc định** của PatternFlow. Dùng khi bạn chỉ cần kết quả đơn giản dạng `{ "tenPattern": [value1, value2, ...] }`.

```javascript
nameAndValuesGlobalPostProcessing(matchObject)
```

**Trả về:** Object JSON đơn giản với tên pattern là key và mảng các giá trị đã qua xử lý là value.

**Ví dụ — kết quả đầu ra:**

```json
{
  "emails": ["alice@company.com", "bob@company.com"],
  "dates": ["2024-01-15", "2024-01-20"],
  "subject": ["Re: Cuộc họp tuần tới"]
}
```

**Khi nào nên dùng:**

- Khi bạn chỉ muốn thu thập dữ liệu mà không cần định dạng phức tạp.
- Khi muốn kiểm tra nhanh xem các patterns có hoạt động đúng không.
- Khi kết quả sẽ được xử lý tiếp ở nơi khác trong code.

```javascript
import { nameAndValuesGlobalPostProcessing } from 'pattern-flow';

export const SimpleConfig = {
  nameOfExtractor: "SimpleExtractor",
  regexPatterns: [ /* ... */ ],
  globalPostProcessingFunction: nameAndValuesGlobalPostProcessing // Dùng sẵn!
};
```

---

## 6. Hiểu về `matchObject` — Trái tim của kết quả

`matchObject` là cấu trúc dữ liệu trung gian mà PatternFlow tạo ra sau khi xử lý tất cả patterns. Bạn cần hiểu cấu trúc này để viết `globalPostProcessingFunction` chính xác.

**Cấu trúc của `matchObject`:**

```javascript
{
  "tenPattern1": [
    {
      matched: true,           // Có match được không?
      match: "chuỗi đã match", // Toàn bộ chuỗi match
      groups: {                // Các named groups từ regex
        "tenGroup1": "giá trị",
        "tenGroup2": "giá trị"
      },
      postProcessValue: "...", // Kết quả sau localPostProcessingFunction
      index: 42                // Vị trí trong văn bản gốc
    },
    // ... thêm các match khác (nếu matchMode: "multi")
  ],
  "tenPattern2": [
    {
      matched: false,          // Không tìm thấy match
      match: "",               // defaultMatchValue
      groups: {},
      postProcessValue: null,
      index: -1
    }
  ]
}
```

**Pattern để duyệt `matchObject` an toàn:**

```javascript
globalPostProcessingFunction: (matchObject) => {
  // Luôn filter trước khi map để tránh lỗi
  const values = matchObject.tenPattern
    .filter(item => item.matched)        // Bỏ qua các không-match
    .map(item => item.postProcessValue); // Lấy giá trị đã xử lý

  return values;
}
```

---

## 7. Các ví dụ thực tế từ dự án

### 7.1 Ví dụ 1: Tạo mục lục Org-mode (cấp 1 và 2)

**Bài toán:** Đọc file `.org` và tạo mục lục gồm heading cấp 1 (`*`) và cấp 2 (`**`), bỏ qua các keyword trạng thái như `TODO`, `DONE`.

**Văn bản đầu vào (`notes.org`):**

```org
* Giới thiệu
** Lịch sử
** Mục tiêu dự án
* TODO Công việc cần làm
** DONE Cài đặt môi trường
** Viết tài liệu :@work:
* Kết luận
```

**File cấu hình (`orgmodeNestedTOC.js`):**

```javascript
import { nameAndValuesGlobalPostProcessing } from 'pattern-flow';

export const OrgNestedTOCConfig = {
  nameOfExtractor: "orgmodeNestedHeading",
  comment: "Tách các heading cấp 1 và 2 trong orgmode và tạo mục lục có cấu trúc.",
  regexPatterns: [
    {
      name: "headings",
      matchMode: "multi",
      // Regex bắt heading, bỏ qua keyword trạng thái và tags
      matchPattern: /^(?<stars>\*+)\s+(?!(?:TODO|DONE|WAIT|PROJ|KILL|HOLD)\s)(?:\[#[A-Z]\]\s*)?(?<header>.+?)(?:\s+:(?:[^\s:]+:)+)?$/gm,
      defaultMatchValue: [],
      localPostProcessingFunction: (match) => ({
        level: match.stars.length, // Số dấu * = cấp độ
        text: match.header.trim()
      })
    }
  ],
  globalPostProcessingFunction: (matchObject) => {
    const title = "* Mục lục";
    const separator = "--------------------";

    const processedHeadings = matchObject.headings
      .filter(h => h.matched && h.postProcessValue)
      .filter(h => h.postProcessValue.level === 1 || h.postProcessValue.level === 2)
      .map(h => h.postProcessValue);

    const tocLines = processedHeadings.map(heading => {
      const link = `[[*${heading.text}]]`;
      if (heading.level === 1) return `- ${link}`;
      if (heading.level === 2) return `  + ${link}`;
    });

    return [title, separator, ...tocLines, separator].join('\n');
  }
};
```

**Kết quả:**

```
* Mục lục
--------------------
- [[*Giới thiệu]]
  + [[*Lịch sử]]
  + [[*Mục tiêu dự án]]
- [[*Kết luận]]
--------------------
```

> **Lưu ý:** Heading `* TODO Công việc cần làm` bị bỏ qua vì có keyword `TODO`. Heading `** Viết tài liệu :@work:` được lấy nội dung nhưng tag `:@work:` bị bỏ qua nhờ regex.

---

### 7.2 Ví dụ 2: Phân tích biên bản họp

**Bài toán:** Từ một biên bản họp dạng văn bản thô, tự động trích xuất: ai tham dự (`@username`), các quyết định đã đưa ra (`(DECISION)`), và công việc được giao cho ai, deadline khi nào (`AI due:YYYY-MM-DD`).

**Văn bản đầu vào:**

```
Cuộc họp lập kế hoạch Sprint 5

Tham dự: @alice @bob @charlie

Thảo luận:
- Sẽ triển khai tính năng X vào tuần tới (DECISION)
- Cần review code trước khi merge (DECISION)

Công việc:
- @alice Viết unit test cho module payment (AI due:2024-02-20)
- @bob Review pull request #142 (AI due:2024-02-18)
- @charlie Cập nhật tài liệu API
```

**File cấu hình (`meetingMinutes.js`):**

```javascript
export const MeetingMinutesConfig = {
  nameOfExtractor: "MeetingMinutesParser",
  comment: "Phân tích biên bản họp: người tham dự, quyết định, công việc.",

  regexPatterns: [
    {
      name: "attendees",
      matchMode: "multi",
      matchPattern: /@(?<user>\w+)/g,
      localPostProcessingFunction: (match) => match.user
    },
    {
      name: "decisions",
      matchMode: "multi",
      matchPattern: /-\s*(?<decision>.+?)\s*\(DECISION\)/g,
      localPostProcessingFunction: (match) => match.decision.trim()
    },
    {
      name: "actionItems",
      matchMode: "multi",
      matchPattern: /-\s*@(?<assignee>\w+)\s+(?<task>.+?)(?:\s*\(AI due:(?<dueDate>[\d-]+)\))?$/gm,
      localPostProcessingFunction: (match) => ({
        assignee: match.assignee,
        task: match.task.trim(),
        dueDate: match.dueDate || 'N/A'
      })
    }
  ],

  globalPostProcessingFunction: (matchObject) => {
    const attendees = matchObject.attendees
      .filter(i => i.matched).map(i => i.postProcessValue);
    const decisions = matchObject.decisions
      .filter(i => i.matched).map(i => i.postProcessValue);
    const actionItems = matchObject.actionItems
      .filter(i => i.matched).map(i => i.postProcessValue);

    // Nhóm công việc theo người
    const tasksByAssignee = {};
    attendees.forEach(user => tasksByAssignee[user] = []);
    actionItems.forEach(item => {
      if (tasksByAssignee[item.assignee]) {
        tasksByAssignee[item.assignee].push({
          task: item.task,
          dueDate: item.dueDate
        });
      }
    });

    return { summary: { attendees, decisions }, tasksByAssignee };
  }
};
```

**Kết quả (JSON):**

```json
{
  "summary": {
    "attendees": ["alice", "bob", "charlie"],
    "decisions": [
      "Sẽ triển khai tính năng X vào tuần tới",
      "Cần review code trước khi merge"
    ]
  },
  "tasksByAssignee": {
    "alice": [{ "task": "Viết unit test cho module payment", "dueDate": "2024-02-20" }],
    "bob": [{ "task": "Review pull request #142", "dueDate": "2024-02-18" }],
    "charlie": [{ "task": "Cập nhật tài liệu API", "dueDate": "N/A" }]
  }
}
```

---

### 7.3 Ví dụ 3: Phân tích log web server

**Bài toán:** Đọc file log Apache, trích xuất từng dòng log và tính thống kê: tổng request, số lỗi (status >= 400), tổng bytes đã transfer.

**Dữ liệu đầu vào (`sample.log`):**

```
127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
192.168.1.1 - frank [10/Oct/2000:13:55:38 -0700] "POST /login.php HTTP/1.1" 200 1254
127.0.0.1 - - [10/Oct/2000:14:01:10 -0700] "GET /not_found.html HTTP/1.0" 404 300
172.16.0.5 - - [10/Oct/2000:14:05:21 -0700] "GET /styles/main.css HTTP/1.1" 304 0
208.77.188.166 - - [10/Oct/2000:14:08:59 -0700] "GET /internal_error HTTP/1.1" 500 531
```

**File cấu hình (`logParser.js`):**

```javascript
function getMonthFromString(monthStr) {
  return new Date(Date.parse(monthStr + " 1, 2012")).getMonth();
}

export const LogParserConfig = {
  nameOfExtractor: "WebServerLogParser",
  regexPatterns: [
    {
      name: "logEntry",
      matchMode: "multi",
      matchPattern: /^(?<ip>[\d.]+) - (?<user>[\w.-]+) \[(?<day>\d{2})\/(?<month>\w{3})\/(?<year>\d{4}):(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2}) (?<timezone>[+-]\d{4})\] "(?<method>GET|POST|PUT|DELETE|HEAD) (?<url>.+?) HTTP\/[\d.]+" (?<status>\d{3}) (?<size>\d+|-)$/gm,
      localPostProcessingFunction: (match) => ({
        ip: match.ip,
        user: match.user,
        timestamp: new Date(
          match.year,
          getMonthFromString(match.month),
          match.day, match.hour, match.minute, match.second
        ),
        request: { method: match.method, url: match.url },
        response: {
          status: parseInt(match.status, 10),
          size: match.size === '-' ? 0 : parseInt(match.size, 10)
        }
      })
    }
  ],
  globalPostProcessingFunction: (matchObject) => {
    const entries = matchObject.logEntry
      .filter(e => e.matched)
      .map(e => e.postProcessValue);

    return {
      statistics: {
        totalRequests: entries.length,
        errorCount: entries.filter(e => e.response.status >= 400).length,
        totalBytesTransferred: entries.reduce((sum, e) => sum + e.response.size, 0)
      },
      entries
    };
  }
};
```

**Kết quả:**

```json
{
  "statistics": {
    "totalRequests": 5,
    "errorCount": 2,
    "totalBytesTransferred": 4411
  },
  "entries": [ ... ]
}
```

---

### 7.4 Ví dụ 4: Soạn email nhanh từ một dòng lệnh

**Bài toán:** Người dùng muốn soạn email bằng cách gõ một dòng ngắn gọn. PatternFlow sẽ phân tích dòng đó và điền vào template email đầy đủ.

**Cú pháp nhập liệu của người dùng:**

```
from-ringo @-alice cc-bob tt- Cuộc họp tuần tới, vui lòng xem tài liệu đính kèm. ;; at- meeting_agenda.pdf ;;
```

**File cấu hình (`email.js`):**

```javascript
import { fuzzyRecognize, applyPattern, nameAndValuesGlobalPostProcessing } from 'pattern-flow';

const emailList = [
  "alice@company.com",
  "bob@company.com",
  "ringo@company.com"
];

export const EmailConfig = {
  nameOfExtractor: "email linter",
  matchMode: "single",
  regexPatterns: [
    {
      name: "fromEmail",
      matchMode: "single",
      matchPattern: /from-(?<fromEmail>\w+)/,
      defaultMatchValue: "ringo@company.com",
      // fuzzyRecognize tìm email gần nhất với "ringo"
      localPostProcessingFunction: (match) => fuzzyRecognize(match.fromEmail, emailList)
    },
    {
      name: "toEmail",
      matchMode: "multi",
      matchPattern: /@-(?<toEmail>\w+)/,
      defaultMatchValue: "",
      localPostProcessingFunction: (match) => fuzzyRecognize(match.toEmail, emailList)
    },
    {
      name: "ccEmail",
      matchMode: "multi",
      matchPattern: /cc-(?<ccEmail>\w+)/,
      defaultMatchValue: "",
      localPostProcessingFunction: (match) => fuzzyRecognize(match.ccEmail, emailList)
    },
    {
      name: "contentEmail",
      matchMode: "single",
      matchPattern: /tt-(?<contentEmail>..*?);;/,
      defaultMatchValue: "",
      localPostProcessingFunction: (match) => applyPattern("{{contentEmail}}", match)
    },
    {
      name: "attachmentEmail",
      matchMode: "multi",
      matchPattern: /at-(?<attachmentEmail>..*?);;/,
      defaultMatchValue: "",
      localPostProcessingFunction: (match) => applyPattern("{{attachmentEmail}}", match)
    }
  ],
  globalPostProcessingFunction: nameAndValuesGlobalPostProcessing
};
```

**Kết quả:**

```json
{
  "fromEmail": ["ringo@company.com"],
  "toEmail": ["alice@company.com"],
  "ccEmail": ["bob@company.com"],
  "contentEmail": [" Cuộc họp tuần tới, vui lòng xem tài liệu đính kèm. "],
  "attachmentEmail": [" meeting_agenda.pdf "]
}
```

---

## 8. Hướng dẫn viết file cấu hình từ đầu (Step by Step)

Dưới đây là quy trình từng bước để bạn tự viết file cấu hình cho bài toán của mình. Ví dụ: **trích xuất danh sách sách từ một file ghi chú**.

**Văn bản đầu vào (`books.md`):**

```
# Danh sách sách đã đọc

- [x] "Dune" by Frank Herbert (1965) | Score: 9/10
- [x] "1984" by George Orwell (1949) | Score: 10/10
- [ ] "Foundation" by Isaac Asimov (1951)
- [x] "Brave New World" by Aldous Huxley (1932) | Score: 8/10
```

### Bước 1: Xác định thông tin cần lấy

Tôi muốn lấy:
- Tên sách (giữa `"` và `"`)
- Tác giả (sau `by `)
- Năm xuất bản (trong ngoặc đơn, 4 chữ số)
- Điểm số (sau `Score:`, nếu có)
- Trạng thái đã đọc hay chưa (`[x]` hoặc `[ ]`)

### Bước 2: Viết regex cho từng thông tin

Thử từng regex trên một công cụ như [regex101.com](https://regex101.com):

```
Tên sách:   "(?<title>[^"]+)"
Tác giả:    by (?<author>[^(]+)
Năm:        \((?<year>\d{4})\)
Điểm:       Score: (?<score>[\d/]+)
Trạng thái: (?<status>\[.\])
```

### Bước 3: Gộp vào một pattern duy nhất

Vì mỗi dòng chứa tất cả thông tin, tốt nhất là dùng **một pattern duy nhất** với `matchMode: "multi"`:

```
/^- (?<status>\[.\]) "(?<title>[^"]+)" by (?<author>[^(]+)\((?<year>\d{4})\)(?:.*Score: (?<score>[\d/]+))?/gm
```

### Bước 4: Viết file cấu hình

```javascript
// bookList.js
import { nameAndValuesGlobalPostProcessing } from 'pattern-flow';

export const BookListConfig = {
  nameOfExtractor: "BookListParser",
  comment: "Trích xuất danh sách sách từ file ghi chú Markdown.",
  regexPatterns: [
    {
      name: "book",
      matchMode: "multi",
      matchPattern: /^- (?<status>\[.\]) "(?<title>[^"]+)" by (?<author>[^(]+)\((?<year>\d{4})\)(?:.*Score: (?<score>[\d/]+))?/gm,
      defaultMatchValue: [],
      localPostProcessingFunction: (match) => ({
        title: match.title.trim(),
        author: match.author.trim(),
        year: parseInt(match.year),
        score: match.score || "Chưa cho điểm",
        read: match.status === "[x]"
      })
    }
  ],
  globalPostProcessingFunction: (matchObject) => {
    const books = matchObject.book
      .filter(b => b.matched)
      .map(b => b.postProcessValue);

    const readBooks = books.filter(b => b.read);
    const unreadBooks = books.filter(b => !b.read);

    return {
      total: books.length,
      read: readBooks.length,
      unread: unreadBooks.length,
      books,
      // Tính điểm trung bình
      averageScore: readBooks
        .filter(b => b.score !== "Chưa cho điểm")
        .map(b => parseFloat(b.score))
        .reduce((sum, s, _, arr) => sum + s / arr.length, 0)
        .toFixed(1)
    };
  }
};
```

### Bước 5: Kiểm tra kết quả

```javascript
// test.js
import fs from 'fs';
import { extractorToPattern } from 'pattern-flow';
import { BookListConfig } from './bookList.js';

const text = fs.readFileSync('./books.md', 'utf-8');
const result = extractorToPattern(text, BookListConfig);
console.log(JSON.stringify(result, null, 2));
```

**Kết quả:**

```json
{
  "total": 4,
  "read": 3,
  "unread": 1,
  "averageScore": "9.0",
  "books": [
    { "title": "Dune", "author": "Frank Herbert", "year": 1965, "score": "9/10", "read": true },
    { "title": "1984", "author": "George Orwell", "year": 1949, "score": "10/10", "read": true },
    { "title": "Foundation", "author": "Isaac Asimov", "year": 1951, "score": "Chưa cho điểm", "read": false },
    { "title": "Brave New World", "author": "Aldous Huxley", "year": 1932, "score": "8/10", "read": true }
  ]
}
```

---

## 9. Sử dụng qua CLI

Khi đã viết xong file cấu hình, cách đơn giản nhất để chạy là dùng CLI.

**Cú pháp:**

```bash
pattern-flow <đường_dẫn_config.js> <đường_dẫn_file_đầu_vào>
```

**Ví dụ:**

```bash
# Chạy và xem kết quả trên terminal
pattern-flow ./bookList.js ./books.md

# Lưu kết quả ra file JSON
pattern-flow ./bookList.js ./books.md > output.json

# Pipe kết quả sang jq để xử lý tiếp
pattern-flow ./logParser.js ./server.log | jq '.statistics'
```

**Lưu ý quan trọng khi viết file cấu hình để dùng với CLI:**

File cấu hình **bắt buộc phải export** config object. CLI hỗ trợ hai dạng:

```javascript
// Dạng 1: export default
export default { nameOfExtractor: "...", regexPatterns: [...] };

// Dạng 2: named export (CLI sẽ lấy export đầu tiên tìm thấy)
export const MyConfig = { nameOfExtractor: "...", regexPatterns: [...] };
```

---

## 10. Sử dụng như một thư viện JS

Khi bạn muốn tích hợp PatternFlow vào một ứng dụng Node.js lớn hơn, import trực tiếp:

```javascript
import fs from 'fs';
import { extractorToPattern, textSplliter } from 'pattern-flow';
import { MyConfig } from './myConfig.js';

// Đọc và xử lý một file
const text = fs.readFileSync('./input.txt', 'utf-8');
const result = extractorToPattern(text, MyConfig);

// Xử lý văn bản lớn theo từng đoạn
const sections = textSplliter(text, ['^## ', '^## '], 'beginEnd');
const results = sections.map(section => extractorToPattern(section, MyConfig));

// Xử lý nhiều file
const files = ['file1.txt', 'file2.txt', 'file3.txt'];
const allResults = files.map(f => {
  const content = fs.readFileSync(f, 'utf-8');
  return { file: f, data: extractorToPattern(content, MyConfig) };
});
```

---

## 11. Mẹo và lỗi thường gặp

### ❗ Lỗi 1: Regex không match nhưng trông có vẻ đúng

**Nguyên nhân phổ biến:** Thiếu cờ `g` (global) hoặc `m` (multiline).

```javascript
// ❌ Sai: Thiếu cờ 'm' nên '^' không match đầu dòng
matchPattern: /^- (?<item>.+)/g,

// ✅ Đúng: Có cả 'g' và 'm'
matchPattern: /^- (?<item>.+)/gm,
```

### ❗ Lỗi 2: `matchMode: "multi"` nhưng chỉ lấy được 1 kết quả

**Nguyên nhân:** Pattern trước đó đã "xóa" phần văn bản cần match.

**Giải pháp:** Kiểm tra lại thứ tự các pattern trong mảng `regexPatterns`. Pattern nào match trước sẽ "ăn" phần văn bản đó trước.

### ❗ Lỗi 3: `postProcessValue` là `null`

**Nguyên nhân:** Item đó không match được (`matched: false`). Luôn nhớ `.filter(item => item.matched)` trước khi `.map()`.

```javascript
// ❌ Nguy hiểm: Có thể crash nếu có item không match
const values = matchObject.myPattern.map(item => item.postProcessValue.toUpperCase());

// ✅ An toàn
const values = matchObject.myPattern
  .filter(item => item.matched)
  .map(item => item.postProcessValue.toUpperCase());
```

### ❗ Lỗi 4: Named group không hoạt động

**Nguyên nhân:** Quên cú pháp `(?<tên>...)` thay vì `(tên)`.

```javascript
// ❌ Sai: Không có named group, không truy cập được bằng tên
matchPattern: /(\w+)@(\w+)/,

// ✅ Đúng: Named groups
matchPattern: /(?<user>\w+)@(?<domain>\w+)/,
// Trong localPostProcessingFunction: match.user, match.domain
```

### 💡 Mẹo 1: Debug bằng `id`

Khi không chắc kết quả trông như thế nào, dùng `id` làm `globalPostProcessingFunction` để xem raw `matchObject`:

```javascript
import { id } from 'pattern-flow';
// ...
globalPostProcessingFunction: id  // In ra toàn bộ matchObject thô
```

### 💡 Mẹo 2: Dùng `nameAndValuesGlobalPostProcessing` để kiểm tra nhanh

Trước khi viết `globalPostProcessingFunction` phức tạp, dùng hàm sẵn có để xem các giá trị đã được extract đúng chưa:

```javascript
import { nameAndValuesGlobalPostProcessing } from 'pattern-flow';
// ...
globalPostProcessingFunction: nameAndValuesGlobalPostProcessing
```

### 💡 Mẹo 3: Kiểm tra regex trước khi đưa vào config

Luôn test regex của bạn tại [regex101.com](https://regex101.com) (chọn chế độ ECMAScript / JavaScript) trước khi đưa vào file cấu hình. Điều này tiết kiệm rất nhiều thời gian debug.

### 💡 Mẹo 4: Dùng `textSplliter` cho văn bản có nhiều "bản ghi"

Nếu file của bạn chứa nhiều "bản ghi" lặp lại (nhiều email, nhiều biên bản họp, nhiều entry log...), hãy:
1. Dùng `textSplliter` để tách thành mảng các "bản ghi" riêng lẻ.
2. Chạy `extractorToPattern` trên từng bản ghi.
3. Gộp kết quả lại.

Cách này cho phép mỗi file cấu hình chỉ cần xử lý **một đơn vị dữ liệu**, đơn giản và dễ test hơn nhiều.

---

## 12. Tổng kết

PatternFlow là một framework nhỏ gọn nhưng mạnh mẽ, được xây dựng trên triết lý **tách biệt công cụ và cấu hình**. Với PatternFlow, bạn hoàn toàn có thể xây dựng các pipeline xử lý văn bản phức tạp chỉ bằng cách viết JS thuần.

**Những điều cần nhớ khi viết file cấu hình:**

| Quy tắc | Giải thích |
|---|---|
| Dùng named groups | `(?<tên>...)` để truy cập trong `localPostProcessingFunction` |
| Thứ tự pattern quan trọng | Pattern đầu tiên match và xóa phần văn bản trước |
| `single` vs `multi` | `single` = 1 kết quả, `multi` = tất cả kết quả |
| Luôn filter trước map | `.filter(i => i.matched).map(i => i.postProcessValue)` |
| Test regex riêng | Dùng regex101.com trước khi đưa vào cấu hình |
| Debug bằng `id` | Xem raw matchObject khi không chắc kết quả |

**Bảng tổng hợp các hàm Utility:**

| Hàm | Mục đích chính | Dùng ở đâu |
|---|---|---|
| `extractorToPattern` | Engine chính, chạy toàn bộ pipeline | Trong ứng dụng / CLI |
| `applyPattern` | Điền biến vào template string | `localPostProcessingFunction` |
| `textSplliter` | Chia văn bản lớn thành đoạn nhỏ | Trước khi gọi `extractorToPattern` |
| `fuzzyRecognize` | Tìm chuỗi giống nhất trong danh sách | `localPostProcessingFunction` |
| `id` | Hàm identity, dùng để debug hoặc làm fallback | `globalPostProcessingFunction` khi debug |
| `nameAndValuesGlobalPostProcessing` | Chuyển matchObject thành JSON đơn giản | `globalPostProcessingFunction` |
| `numberedPlaceholderRender` | Render `$1`, `$2` trong template | Nội bộ của `applyPattern` |
| `namePlaceholderRender` | Render `{{name}}` trong template | Nội bộ của `applyPattern` |

Chúc bạn xây dựng thành công các pipeline xử lý văn bản với PatternFlow! 🚀
