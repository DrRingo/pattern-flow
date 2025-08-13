import { nameAndValuesGlobalPostProcessing } from '../../modules/extractor.js';

/**
 * @file logParser.js
 * @description Cấu hình PatternFlow để phân tích file log của web server.
 * Mục tiêu: Trích xuất thông tin từ mỗi dòng log và tính toán thống kê.
 */

/**
 * Chuyển đổi tháng dạng chữ (Jan, Feb,...) sang dạng số (0, 1,...)
 * @param {string} monthStr - Tên tháng viết tắt bằng tiếng Anh.
 * @returns {number} - Số thứ tự của tháng (0-11).
 */
function getMonthFromString(monthStr) {
    return new Date(Date.parse(monthStr +" 1, 2012")).getMonth();
}

export const LogParserConfig = {
    nameOfExtractor: "WebServerLogParser",
    comment: "Phân tích các dòng log từ web server, tính toán thống kê.",

    regexPatterns: [
        {
            name: "logEntry",
            matchMode: "multi",
            // Regex để bóc tách các thành phần của một dòng log Apache phổ biến
            matchPattern: /^(?<ip>[\d.]+) - (?<user>[\w.-]+) \[(?<timestamp>(?<day>\d{2})\/(?<month>\w{3})\/(?<year>\d{4}):(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2}) (?<timezone>[+-]\d{4}))\] "(?<method>GET|POST|PUT|DELETE|HEAD) (?<url>.+?) HTTP\/[\d.]+" (?<status>\d{3}) (?<size>\d+|-)$/gm,
            
            localPostProcessingFunction: (match) => {
                // Chuyển đổi dữ liệu thô thành dạng có cấu trúc và đúng kiểu dữ liệu
                return {
                    ip: match.ip,
                    user: match.user,
                    // Tạo đối tượng Date từ các thành phần đã bóc tách
                    timestamp: new Date(
                        match.year, 
                        getMonthFromString(match.month), 
                        match.day, 
                        match.hour, 
                        match.minute, 
                        match.second
                    ),
                    request: {
                        method: match.method,
                        url: match.url,
                    },
                    response: {
                        status: parseInt(match.status, 10), // Chuyển status sang số
                        size: match.size === '-' ? 0 : parseInt(match.size, 10), // Chuyển size sang số
                    }
                };
            }
        }
    ],

    globalPostProcessingFunction: (matchObject) => {
        const entries = matchObject.logEntry.map(e => e.postProcessValue);
        const totalRequests = entries.length;
        const errorCount = entries.filter(e => e.response.status >= 400).length;
        const totalBytes = entries.reduce((sum, e) => sum + e.response.size, 0);

        // Trả về một đối tượng chứa cả dữ liệu thống kê và chi tiết các entry
        return {
            statistics: {
                totalRequests,
                errorCount,
                totalBytesTransferred: totalBytes,
            },
            entries: entries
        };
    }
};