/* Tôi rất băn khoăn về pattern được sử dụng ở đây, nên là regex hay dạng nào khác

- Nếu hàm extractorToPattern này hoàn thành, tôi cũng sẽ hoàn thành được mục tiêu tìm kiếm và định dạng lại văn bản theo regex mà tôi đã đặt ra mục tiêu từ trước (ví dụ: trích xuất Mục Lục của một văn bản markdown hoặc orgmode)

Thảo luận một chút về phương pháp regex extract:
- Theo đúng lý thuyết, regex rất cứng, nó không có dạng fuzzy, mà các dữ liệu nhập vào nhiều khi cũng không có tường minh. Nên nếu áp dụng regex một cách fuzzy, sẽ cho ra nhiều khả năng mà chương trình không thể tự quyết định được là nên hiểu tham số nhập vào nên như thế nào.
- Vì vậy, tôi quyết định sử dụng một quy trình thu hẹp hơn và ít fuzzy hơn. Quy định sẵn mọi thứ bên trong file cấu hình
- Hàm extractorToPattern sẽ mang tính tổng quát hoá cao, nhưng là tổng quát của cấu hình cài đặt, chứ không rộng mở quá, bởi vì thực tế tìm kiếm extract như thế này chỉ cho ra một trường hợp duy nhất. Nên nếu không gian tìm kiếm quá rộng mở, sẽ không còn có thể ra kết quả chính xác như mong muốn.
- Việc đưa ra một phương pháp tìm kiếm tường minh và đơn giản, sẽ thuận tiện cho người ghi file cấu hình sau này, cũng như tôi về sau không cần phải hiểu thêm về thuật toán phức tạp đằng sau của extractorToPattern

Vì vậy, phương pháp extract theo regex sẽ như sau:
- Quy định trước các regex pattern cần tìm kiếm

- Theo thứ tự của regex pattern cho trước, search tìm kiếm trên chuỗi đã cho. Lấy ra chuỗi đã search được, sau đó match trên chuỗi này. Các groups được đặt tên sẽ được lưu trữ riêng để xử lý về sau.
  + Bắt buộc phải đặt tên group để làm căn cứ xử lý ở localPostProcessingFunction
  + Nếu không match được, sẽ trả về defaultMatchValue
  + Xử lý localPostProcessingFunction cho các giá trị đã match
 
- Ngắt chuỗi đã cho ban đầu từ vị trí cuối cùng của search của regex pattern trước. Có 2 tuỳ chọn ở đây
  + linearMode (default): ngắt từ đầu chuỗi cho đến cuối search regex pattern
  + fuzzyMode: chỉ ngắt search regex pattern, sau đó thay bằng một chuỗi kí tự rất hiếm dùng, ví dụ chuỗi khối, để tránh trường hợp match chéo giữa các phần text nối với nhau.

- Tiếp tục tìm kiếm match và extract cho regex pattern tiếp theo. Cho đến regex pattern cuối cùng. Lưu ý: khi chuỗi đã cho không đủ thông tin, ở các regex pattern cuối nó chỉ còn là chuỗi rỗng, và khi đó không match được và sẽ trả về các giá trị mặc định defaultMatchValue

- Dựa trên các kết quả trả về của tất cả các pattern, đưa tất cả các kết quả vào một matchObject. Từ matchObject này sẽ xử lý thông qua globalPostProcessingFunction (một ví dụ thường thấy của globalPostProcessingFunction là áp nó vào một template người dùng viết sẵn)

Như vậy, một regex pattern sẽ có các tham số sau:
- name :: String -  tên của pattern này // bắt buộc, để xử lý sau này trên globalPostProcessingFunction, nó cũng là một tham chiếu trong matchValue để suy ra các biến số cần xử dụng cho globalPostProcessingFunction
- matchMode :: {single, multi} - khai báo riêng cho chế độ match của pattern này
- replaceMode :: {true, false} - chế độ replace giá trị match được, hoặc là không. Chức năng này hữu ích để trả về một chuỗi mới hoàn thiện theo đúng chức năng của một extractor.
- matchPattern :: regex - thông tin cần match từ môi trường // bắt buộc, nó cần có các groups được đặt tên để xử lý sau này
- defaultMatchValue :: List - giá trị mặc định nếu không match được, nó có dạng List, tuỳ vào các group cần match sẽ có số lượng default value tương ứng, nếu thiếu thì là giá trị mặc định global default // bắt buộc
- localPostProcessingFunction :: function - là một dạng của higher order function, nó xử lý thông tin của kết quả match trước khi trả về (ví dụ, trong một số trường hợp, match giá trị 01, nhưng muốn trả về một giá trị cộng thêm n nữa, chứ không hẳn muốn trả về giá trị đã match). Nó là một hàm có số lượng tham số động, số lượng tham số tuỳ thuộc vào số lượng group match của matchPattern ở trên. Hàm localPostProcessingFunction luôn nhận 1 tham số là thisMatch, nó là tập hợp tất cả các tên biến và giá trị của nó khi match được // bắt buộc, nó quyết định hình thức trả về. Có thể viết các hàm phụ trợ để thuận tiện hoá quá trình này.

Vậy một file config sẽ có các mục sau:
- name :: String - tên của file config // Tuỳ chọn
- comment :: String - ghi vài dòng ghi chú, thường là mục đích của file config này, nó làm gì và đối tượng định dạng file nó hướng đến
- matchMode :: {single, multi} - cách match một lần hay nhiều lần, điều này sẽ tạo ra chỉ 1 miền dữ liệu hay nhiều miền dữ liệu (ví dụ, muốn gởi email cho nhiều người thì nên làm multi option). Lưu ý là, nếu matchMode là multi thì bắt buộc searchMode sẽ là fuzzy. matchMode này khác nhau trong mỗi regexPattern
- replaceMode :: {true, false} - đây là giá trị mặc định ban đầu, nếu trong regexPatterns không được định nghĩa sẽ lấy giá trị này. Nếu true, thay thế bằng kết quả của localPostProcessingFunction, và dùng chuỗi đó tiếp tục trong các lần match tiếp theo. Nếu false, thay thế bằng giá trị mặc định và đi đến lần match tiếp theo
- Các regex pattern :: regexPatterns - Đây là một mảng, mỗi điểm dữ liệu là một regex pattern với đầy đủ các miền cấu hình như đã ghi ở trên
- globalPostProcessingFunction :: function - hàm xử lý văn bản sau cùng (ví dụ: uppercase toàn bộ các điểm dữ liệu, hoặc thêm vào các thông tin môi trường - ví dụ như giá chứng khoán hay thời tiết vào thời điểm chạy hàm, không thể định nghĩa điều này trong returnPattern được, hoặc gởi email cho những thông tin vừa được nhập vào, tất nhiên không thể xử lý email ở localPostProcessingFunction, đó là công việc được hoàn thành ở đây), hàm globalPostProcessingFunction lấy các tham số là list tham số các matchPattern, bao gồm name và regexPosition // Bắt buộc, nếu không có, nó sẽ làm hàm ID, trả về giá trị nguyên bản, tức là một matchObject.
*/

