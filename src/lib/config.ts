/**
 * 판매 채널 URL·연락처는 여기서만 바꾸면 돼요.
 * 비어 있는 값은 화면에서 "준비 중" 안내나 스마트스토어 홈으로 대신 연결돼요.
 */
export const CONFIG = {
  brand: "러너스위드",
  email: "hello@example.com",
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

export const productLink = (id: string) => CONFIG.productLinks[id] || CONFIG.links.store

/** public/ 아래 파일 경로를 배포 주소(base)에 맞춰 만들어요 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
