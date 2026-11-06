export type ProductId = "daily-01" | "tempo-02" | "breeze-03" | "lane-04" | "pace-05" | "night-06"

export interface ProductImage {
  src: string
  alt: string
}

export interface Product {
  id: ProductId
  no: string
  category: { ko: string; en: string }
  name: string
  nameKo: string
  price: number
  summary: string
  spec: string
  badge?: string
  images: [ProductImage, ...ProductImage[]]
  features: string[]
  specs: [label: string, value: string][]
}

export const PRODUCTS: Product[] = [
  {
    id: "daily-01",
    no: "01",
    category: { ko: "러닝화", en: "Shoes" },
    name: "With Daily",
    nameKo: "데일리 트레이너",
    price: 139000,
    summary: "매일 5~10km, 발이 먼저 기억하는 부드러운 쿠션.",
    spec: "268g · 드롭 8mm · 230–300",
    badge: "Best",
    images: [
      { src: "images/p01-main.webp", alt: "오트밀 배경 위 오트밀 니트 어퍼와 크림색 미드솔의 데일리 러닝화, 뒤꿈치에 트랙 레드 힐 루프" },
      { src: "images/p01-d1.webp", alt: "니트 조직과 패딩 칼라, 트랙 레드 힐 루프가 보이는 데일리 러닝화 뒤꿈치 접사" },
      { src: "images/p01-d2.webp", alt: "해 뜨는 강변에서 러너가 데일리 러닝화의 끈을 묶는 손과 발 클로즈업" },
      { src: "images/p01-d3.webp", alt: "오트밀 배경 위에서 내려다본 데일리 러닝화 한 켤레, 끈과 넉넉한 앞코가 보이는 컷" },
    ],
    features: [
      "니트 어퍼가 발등을 부드럽게 감싸 쓸림이 적어요",
      "두툼한 크림 폼 미드솔로 매일 5~10km도 편안해요",
      "완만한 로커 형상이 다음 걸음을 자연스럽게 이어줘요",
      "힐 루프 덕분에 신고 벗기 쉬워요",
    ],
    specs: [
      ["무게", "268g (270mm 기준)"],
      ["드롭", "8mm · 힐 36mm / 앞 28mm"],
      ["사이즈", "230–300mm · 5mm 단위"],
      ["갑피", "엔지니어드 니트"],
      ["추천", "데일리 조깅 · 회복 러닝"],
    ],
  },
  {
    id: "tempo-02",
    no: "02",
    category: { ko: "러닝화", en: "Shoes" },
    name: "With Tempo",
    nameKo: "템포 레이서",
    price: 169000,
    summary: "가볍게 튀어 오르는 반발력, 기록을 줄이고 싶은 날에.",
    spec: "224g · 드롭 6mm · 나일론 플레이트",
    badge: "New",
    images: [
      { src: "images/p02-main.webp", alt: "붉은 육상 트랙의 흰 레인 라인 옆에 놓인 검정 메시 어퍼와 흰색 미드솔의 템포 러닝화 한 켤레" },
      { src: "images/p02-d1.webp", alt: "반투명 검정 메시 앞코와 흰 미드솔, 트랙 레드 앞창 러버가 보이는 템포 러닝화 접사" },
      { src: "images/p02-d2.webp", alt: "해 뜨는 육상 트랙 레인에서 템포 러닝화를 신고 힘차게 박차는 러너의 다리" },
      { src: "images/p02-d3.webp", alt: "오트밀 배경 위 템포 러닝화 측면, 앞꿈치 로커 형태의 높은 흰색 미드솔" },
    ],
    features: [
      "반투명 엔지니어드 메시로 가볍고 통기성이 좋아요",
      "높은 반발 폼과 나일론 플레이트가 탄력 있게 밀어줘요",
      "앞꿈치 로커가 빠른 페이스 전환을 도와요",
      "앞창 러버가 노면을 단단히 잡아줘요",
    ],
    specs: [
      ["무게", "224g (270mm 기준)"],
      ["드롭", "6mm · 힐 38mm / 앞 32mm"],
      ["사이즈", "230–300mm · 5mm 단위"],
      ["플레이트", "나일론 (카본 없음)"],
      ["추천", "템포런 · 인터벌 · 하프"],
    ],
  },
  {
    id: "breeze-03",
    no: "03",
    category: { ko: "의류", en: "Apparel" },
    name: "Breeze Singlet",
    nameKo: "브리즈 싱글렛",
    price: 49000,
    summary: "땀이 빠르게 마르는 메시 원단, 한여름 장거리용.",
    spec: "92g · 남녀공용 XS–2XL",
    images: [
      { src: "images/p03-main.webp", alt: "나무 옷걸이에 걸린 오프화이트 메시 러닝 싱글렛, 왼쪽 가슴에 작은 트랙 레드 점" },
      { src: "images/p03-d1.webp", alt: "미세 타공 메시 원단과 본딩 밑단, 흐릿한 트랙 레드 가슴 점이 보이는 싱글렛 접사" },
      { src: "images/p03-d2.webp", alt: "아침 강변을 달리는 러너가 오프화이트 메시 싱글렛을 입은 뒷모습" },
      { src: "images/p03-d3.webp", alt: "오트밀 배경 위에 접어 둔 오프화이트 싱글렛과 차콜 타월" },
    ],
    features: [
      "미세 타공 메시라 땀이 빠르게 말라요",
      "봉제선 없는 본딩 밑단으로 쓸림이 적어요",
      "넓은 암홀로 팔 스윙이 자유로워요",
      "92g 초경량, 한여름 장거리에 좋아요",
    ],
    specs: [
      ["무게", "92g (M 기준)"],
      ["소재", "재생 폴리에스터 메시"],
      ["사이즈", "XS–2XL · 남녀공용"],
      ["핏", "레귤러"],
      ["관리", "찬물 단독 손세탁"],
    ],
  },
  {
    id: "lane-04",
    no: "04",
    category: { ko: "의류", en: "Apparel" },
    name: "Lane Shorts 5″",
    nameKo: "레인 쇼츠",
    price: 59000,
    summary: "흔들림 없는 허리 포켓, 에너지 젤 두 개와 휴대폰까지.",
    spec: "5인치 · 이너 일체형 · S–XL",
    images: [
      { src: "images/p04-main.webp", alt: "오트밀 종이 위에 펼친 차콜 러닝 쇼츠, 뒤 지퍼 포켓에 에너지 젤이 꽂혀 있고 밑단에 트랙 레드 파이핑" },
      { src: "images/p04-d1.webp", alt: "에너지 젤이 꽂힌 뒤 지퍼 포켓과 트랙 레드 밑단 파이핑이 보이는 차콜 쇼츠 접사" },
      { src: "images/p04-d2.webp", alt: "아침 거리를 달리는 러너의 허리부터 무릎까지, 사이드 트임이 있는 차콜 러닝 쇼츠 착용 컷" },
      { src: "images/p04-d3.webp", alt: "나무 옷걸이에 걸린 차콜 러닝 쇼츠 정면, 허리 밴드와 드로코드, 트랙 레드 파이핑" },
    ],
    features: [
      "5인치 인심과 사이드 트임으로 보폭이 자유로워요",
      "뒤 지퍼 포켓에 젤 두 개와 휴대폰이 들어가요",
      "이너 브리프 일체형이라 따로 챙길 게 없어요",
      "밑단 파이핑으로 포인트를 줬어요",
    ],
    specs: [
      ["인심", "5인치 (13cm)"],
      ["포켓", "뒤 지퍼 1 · 사이드 2"],
      ["사이즈", "S–XL"],
      ["소재", "경량 우븐 · 이너 메시"],
      ["무게", "118g (M 기준)"],
    ],
  },
  {
    id: "pace-05",
    no: "05",
    category: { ko: "장비", en: "Gear" },
    name: "Pace Belt",
    nameKo: "페이스 러닝벨트",
    price: 32000,
    summary: "몸에 착 붙어 뛰어도 출렁이지 않는 슬림 벨트.",
    spec: "6.7인치 폰 수납 · 반사 로고",
    badge: "Crew Pick",
    images: [
      { src: "images/p05-main.webp", alt: "오트밀 종이 위 검정 슬림 러닝벨트, 반쯤 열린 지퍼 포켓에 스마트폰과 열쇠가 보이고 반사 스트립과 트랙 레드 지퍼 손잡이" },
      { src: "images/p05-d1.webp", alt: "검정 러닝벨트의 트랙 레드 지퍼 손잡이와 은색 반사 스트립 접사" },
      { src: "images/p05-d2.webp", alt: "새벽 거리를 달리는 러너의 허리에 밀착된 검정 슬림 러닝벨트 착용 컷" },
      { src: "images/p05-d3.webp", alt: "오트밀 배경 위에 고리 모양으로 세운 검정 러닝벨트, 휴대폰이 든 포켓과 반사 스트립" },
    ],
    features: [
      "몸에 밀착되는 신축 니트라 뛰어도 출렁이지 않아요",
      "6.7인치 휴대폰·열쇠·카드까지 수납해요",
      "반사 스트립으로 밤에도 잘 보여요",
      "한 손으로 여닫는 슬림 버클이에요",
    ],
    specs: [
      ["수납", "6.7인치 휴대폰까지"],
      ["높이", "8cm"],
      ["허리", "60–110cm 조절"],
      ["소재", "신축 니트 · 반사 테이프"],
      ["무게", "64g"],
    ],
  },
  {
    id: "night-06",
    no: "06",
    category: { ko: "장비", en: "Gear" },
    name: "Night Run Cap",
    nameKo: "나이트 런 캡",
    price: 35000,
    summary: "퇴근 후 야간 러닝을 위한 리플렉티브 러닝 캡.",
    spec: "48g · 접이식 챙 · 프리사이즈",
    images: [
      { src: "images/p06-main.webp", alt: "어두운 배경에서 플래시를 받아 챙 테두리 반사 파이핑이 은색으로 빛나는 검정 러닝 캡 클로즈업" },
      { src: "images/p06-d1.webp", alt: "검정 러닝 캡의 레이저 타공 패널과 챙 테두리 은색 반사 파이핑 접사" },
      { src: "images/p06-d2.webp", alt: "가로등이 켜진 밤거리를 달리는 러너의 뒷모습, 검정 러닝 캡의 반사 파이핑이 빛나는 컷" },
      { src: "images/p06-d3.webp", alt: "오트밀 배경 위 검정 러닝 캡 측면, 짧은 소프트 챙과 타공 패널, 뒤쪽 트랙 레드 조절 탭" },
    ],
    features: [
      "레이저 타공 패널로 열이 빠르게 빠져요",
      "챙 테두리 반사 파이핑이 밤에도 잘 보여요",
      "접이식 소프트 챙이라 주머니에 쏙 들어가요",
      "뒤 조절 탭으로 사이즈를 맞춰요",
    ],
    specs: [
      ["무게", "48g"],
      ["사이즈", "프리 (54–60cm)"],
      ["소재", "경량 폴리에스터"],
      ["챙", "접이식 소프트"],
      ["관리", "찬물 손세탁"],
    ],
  },
]

export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id)

export const formatPrice = (won: number) => won.toLocaleString("ko-KR")