/* Như đã viết ở trên, các mục sau đây sẽ phải lấy ra từ file config. Điền sẵn các giá trị default nếu thiếu. Giá trị trả về là một chuỗi JSON có các miền sau.
- name
- comment
- matchMode (global)
- replaceMode (global)
- regexPatterns
  + name
  + matchMode (local)
  + replaceMode (local)
  + matchPattern
  + defaultMatchValue
  + localPostProcessingFunction(thisMatch)
- returnPattern
- globalPostProcessingFunction(matchObject)
*/

/*
Bàn về chức năng replace trong extractor
Một extractor cần phải replace được, nếu không nó chỉ dừng ở chức năng nhận diện mẫu.
Tuy nhiên, cân nhắc kĩ lưỡng cần phải nhồi nhét chức năng replace này ở đâu.

Có mấy loại option cho replace ở đây:
- none: không có chức năng replace. Đây cũng là cấu hình mặc định.
- 
*/

/* BÀN VỀ VẤN ĐỀ matchObject VÀ CẤU TRÚC DỮ LIỆU CỦA NÓ

matchObject chứa tất cả các kết quả trả về của chương trình dataextractor này. Nên nó phải thể hiện được kết quả và dễ dàng xuất ra các định dạng mong muốn, như:
- json (matchObject cũng là json nhưng phức tạp hơn, định dạng json pass qua cho người khác có thể dơn giản hơn)
- toml (từ json qua toml không có gì khó, nhưng điều cần thiết là nó đẹp và dễ đọc)
- recfiles (đây là định dạng tôi sử dụng thường xuyên để lưu trữ dữ liệu của mình)

Như vậy, thiết kế của matchObject phải thỏa mãn các tiêu chí sau:
- Dễ dàng chuyển đổi sang các định dạng khác
- Bởi vì có nhiều tùy chọn match khác nhau, thậm chí trong tương lai, nhu cầu search và match cũng nảy sinh những yêu cầu mới. Nên định dạng của matchObject phải có tính đảm bảo tương lai.
- Có tính chất trung tính và tường minh nhất có thể.
- Thống nhất về tên các miền dữ liệu, kể cả trong tương lai nhu cầu có thay đổi. Việc đặt tên mang tính chất gợi nhớ cao, và tránh gây hiểu lầm cho việc mở rộng tính năng về sau.
- Có đầy đủ các miền cần thiết để phục vụ cho hàm globalPostProcessingFunction, xử lý toàn bộ thông tin cho các nhu cầu chưa được nảy sinh.

Như vậy, matchObject có cấu trúc như sau
[
  - regexPattern name (tên của từng regex pattern)
    [
    + matched: true | false (xác nhận có match được hay không)
    + match (giá trị match được toàn cục)
    + groups
      - group 1 name: giá trị của group 1
      - group 2 name: giá trị của group 2
      - ...
    + postProcessingValue (giá trị trả về của hàm localPostProcessingFunction)
    + index (vị trí đầu tiên được match)
    + input (chuỗi ban đầu)

    + match lần 2
    + ...
    ]

  - regexPattern name 2
  - ...
]

Bởi vì matchObject có cấu trúc riêng, nên nhiều khi tôi không muốn cho người khác biết cấu trúc dữ liệu này, và cũng để đảm bảo tính tương lai, tức là khi cấu trúc dữ liệu matchObject thay đổi trong tương lai, mọi thứ vẫn hoạt động tốt. Tôi sẽ viết một loạt các hàm hoạt động trên matchObject này, từ đó sẽ là cơ sở cho các hàm globalPostProcessingFunction hoạt động dễ dàng hơn, cũng như dành cho những người khác không biết về matchObject cũng viết được hàm globalPostProcessingFunction một cách thuận tiện nhất.

Các hàm chạy trên matchObject cần thiết:
- Hàm iter qua tất các các giá trị extract được, kèm với name để xử lý phù hợp.
- Hàm tìm một hoặc nhiều các giá trị đã extract dựa trên name.
- apply pattern đối với matchObject
*/

