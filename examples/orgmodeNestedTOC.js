/**
 * @file orgmodeNestedTOC.js
 * @description Cấu hình PatternFlow để trích xuất các heading lồng nhau (cấp 1 và 2)
 * từ file org-mode và tạo ra một mục lục có cấu trúc.
 */

export const OrgNestedTOCConfig = {
    nameOfExtractor: "orgmodeNestedHeading",
    comment: "Tách các heading cấp 1 và 2 trong orgmode và tạo mục lục có cấu trúc.",
    regexPatterns: [
        {
            name: "headings",
            matchMode: "multi",
            // Regex để bắt tất cả các dòng heading, bỏ qua các từ khóa trạng thái, priority, và các tag (:tag1:tag2:)
            matchPattern: /^(?<stars>\*+)\s+(?!(?:TODO|DONE|WAIT|PROJ|KILL|HOLD)\s)(?:\[#[A-Z]\]\s*)?(?<header>.+?)(?:\s+:(?:[^\s:]+:)+)?$/gm,
            defaultMatchValue: [],
            localPostProcessingFunction: (match) => {
                // Trả về một object chứa cấp độ (level) và nội dung (text) của heading
                return {
                    level: match.stars.length,
                    text: match.header.trim()
                };
            }
        }
    ],

    globalPostProcessingFunction: (matchObject) => {
        // Yêu cầu: Thêm "* " vào trước "Mục lục" để tạo heading
        const title = "* Mục lục";
        const separator = "--------------------";

        // Lấy danh sách các heading đã được xử lý, chỉ lấy cấp 1 và 2
        const processedHeadings = matchObject.headings
            .filter(h => h.matched && h.postProcessValue && (h.postProcessValue.level === 1 || h.postProcessValue.level === 2))
            .map(h => h.postProcessValue);

        if (processedHeadings.length === 0) {
            return `${title}\n${separator}\n(Không tìm thấy heading cấp 1 hoặc 2)\n${separator}`;
        }

        const tocLines = processedHeadings.map(heading => {
            // Yêu cầu: Tạo link org-mode đến heading gốc
            const link = `[[*${heading.text}]]`;

            if (heading.level === 1) {
                // Yêu cầu: Heading cấp 1 bắt đầu bằng "-"
                return `- ${link}`;
            } else if (heading.level === 2) {
                // Yêu cầu: Heading cấp 2 thụt vào 2 kí tự, bắt đầu bằng "+"
                return `  + ${link}`;
            }
            return null;
        }).filter(Boolean); // Lọc bỏ các giá trị null có thể phát sinh

        // Kết hợp tất cả các phần thành chuỗi kết quả cuối cùng
        return [title, separator, ...tocLines, separator].join('\n');
    }
};