#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import extractorToPattern from './modules/extractor.js';

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Sử dụng: pattern-flow <đường_dẫn_config> <đường_dẫn_file_input>');
        console.error('Ví dụ:  pattern-flow ./templates/orgmodeTOC.js ./templates/content.org');
        process.exit(1);
    }

    const [configPath, inputPath] = args;

    // --- Tải tệp cấu hình ---
    const absoluteConfigPath = path.resolve(process.cwd(), configPath);
    if (!fs.existsSync(absoluteConfigPath)) {
        console.error(`Lỗi: Không tìm thấy tệp cấu hình tại '${absoluteConfigPath}'`);
        process.exit(1);
    }

    let config;
    try {
        // Sử dụng dynamic import() để tải ES module
        const configModule = await import(pathToFileURL(absoluteConfigPath).href);
        // Giả định config được export dưới dạng default hoặc một biến có tên
        config = configModule.default || Object.values(configModule)[0];
        if (typeof config !== 'object' || config === null) {
            throw new Error('Tệp cấu hình không export một đối tượng hợp lệ.');
        }
    } catch (error) {
        console.error(`Lỗi khi tải tệp cấu hình: ${absoluteConfigPath}`);
        console.error(error.message);
        process.exit(1);
    }

    // --- Đọc tệp đầu vào ---
    const absoluteInputPath = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(absoluteInputPath)) {
        console.error(`Lỗi: Không tìm thấy tệp đầu vào tại '${absoluteInputPath}'`);
        process.exit(1);
    }

    if (fs.statSync(absoluteInputPath).isDirectory()) {
        console.error(`Lỗi: Đường dẫn đầu vào '${absoluteInputPath}' là một thư mục. Vui lòng cung cấp một tệp tin.`);
        process.exit(1);
    }

    let inputText;
    try {
        inputText = fs.readFileSync(absoluteInputPath, 'utf-8');
    } catch (error) {
        console.error(`Lỗi khi đọc tệp đầu vào '${absoluteInputPath}':`);
        console.error(error.message);
        process.exit(1);
    }

    // --- Chạy engine và in kết quả ---
    try {
        const result = extractorToPattern(inputText, config);
        console.log(typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
    } catch (error) {
        console.error('Đã xảy ra lỗi trong quá trình xử lý:', error.message);
        process.exit(1);
    }
}

main();