// ----------- matchObject companion functions ---------------

// các ý tưởng về hàm xuất. Từ đối tượng matchObject, xuất ra các định dạng khác nhau:
// - JSON đẹp
// - CSV
// - yaml
// - toml

function applyPatternForMatchObject(pattern, matchObject) {
  // chưa hoàn thành 
  return
}

//



/* ---------------------------------------------------------------- */


// ----------------------- Utility functions --------------------------------

// Hàm ID trả về tất cả các kết quả mà nó nhận được
// Hàm rất hữu ích trong việc tổng quát hóa quy trình làm việc giữa các hàm với nhau
export function id(arg) {
  return arg;
}

// Hàm nameAndValuesGlobalPostProcessing, chạy trên đối tượng matchObject, xuất ra một json gồm các đối tượng tên các đối tượng match được và giá trị match. dạng đẹp, để có thể chạy trên các hàm sau dód mà không phải biết cấu trúc của matchObject.
// Kết quả trả về có dạng json, cấu trúc như sau:
// - Name 1: [value1, value2, ...]
// - Name 2: [value1, value2, ...]
// - ...
export function nameAndValuesGlobalPostProcessing(matchObject) {
  const result = {};

  Object.keys(matchObject).forEach(patternName => {
    result[patternName] = matchObject[patternName]
      .filter(match => match.matched)
      .map(match => match.postProcessValue || match.match);
  });

  return result;
}


