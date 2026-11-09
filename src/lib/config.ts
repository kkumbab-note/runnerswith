/**
 * 판매 채널 URL·연락처는 여기서만 바꾸면 돼요.
 * 비어 있는 값은 화면에서 "준비 중" 안내나 스마트스토어 홈으로 대신 연결돼요.
 */
export const CONFIG = {
  brand: "러너스위드",
  email: "hello@example.com",
  /** 대표 주소. 구조화 데이터·sitemap.xml에 쓰여요 (index.html의 canonical·og:url과 같게 맞춰주세요) */
  siteUrl: "https://kkumbab-note.github.io/runnerswith/",
  analytics: {
    /** GA4 측정 ID(G-XXXXXXX). 넣으면 페이지 로드 후 gtag.js가 붙고 주요 행동이 기록돼요. 비워두면 아무것도 보내지 않아요 */
    ga4Id: "",
  },
  links: {
    store: "https://smartstore.naver.com/your-store",
    kakao: "https://pf.kakao.com/_yourChannel",
    kakaoChat: "https://pf.kakao.com/_yourChannel/chat",
    instagram: "https://www.instagram.com/your_account",
    youtube: "https://www.youtube.com/@your_channel",
    strava: "https://www.strava.com/clubs/your_club",
    blog: "https://blog.naver.com/your_blog",
    bizCheck: "https://www.ftc.go.kr/bizCommPop.do?wrkr_no=0000000000",
    terms: "",
    privacy: "",
    en: "",
  },
  /** 제품별 판매 페이지. 비워두면 스마트스토어 홈으로 연결돼요 */
  productLinks: {
    "daily-01": "https://smartstore.naver.com/your-store/products/0000000001",
    "tempo-02": "https://smartstore.naver.com/your-store/products/0000000002",
    "breeze-03": "https://smartstore.naver.com/your-store/products/0000000003",
    "lane-04": "https://smartstore.naver.com/your-store/products/0000000004",
    "pace-05": "https://smartstore.naver.com/your-store/products/0000000005",
    "night-06": "https://smartstore.naver.com/your-store/products/0000000006",
  } as Record<string, string>,
  /** 사업자 정보 (전자상거래법 표시 항목) */
  business: [
    ["상호", "[상호명]"],
    ["대표", "[대표자명]"],
    ["사업자등록번호", "[000-00-00000]"],
    ["통신판매업 신고", "[제0000-서울○○-0000호]"],
    ["주소", "[사업장 주소]"],
    ["고객센터", "[000-0000-0000] · 평일 10:00–17:00"],
    ["개인정보보호책임자", "[담당자명]"],
    ["호스팅 제공자", "[호스팅 업체명]"],
  ] as const,
} as const

export type LinkKey = keyof typeof CONFIG.links

/** 구매 링크를 누른 위치. 스마트스토어 통계·GA4에서 어느 버튼으로 들어왔는지 구분해요 */
export type Placement = "card" | "detail" | "summary" | "how-to-buy"

/**
 * 스마트스토어 링크에 유입 경로를 붙여요.
 * nt_* 는 스마트스토어 센터 > 통계 > 마케팅 분석(사용자 정의 채널)이, utm_* 는 GA4가 읽어요.
 */
export function withTracking(url: string, placement: Placement) {
  try {
    const u = new URL(url)
    if (!u.hostname.endsWith("smartstore.naver.com")) return url
    const params: Record<string, string> = {
      nt_source: "runnerswith_web",
      nt_medium: "homepage",
      nt_detail: placement,
      utm_source: "runnerswith_web",
      utm_medium: "homepage",
      utm_campaign: "site",
      utm_content: placement,
    }
    for (const [key, value] of Object.entries(params)) u.searchParams.set(key, value)
    return u.toString()
  } catch {
    return url
  }
}

/** 제품 판매 페이지. 누른 위치를 주면 유입 경로가 붙어요 */
export const productLink = (id: string, placement?: Placement) => {
  const url = CONFIG.productLinks[id] || CONFIG.links.store
  return placement ? withTracking(url, placement) : url
}

export const storeLink = (placement: Placement) => withTracking(CONFIG.links.store, placement)

/** public/ 아래 파일 경로를 배포 주소(base)에 맞춰 만들어요 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
