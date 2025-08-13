/**
 * @file meetingMinutes.js
 * @description Cấu hình PatternFlow để phân tích file biên bản họp.
 * Mục tiêu: Trích xuất các thông tin chính và tạo tóm tắt công việc cho từng người.
 */

export const MeetingMinutesConfig = {
    nameOfExtractor: "MeetingMinutesParser",
    comment: "Phân tích biên bản họp, trích xuất người tham dự, quyết định, và các đầu việc.",

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
            matchPattern: /-\s*@(?<assignee>\w+)\s+(?<task>.+?)(?:\s*\(AI due:(?<dueDate>[\d-]+)\))?/g,
            localPostProcessingFunction: (match) => {
                return {
                    assignee: match.assignee,
                    task: match.task.trim(),
                    dueDate: match.dueDate || 'N/A' // Gán giá trị mặc định nếu không có hạn chót
                };
            }
        }
    ],

    globalPostProcessingFunction: (matchObject) => {
        // Lọc các kết quả khớp thành công trước khi xử lý để đảm bảo logic hoạt động đúng.
        const attendees = matchObject.attendees.filter(item => item.matched).map(item => item.postProcessValue);
        const decisions = matchObject.decisions.filter(item => item.matched).map(item => item.postProcessValue);
        const actionItems = matchObject.actionItems.filter(item => item.matched).map(item => item.postProcessValue);

        // Tạo một bản tóm tắt công việc theo từng người
        const tasksByAssignee = {};
        for (const user of attendees) {
            tasksByAssignee[user] = [];
        }
        for (const item of actionItems) {
            if (tasksByAssignee[item.assignee]) {
                tasksByAssignee[item.assignee].push({ task: item.task, dueDate: item.dueDate });
            }
        }

        return {
            summary: {
                attendees,
                decisions,
            },
            tasksByAssignee
        };
    }
};