function configReader(configFile) {
  // chưa hoàn thành 
}



// Hàm matchAllToJSON có ích trong việc lưu trữ các giá trị dưới dạng json
function matchAllToJSON(regex, str) {
  // Xử lý thêm cờ "g" vào regex. Thử có cờ 'g' sẵn bên trong regex không, nếu không thì thêm vào
  let regexWithG = regex.flags.includes('g') ? regex : new RegExp(regex.source, regex.flags + 'g');

  const matches = str.matchAll(regexWithG);

  // Chuyển iterator thành mảng các đối tượng JSON chi tiết
  const jsonMatches = Array.from(matches, match => (
    {
      match: match[0],
      groups: match.groups,
      index: match.index,
      // không chuyển thông tin input vào nữa, vì nhiều khi đó là một file văn bản rất dài, mỗi lần match là như copy toàn bộ file vào luôn
      // input: match.input
    }));

  return jsonMatches;
}

/*
Suy nghĩ về vai trò của các hàm wrapper
- Nó mở rộng hàm gốc như thế nào
- Giả sử hàm gốc không do tôi viết, một hàm wrapper sẽ giúp tôi tuỳ chỉnh theo nhu cầu của mình như thế nào
- 
*/

// hàm localPostProcessWrapper có vai trò hỗ trợ localPostProcessingFunction
// - tự động sinh một Object gồm name và match bên trong một regexPattern.
// - không bắt buộc hàm localPostProcessingFunction phải khai báo thisMatch.
// - tự động bắt lỗi nhỏ và bỏ qua
function localPostProcessWrapper(localPostProcessingFunction, matchData) {
  return localPostProcessingFunction(matchData);
}


// hàm globalPostProcessingWrapper có vai trò nhận tham số là matchObject và globalPostProcessingFunction của người dùng định nghĩa để tạo thuận lợi nhất trong việc viết globalPostProcessingFunction của người dùng 
// Ví dụ: không bắt buộc định nghĩa matchObject bên trong globalPostProcessingFunction
// - Tự động match lỗi nhỏ và bỏ qua (nếu được, trình của tôi chưa đến mức này)
function globalPostProcessingWrapper() {

}
// ---------------------- End of Utility functions --------------------------


