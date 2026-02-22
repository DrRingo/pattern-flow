/*
Vai trò của hàm textSplliter là chia một đoạn text thành các phần nhỏ, mỗi phần nhỏ sẽ được xử lý riêng biệt.
Thường sẽ được đưa vào hàm extractor để xử lý và thu về các dữ liệu cần thiết.
*/

export default function textSplliter(text, pattern, mode = 'normal', omitLastLine = false) {
  switch (mode) {
    case 'normal':
      return text.split(/(?<=[.!?])\s+/);

    case 'regex':
      return text.match(new RegExp(pattern, 'g')) || [];

    case 'beginEnd':
      const [beginPattern, endPattern] = pattern;
      const beginRegex = new RegExp(beginPattern, 'gm');
      const endRegex = new RegExp(endPattern, 'gm');
      const matches = [];
      let match;
      let lastIndex = 0;

      while ((match = beginRegex.exec(text)) !== null) {
        endRegex.lastIndex = beginRegex.lastIndex;
        const endMatch = endRegex.exec(text);
        if (endMatch) {
          let extractedText = text.slice(match.index, endMatch.index + endMatch[0].length);
          if (omitLastLine) {
            extractedText = extractedText.replace(/\r?\n[^\n]*$/, '');
          }
          matches.push(extractedText);
          lastIndex = endRegex.lastIndex;
          beginRegex.lastIndex = lastIndex;
        } else {
          matches.push(text.slice(match.index));
          break;
        }
      }

      return matches;

    default:
      throw new Error('Invalid mode! Expected "normal", "regex", or "beginEnd".');
  }
}


// Longer example text
const longText = "This is the first sentence. Here is another one! This is a longer paragraph of text. It contains multiple sentences. Some are short. Some are longer. This is the end of the paragraph.";

// Test normal mode with longer text
console.log("Normal mode (long text):", textSplliter(longText, null, 'normal'));

// Test regex mode with longer text
const longRegexPattern = '\\b\\w{5}\\b'; // Matches words with exactly 5 letters
console.log("Regex mode (long text):", textSplliter(longText, longRegexPattern, 'regex'));

// Test beginEnd mode with longer text
const longBeginEndPattern = ['\\bThis\\b', '\\bsentences?\\b']; // Matches text starting with 'This' and ending with 'sentence' or 'sentences'
console.log("BeginEnd mode (long text):", textSplliter(longText, longBeginEndPattern, 'beginEnd'));

// Test beginEnd mode with omitLastLine with longer text
console.log("BeginEnd mode with omitLastLine (long text):", textSplliter(longText, longBeginEndPattern, 'beginEnd', true));

// Example markdown text
const markdownText = `
# Heading 1
This is the first paragraph under heading 1.

# Heading 2
This is the first paragraph under heading 2.
This is the second paragraph under heading 2.

# Heading 3
This is the first paragraph under heading 3.
`;

// Test beginEnd mode with markdown text
const markdownBeginEndPattern = ['^#\\s.*', '(?=^#\\s.*|$)']; // Matches text starting with a heading and ending before the next heading or end of text
console.log("BeginEnd mode (markdown text):", textSplliter(markdownText, markdownBeginEndPattern, 'beginEnd', false));