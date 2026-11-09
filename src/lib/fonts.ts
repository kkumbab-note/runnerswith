const PRETENDARD_FULL_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"

/**
 * 자체 글꼴(서브셋)에는 사이트 문구에 쓰인 글자만 있어요.
 * 방문자가 입력칸에 처음 들어갈 때만 Pretendard 원본 목록을 받아, 이름처럼 서브셋에 없는 글자도 같은 글꼴로 보여요.
 * 페이지를 열 때 받지 않아 첫 화면 계산을 늘리지 않아요.
 */
export function loadFullPretendardOnInput() {
  const onFocus = (e: FocusEvent) => {
    if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) return
    document.removeEventListener("focusin", onFocus)
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = PRETENDARD_FULL_CSS
    document.head.append(link)
  }
  document.addEventListener("focusin", onFocus)
}