export default function extractorToPattern(textToExtract, config, errors = []) {

  // đặt một biến lấy giá trị của textToExtract để thay đổi nó sau khi search and match
  let mainText = textToExtract;

  let defaultSeparator = "\/\/\/";

  // Phần này xử lý các config được nhập vào và merge nó với các giá trị mặc định nếu không có
  // giá trị mặc định được quy định như sau
  let {
    nameOfExtractor = "nonameSearch",
    comment = "not yet have any comment",
    matchMode = "single",
    regexPatterns = [{
      name: "nonamePattern",
      matchMode: "single",
      matchPattern: / /g,
      defaultMatchValue: "",
      localPostProcessingFunction: id
    }],
    globalPostProcessingFunction = nameAndValuesGlobalPostProcessing
  } = config;

  // matchObject là một đối tượng để quản lý các đối tượng match được trong các lần search and match
  // nó là một list gồm các đối tượng có 3 thành phần: regexPosition, name, và matchString
  // matchObject đóng vai trò quyết định để tạo thành kết quả cho returnPattern, nhờ liên tục chạy lệnh search and replace các đối tượng của matchObject lên trên returnPattern
  let matchObject = {};

  // duyệt qua các regexPatterns đã định nghĩa và tìm các matching
  for (let i = 0; i < regexPatterns.length; i++) {
    const patternConfig = regexPatterns[i];
    // Khởi tạo đối tượng json mới cho regexPattern
    matchObject[patternConfig.name] = [];

    // Lấy tất cả các kết quả khớp trước.
    // Cách làm này tránh được lỗi `lastIndex` của regex toàn cục (global) khi gọi `.test()` trước,
    // vốn là nguyên nhân gây ra lỗi bỏ sót kết quả khớp đầu tiên.
    const allMatches = matchAllToJSON(patternConfig.matchPattern, mainText);

    if (allMatches.length > 0) {
      // Nếu có kết quả khớp...
      // Gán trạng thái `matched: true` cho tất cả các kết quả.
      allMatches.forEach(match => match.matched = true);

      const currentMatchMode = patternConfig.matchMode || matchMode;

      switch (currentMatchMode) {
        case 'single':
          // Chỉ lấy kết quả đầu tiên.
          matchObject[patternConfig.name].push(allMatches[0]);

          // Để chỉ thay thế lần xuất hiện đầu tiên, chúng ta cần một regex không có cờ 'g'.
          const singleReplaceRegex = new RegExp(patternConfig.matchPattern.source, patternConfig.matchPattern.flags.replace('g', ''));
          mainText = mainText.replace(singleReplaceRegex, defaultSeparator);
          break;
        case 'multi':
          // Lấy tất cả các kết quả.
          matchObject[patternConfig.name] = allMatches;

          // Thay thế tất cả các kết quả khớp trong văn bản.
          const matchPatternObj = patternConfig.matchPattern instanceof RegExp ? patternConfig.matchPattern : new RegExp(patternConfig.matchPattern);
          const multiReplaceRegex = new RegExp(matchPatternObj.source, (matchPatternObj.flags || '').replace('g', '') + 'g');
          mainText = mainText.replace(multiReplaceRegex, defaultSeparator);
          break;
        default:
          throw new Error(`Invalid matchMode: "${currentMatchMode}"! Expected "single" or "multi".`);
      }

    } else {
      // Nếu không có kết quả nào, đẩy vào một bản ghi mặc định.
      matchObject[patternConfig.name].push({
        matched: false,
        index: -1,
        groups: {},
        match: patternConfig.defaultMatchValue || ""
      });
    }

    // Xử lý localPostProcessingFunction cho các đối tượng vừa match được
    // Tạo một hàm con để tránh xung đột các scope 
    // Do có chế độ multi, nên phải lướt qua một vòng các match vừa có, kể cả trường hợp không match được
    for (let j = 0; j < matchObject[regexPatterns[i].name].length; j++) {
      // chạy lại một vòng các kết quả đã match được trong pattern này
      const currentItem = matchObject[regexPatterns[i].name][j];

      if (currentItem.matched) {
        let thisMatch = {};

        // gán giá trị mặc định vào đối tượng thisMatch
        thisMatch = {
          ...thisMatch,
          matched: currentItem.matched,
          index: currentItem.index,
          match: currentItem.match,
        };

        // *** TÍNH NĂNG MỚI: XỬ LÝ SUB-PATTERNS (NESTED EXTRACTION) ***
        const patternConfig = regexPatterns[i];
        if (patternConfig.subPatterns && patternConfig.contentGroup && thisMatch[patternConfig.contentGroup]) {
          const contentToRecurse = thisMatch[patternConfig.contentGroup];
          const subConfig = {
            ...config, // Kế thừa config cha
            regexPatterns: patternConfig.subPatterns
          };
          // Gọi đệ quy extractor trên nội dung của group đã chỉ định
          // Lỗi từ các lần gọi đệ quy cũng sẽ được thu thập
          const subResult = extractorToPattern(contentToRecurse, subConfig, errors);
          currentItem.children = subResult;
        }

        // Khai báo lại các giá trị đã match trong groups của từng match, để sử dụng cho hàm localPostProcessingFunction
        Object.entries(currentItem.groups || {}).forEach(([key, value]) => {
          thisMatch[key] = value;
        });
        // ---- Xử lý xong đối tượng tạm thời thisMatch


        // kiểm tra có khai báo hàm localPostProcessingFunction không, nếu không gán cho nó hàm ID
        let currentLocalPostProcessingFunction = regexPatterns[i].localPostProcessingFunction || id;

        // Giờ là lúc áp kết quả của localPostProcessingFunction vào matchObject
        currentItem.postProcessValue = currentLocalPostProcessingFunction(thisMatch);
      } else {
        // Đối với các mục không khớp, gán một giá trị mặc định để tránh lỗi ở globalPostProcessingFunction
        currentItem.postProcessValue = null;
      }
    }
  }

  // Xử lý globalPostProcessingFunction
  let finalResult = {};
  if (globalPostProcessingFunction) {
    finalResult = globalPostProcessingFunction(matchObject);
  }

  // Kết quả cuối cùng sau khi xử lý
  return finalResult;


}


