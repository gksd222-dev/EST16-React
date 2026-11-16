/**
 * HTML 문자열에서 태그를 제거하고 텍스트로 변환
 * 닫는 태그는 줄바꿈 2개로 처리
 */
export function convertHTMLToText(htmlString: string): string {
  return htmlString
    .replace(/<[^>]+>/g, (match: string) => {
      if (match.includes('/')) return '\n\n';
      return '';
    })
    // [수정] 아래 escapeHTML로 이스케이프한 문자를 편집 화면에서 원래 문자로 되돌림
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

// [수정] 사용자 입력을 그대로 태그로 감싸 dangerouslySetInnerHTML로 출력 → <img onerror> 등 XSS 가능. 특수문자 이스케이프 함수 추가
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 텍스트를 HTML 문자열로 변환 (줄바꿈 기준 → 태그 감싸기)
 */
export function convertTextToHTMLString(text: string, tagName: string = 'p'): string {
  return text
    .split('\n')
    .filter(Boolean)
    // [수정] `<${tagName}>${line}</${tagName}>` – 입력값 미이스케이프(XSS) → escapeHTML(line) 적용
    .map((line: string) => `<${tagName}>${escapeHTML(line)}</${tagName}>`)
    .join('');
}
