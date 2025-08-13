import stringSimilarity from 'string-similarity';

// hàm nhận diện fuzzy, tìm ra chuỗi liên quan nhất trong một list
// lúc đầu tôi định sử dụng hàm fuzzy thuần tuý để thực hiện, nhưng tôi nghĩ có nhiều cách khác sẽ hiệu quả hơn
// ví dụ như các khoảng cách metric,
// hoặc là vector database và sử dụng cosine similarity để tìm chuỗi liên quan nhất
export default function fuzzyRecognize(inputString, dataSet) {
  const match = stringSimilarity.findBestMatch(inputString, dataSet);
  return match.bestMatch.target;
}