// -----------------------------------------------------------------------------
// Sau đây là phần test module này

// Ví dụ mẫu về json config 
// const configString = {
//     nameOfExtractor: "date and hour extractor",
//     comment: "Thử một cái này để xem có hoạt động tốt hay không",
//     matchMode: "single",
//     regexPatterns: [
//         {
//             name: "emailReg",
//             matchMode: "multi",
//             matchPattern: /@(?<email>\w+)/,
//             defaultMatchValue: "",
//             localPostProcessingFunction: (thisMatch) => {
//                 return applyPattern("fsl {{match}}", thisMatch)
//             }
//         },
//         {
//             name: "hourExtractor",
//             matchMode: "multi",
//             matchPattern: /h(?<hour>\d{1,2})(?<minutes>\d{1,2})/,
//             localPostProcessingFunction: (thisMatch) => { return applyPattern("baya giowf laf {{hour}} vaf {{minutes}}", thisMatch) }
//         }
//     ],
//     globalPostProcessingFunction: id
// }


// console.log(JSON.stringify(extractorToPattern("@binhha 1412 h0913 jfsljfl h1312 jlj", configString), null, 2))


// Example configuration using the new globalPostProcessingFunction
// const configString = {
//   nameOfExtractor: "exampleExtractor",
//   comment: "Example extractor for search and replace",
//   matchMode: "single",
//   regexPatterns: [
//     {
//       name: "emailReg",
//       matchMode: "multi",
//       matchPattern: /@(?<email>\w+)/,
//       defaultMatchValue: "",
//       localPostProcessingFunction: (thisMatch) => {
//         return `email:${thisMatch.email}`;
//       }
//     },
//     {
//       name: "hourExtractor",
//       matchMode: "multi",
//       matchPattern: /h(?<hour>\d{1,2})(?<minutes>\d{1,2})/,
//       localPostProcessingFunction: (thisMatch) => {
//         return `hour:${thisMatch.hour}, minutes:${thisMatch.minutes}`;
//       }
//     }
//   ],
//   // globalPostProcessingFunction: nameAndValuesGlobalPostProcessing
// };

// // Example input text with multiple matches for email and hours
// const inputText = "@john 1412 h0913 @doe ";

// // Call extractorToPattern with the input text and config
// const result = JSON.stringify(extractorToPattern(inputText, configString), null, 2);
// console.log(result);