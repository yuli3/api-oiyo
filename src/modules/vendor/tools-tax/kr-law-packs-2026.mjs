// GENERATED from tools-oiyo src/lib/kr-law-packs-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 법령 길잡이 분야 팩: 관세·지식재산·감정평가·부동산 중개 (2026-11-17).
// WHY: 세운 "지식전문가를 더 늘릴 수 있어야 해요". 새 분야는 이 파일 같은 팩 하나(PACK)를 만들고
//   kr-expert-guide-2026.ts의 PACKS에 넣으면 화면(LawGuide)·스킬 references·MCP(api-oiyo)가 함께 늘어나요.
//   새 분야 체크리스트: ① DomainId에 id 추가 ② Profession(자격법 업무·독점·유사명칭 조문) ③ 조문 색인(확인한 조문만)
//   ④ 주제(결론을 바꾸는 질문, 기한 규칙, 경고, 맡길 일, 서류) ⑤ SCOPE_MATRIX 줄 ⑥ src/data/law-guides.ts 페이지
//   ⑦ src/data/pro-competencies.ts 직업 ⑧ skills·api 재생성(build-law-guide-skill.mjs, api sync-tools-tax.mjs).
// 조문 확인(2026-11-17): 관세사법 제2·3·12·25조(nepla.ai), 변리사법 제2·21·22조(KLRI 영문 목차), 감정평가법 제10·21·22조(nepla.ai),
//   공인중개사법 제8·9·18·25·30·32·33조(nepla.ai). 관세법·특허법·토지보상법·부동산공시법·거래신고법 기한은 널리 알려진 현행 규정이고,
//   원문 링크를 함께 줘요.
// 경계: 관세사·변리사·감정평가사·공인중개사 명칭을 쓰지 않고, 통관 대행·출원 대리·감정평가·중개를 하지 않아요.
                                                                                                     

                          
                         
                      
                  
                                                                                                        
 

const s = (id        , domain          , law        , article        , title        , plain        , keywords          )          => ({ id, domain, law, article, title, plain, keywords });
const yes = (v         ) => v === true || v === "yes";
const num = (v         ) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
const won = (n        ) => `${Math.round(n).toLocaleString("ko-KR")}원`;

/* ---------- 관세 ---------- */

const customs          = {
  profession: {
    domain: "customs",
    name: "관세·통관 법령 길잡이",
    licensed: "관세사",
    act: "관세사법",
    scopeCite: { law: "관세사법", article: "제2조" },
    scope: ["수출입 신고 등 통관 절차의 대리", "관세 납부, 세액 보정·경정청구와 관세 관련 불복(이의신청·심사청구·심판청구)의 대리", "품목분류·관세평가·원산지 확인 등 통관 관련 상담·자문"],
    exclusive: [
      { text: "관세사·관세법인·통관취급법인이 아니면 남의 의뢰를 받아 통관업을 할 수 없어요.", cite: { law: "관세사법", article: "제3조" } },
      { text: "관세사 이름·자격증을 빌려주거나 빌려 쓸 수 없어요.", cite: { law: "관세사법", article: "제12조" } },
      { text: "관세사·관세법인이나 비슷한 명칭을 쓸 수 없어요.", cite: { law: "관세사법", article: "제25조" } },
    ],
    guideDoes: ["납부·보정·경정청구·불복 기한을 날짜로 계산해요.", "해외직구 면세 기준과 합산과세를 설명해요.", "세관이나 관세사에게 가져갈 서류와 질문을 정리해요."],
    guideDoesNot: ["수입신고·경정청구서를 대신 작성·제출하지 않아요.", "품목분류(HS 코드)를 확정하지 않아요.", "특정 관세사를 소개하지 않아요."],
    handOffWhen: ["세관 조사·추징 통지를 받았을 때", "품목분류·관세평가가 쟁점일 때", "FTA 원산지 검증을 받을 때"],
    freeHelp: [
      { name: "관세청 고객지원센터", how: "☎ 125", what: "통관·관세 일반 상담, 밀수 신고" },
      { name: "유니패스(UNI-PASS)", how: "unipass.customs.go.kr", what: "통관 진행 조회, 전자 신고" },
      { name: "FTA 종합지원센터", how: "☎ 1380", what: "중소기업 FTA 원산지 무료 컨설팅" },
    ],
  },
  statutes: [
    s("cu-9", "customs", "관세법", "제9조", "관세의 납부기한", "수입자가 신고하고 내는 관세(신고납부)는 납세신고를 수리한 날부터 15일 안에 내요.", ["납부기한", "15일", "관세 납부", "수입신고 수리"]),
    s("cu-38-2", "customs", "관세법", "제38조의2", "보정", "신고납부한 세액이 모자라거나 잘못된 것을 알면 신고납부한 날부터 6개월 안에 보정을 신청할 수 있어요. 보정하면 가산세 없이 이자 성격의 보정이자만 붙어요.", ["보정", "6개월", "세액 정정", "덜 냈"]),
    s("cu-38-3", "customs", "관세법", "제38조의3", "관세 수정신고·환급(경정)", "보정기간이 지나면 수정신고를 하고, 더 낸 세금은 최초 신고납부한 날부터 5년 안에 경정을 청구해 돌려받을 수 있어요.", ["관세 경정청구", "관세 환급", "더 낸 관세", "관세 수정신고"]),
    s("cu-94", "customs", "관세법", "제94조, 시행규칙 제45조", "소액물품 등의 면세", "자가사용 물품으로 물품가격이 미화 150달러(미국에서 오는 물품은 200달러) 이하이면 관세가 면제돼요. 같은 날 들어온 물품은 합쳐서 보기도 해요.", ["해외직구", "직구 면세", "150달러", "200달러", "합산과세", "자가사용"]),
    s("cu-119", "customs", "관세법", "제119조·제121조·제132조", "관세 불복(이의신청·심사청구·심판청구)", "관세 처분에 이의가 있으면 처분을 안 날(통지를 받은 날)부터 90일 안에 세관에 이의신청하거나, 관세청에 심사청구, 조세심판원에 심판청구를 할 수 있어요.", ["관세 불복", "이의신청", "심사청구", "심판청구", "90일", "관세 추징"]),
    s("cbl-2", "customs", "관세사법", "제2조·제3조", "관세사의 직무와 통관업 제한", "관세사는 의뢰를 받아 통관 신고, 불복 대리, 품목분류·관세평가 상담을 해요. 관세사·관세법인·통관취급법인이 아니면 남의 의뢰로 통관업을 할 수 없어요.", ["관세사", "통관 대행", "통관업"]),
    s("cbl-25", "customs", "관세사법", "제25조", "유사명칭 사용 금지", "관세사가 아니면 관세사·관세법인이나 비슷한 명칭을 쓸 수 없어요.", ["유사명칭", "관세사 명칭"]),
  ],
  topics: [
    {
      id: "customs-direct",
      domain: "customs",
      label: "해외직구 물건에 세금이 붙을지 확인해요",
      plain: "자가사용 물품은 물품가격 150달러(미국발 200달러) 이하면 관세가 면제돼요. 같은 날 들어온 물건은 합쳐서 판단할 수 있고, 판매할 물건이면 면세가 안 돼요.",
      questions: [
        { key: "price", ask: "물품가격은 미화로 얼마인가요(배송비 제외)?", why: "면세 기준이 150달러(미국발 200달러)예요.", kind: "number", required: true },
        { key: "fromUs", ask: "미국에서 보낸 물건인가요?", why: "한미 FTA에 따라 미국발은 기준이 200달러예요.", kind: "yesno", required: true },
        { key: "resale", ask: "되팔 생각이 있나요?", why: "판매용은 자가사용이 아니라 면세 대상이 아니에요.", kind: "yesno", required: true },
        { key: "sameDay", ask: "같은 날 들어오는 다른 직구 물건이 있나요?", why: "같은 날 입항한 물건은 합쳐서 기준을 넘는지 볼 수 있어요.", kind: "yesno" },
      ],
      statutes: ["cu-94", "cu-38-3"],
      deadlines: [],
      tools: [],
      flags: (a         ) => {
        const f         = [];
        const price = num(a.price);
        const limit = yes(a.fromUs) ? 200 : 150;
        if (yes(a.resale)) f.push({ tone: "warn", text: "되팔 물건은 자가사용이 아니어서 소액 면세를 받을 수 없고, 반복하면 밀수입·관세포탈로 처벌될 수 있어요.", cite: "관세법 제94조" });
        else if (Number.isFinite(price)) f.push(price <= limit ? { tone: "good", text: `물품가격 ${price}달러는 면세 기준 ${limit}달러 이하예요.`, cite: "관세법 시행규칙 제45조" } : { tone: "warn", text: `물품가격 ${price}달러는 면세 기준 ${limit}달러를 넘어 관세·부가세가 붙어요.`, cite: "관세법 제94조" });
        if (yes(a.sameDay)) f.push({ tone: "warn", text: "같은 날 들어오는 물건은 합쳐서 면세 기준을 넘는지 볼 수 있어요. 나눠 사도 합산될 수 있어요.", cite: "관세법 시행규칙 제45조" });
        return f;
      },
      handOff: () => null,
      documents: ["주문 내역(물품가격·배송비)", "운송장 번호", "개인통관고유부호"],
    },
    {
      id: "customs-correct",
      domain: "customs",
      label: "수입 관세를 잘못 냈어요(보정·경정·불복)",
      plain: "덜 냈으면 신고납부일부터 6개월 안에 보정, 더 냈으면 5년 안에 경정청구를 해요. 세관이 추징했으면 통지를 받은 날부터 90일 안에 불복할 수 있어요.",
      questions: [
        { key: "situation", ask: "어떤 상황인가요?", why: "덜 낸 경우·더 낸 경우·추징받은 경우 쓰는 절차가 달라요.", kind: "choice", required: true, options: [{ value: "under", label: "덜 냈어요" }, { value: "over", label: "더 냈어요" }, { value: "assessed", label: "세관이 추징(경정)했어요" }] },
        { key: "payDate", ask: "처음 신고납부한 날은 언제인가요?", why: "보정 6개월, 경정청구 5년이 이날부터 시작해요.", kind: "date", required: true, askIf: (a) => a.situation !== "assessed" },
        { key: "noticeDate", ask: "추징 통지를 받은 날은 언제인가요?", why: "불복 90일이 이날부터 시작해요.", kind: "date", required: true, askIf: (a) => a.situation === "assessed" },
        { key: "amount", ask: "차이 나는 세액은 얼마인가요?", why: "금액이 크면 관세사 상담을 권해요.", kind: "number", unit: "won" },
      ],
      statutes: ["cu-9", "cu-38-2", "cu-38-3", "cu-119"],
      deadlines: [
        { id: "correct", label: "보정 신청", from: "payDate", months: 6, cite: "관세법 제38조의2", when: (a) => a.situation === "under" },
        { id: "refund", label: "경정청구(환급)", from: "payDate", years: 5, cite: "관세법 제38조의3", when: (a) => a.situation === "over" },
        { id: "appeal", label: "이의신청·심사청구·심판청구", from: "noticeDate", days: 90, cite: "관세법 제121조·제132조", when: (a) => a.situation === "assessed" },
      ],
      tools: [],
      flags: (a         ) => {
        const f         = [];
        if (a.situation === "under") f.push({ tone: "info", text: "보정기간(6개월) 안에 스스로 고치면 가산세 대신 보정이자만 붙어요. 지나면 수정신고를 하고 가산세가 붙을 수 있어요.", cite: "관세법 제38조의2·제42조" });
        if (a.situation === "assessed") f.push({ tone: "warn", text: "불복 기한 90일은 지나면 다툴 수 없어요. 과세전 통지를 받았다면 그 단계의 과세전적부심사도 확인하세요.", cite: "관세법 제118조·제121조" });
        return f;
      },
      handOff: (a) => (num(a.amount) >= 10_000_000 || a.situation === "assessed" ? `차이 세액${Number.isFinite(num(a.amount)) ? ` ${won(num(a.amount))}` : ""}이 크거나 추징 처분을 다투면 관세사 상담을 권해요.` : null),
      documents: ["수입신고필증", "인보이스·계약서·송금 내역", "세관 통지서"],
    },
  ],
  scope: [{ task: "수출입 통관 신고·관세 불복 대리", who: { customs: "yes", lawyer: "partial" }, cite: "관세사법 제2조·제3조" }],
};

/* ---------- 지식재산(특허·상표) ---------- */

const ip          = {
  profession: {
    domain: "ip",
    name: "특허·상표 법령 길잡이",
    licensed: "변리사",
    act: "변리사법",
    scopeCite: { law: "변리사법", article: "제2조" },
    scope: ["특허·실용신안·디자인·상표의 출원과 특허청·특허심판원 절차의 대리", "그에 관한 감정(침해 여부 판단 등)과 상담", "특허 등에 관한 소송 대리(심결취소소송)"],
    exclusive: [
      { text: "변리사가 아니면 특허청·법원에 대한 특허 등 사무의 대리를 업으로 할 수 없어요.", cite: { law: "변리사법", article: "제21조" } },
      { text: "변리사나 비슷한 명칭을 쓸 수 없어요.", cite: { law: "변리사법", article: "제22조" } },
    ],
    guideDoes: ["공지예외 12개월, 거절결정 불복 3개월 같은 기한을 계산해요.", "특허·상표 권리 기간과 침해 경고장 대응 순서를 설명해요.", "변리사·특허청에 가져갈 사실과 자료를 정리해요."],
    guideDoesNot: ["명세서·의견서를 대신 쓰거나 출원하지 않아요.", "특허 가능성이나 침해 여부를 판정하지 않아요."],
    handOffWhen: ["출원서·명세서를 쓸 때", "거절이유통지에 의견서를 낼 때", "침해 경고장을 받았거나 보낼 때"],
    freeHelp: [
      { name: "특허고객상담센터", how: "☎ 1544-8080", what: "출원 절차·수수료 상담" },
      { name: "공익변리사 특허상담센터", how: "☎ 02-6006-4300", what: "개인·소기업 무료 특허·상표 상담과 심판·소송 지원" },
      { name: "특허로·키프리스", how: "patent.go.kr · kipris.or.kr", what: "전자출원, 선행기술·등록상표 검색" },
    ],
  },
  statutes: [
    s("pa-29", "ip", "특허법", "제29조", "특허요건(신규성·진보성)", "출원 전에 공개된 발명과 같거나, 그 분야 사람이 쉽게 만들 수 있으면 특허를 받을 수 없어요.", ["신규성", "진보성", "특허 요건", "선행기술"]),
    s("pa-30", "ip", "특허법", "제30조", "공지 예외", "발명자 스스로 공개(논문·전시·판매·SNS)했더라도 공개한 날부터 12개월 안에 출원하면 그 공개 때문에 거절되지 않아요.", ["공지예외", "12개월", "먼저 공개", "논문 발표", "전시회"]),
    s("pa-63", "ip", "특허법", "제63조", "거절이유통지", "심사관이 거절하려면 먼저 이유를 알리고 기간을 정해 의견서를 낼 기회를 줘요. 기간은 연장을 신청할 수 있어요.", ["거절이유통지", "의견제출통지", "의견서", "보정서"]),
    s("pa-132-17", "ip", "특허법", "제132조의17·제67조의2", "거절결정 불복심판·재심사", "거절결정 등본을 받은 날부터 3개월 안에 거절결정 불복심판을 청구하거나 보정과 함께 재심사를 청구할 수 있어요.", ["거절결정", "불복심판", "재심사", "3개월"]),
    s("pa-88", "ip", "특허법", "제88조", "특허권 존속기간", "특허권은 설정등록한 날부터 출원일 뒤 20년이 되는 날까지예요.", ["존속기간", "20년", "특허 만료"]),
    s("pa-126", "ip", "특허법", "제126조", "침해 금지청구", "특허권자는 침해하거나 침해할 우려가 있는 사람에게 침해의 금지·예방을 청구할 수 있어요.", ["특허 침해", "경고장", "금지청구"]),
    s("ta-83", "ip", "상표법", "제83조", "상표권 존속기간", "상표권은 설정등록일부터 10년이고, 10년마다 갱신할 수 있어요.", ["상표 갱신", "10년", "상표권"]),
    s("ta-107", "ip", "상표법", "제107조", "상표권 침해 금지청구", "상표권자는 침해하는 사람에게 침해의 금지·예방을 청구할 수 있어요.", ["상표 침해", "상표 경고장", "상호", "브랜드"]),
    s("pal-21", "ip", "변리사법", "제2조·제21조·제22조", "변리사 업무와 비변리사 금지·유사명칭", "출원·심판 대리, 감정은 변리사 업무예요. 변리사가 아니면 이를 업으로 할 수 없고, 변리사나 비슷한 명칭을 쓸 수 없어요.", ["변리사", "출원 대행", "유사명칭"]),
  ],
  topics: [
    {
      id: "ip-disclosed",
      domain: "ip",
      label: "출원 전에 발명을 공개해 버렸어요",
      plain: "스스로 공개했다면 공개한 날부터 12개월 안에 출원하면서 공지예외를 주장하면 그 공개로는 거절되지 않아요. 남이 먼저 출원하거나 공개하면 소용없으니 빨리 출원하세요.",
      questions: [
        { key: "discloseDate", ask: "처음 공개한 날은 언제인가요(논문·전시·판매·SNS)?", why: "공지예외 12개월이 이날부터 시작해요.", kind: "date", required: true },
        { key: "byInventor", ask: "본인(발명자)이 공개했나요?", why: "남이 몰래 공개한 경우와 요건이 같아도 증명 자료가 달라요.", kind: "yesno", required: true },
        { key: "abroad", ask: "해외에도 출원할 계획인가요?", why: "나라마다 공지예외 기간과 요건이 달라 국내 기준만 믿으면 안 돼요.", kind: "yesno" },
      ],
      statutes: ["pa-29", "pa-30"],
      deadlines: [{ id: "grace", label: "공지예외 주장하며 출원", from: "discloseDate", months: 12, cite: "특허법 제30조" }],
      tools: [],
      flags: (a         ) => {
        const f         = [];
        if (yes(a.abroad)) f.push({ tone: "warn", text: "유럽 등은 공지예외가 거의 없어 공개만으로 특허를 못 받을 수 있어요. 해외 출원은 공개 전에 상담하세요.", cite: "특허법 제30조(국내 기준)" });
        f.push({ tone: "info", text: "출원서에 공지예외 주장 취지를 적고, 공개 사실을 증명할 서류를 기간 안에 내야 해요.", cite: "특허법 제30조 제2항" });
        return f;
      },
      handOff: () => "명세서와 청구범위는 권리 범위를 정하니 변리사와 상의하세요. 공익변리사 상담센터는 개인·소기업에 무료예요.",
      documents: ["공개 자료(논문·전시 사진·게시물 캡처)와 날짜 증명", "발명 설명서·도면"],
    },
    {
      id: "ip-rejected",
      domain: "ip",
      label: "특허·상표 거절 통지를 받았어요",
      plain: "거절이유통지에는 정해진 기간 안에 의견서·보정서를 내요. 거절결정이 나면 등본을 받은 날부터 3개월 안에 재심사나 불복심판을 청구할 수 있어요.",
      questions: [
        { key: "stage", ask: "어떤 통지를 받았나요?", why: "거절이유통지와 거절결정은 쓰는 절차와 기한이 달라요.", kind: "choice", required: true, options: [{ value: "notice", label: "거절이유통지(의견제출통지)" }, { value: "decision", label: "거절결정" }] },
        { key: "noticeDate", ask: "통지서(등본)를 받은 날은 언제인가요?", why: "기한이 이날부터 시작해요.", kind: "date", required: true },
        { key: "kind", ask: "무엇을 출원했나요?", why: "상표는 같은 절차라도 쟁점(유사 상표, 식별력)이 달라요.", kind: "choice", options: [{ value: "patent", label: "특허·실용신안" }, { value: "trademark", label: "상표" }, { value: "design", label: "디자인" }] },
      ],
      statutes: ["pa-63", "pa-132-17", "pa-29"],
      deadlines: [{ id: "appeal", label: "재심사 청구 또는 거절결정 불복심판", from: "noticeDate", months: 3, cite: "특허법 제132조의17·제67조의2", when: (a) => a.stage === "decision" }],
      tools: [],
      flags: (a         ) => {
        const f         = [];
        if (a.stage === "notice") f.push({ tone: "info", text: "의견서 제출 기한은 통지서에 적혀 있어요(보통 2개월). 기간 연장을 신청할 수 있으니 통지서의 날짜를 먼저 확인하세요.", cite: "특허법 제63조" });
        if (a.kind === "trademark") f.push({ tone: "info", text: "상표는 거절 이유가 유사 상표인지 식별력 부족인지에 따라 대응이 달라요. 키프리스에서 인용 상표를 확인하세요.", cite: "상표법" });
        return f;
      },
      handOff: () => "의견서·보정서는 권리 범위를 바꾸므로 변리사에게 맡기는 게 안전해요.",
      documents: ["통지서·거절결정 등본", "출원서·명세서", "인용된 선행기술·상표"],
    },
  ],
  scope: [{ task: "특허·상표 출원과 특허청 절차 대리", who: { ip: "yes", lawyer: "partial" }, cite: "변리사법 제2조·제21조" }],
};

/* ---------- 감정평가 ---------- */

const appraisal          = {
  profession: {
    domain: "appraisal",
    name: "감정평가·보상 법령 길잡이",
    licensed: "감정평가사",
    act: "감정평가 및 감정평가사에 관한 법률",
    scopeCite: { law: "감정평가 및 감정평가사에 관한 법률", article: "제10조" },
    scope: ["공시지가·표준주택가격 조사·평가", "토지 수용 보상, 법원 소송·경매, 금융기관 담보를 위한 감정평가", "감정평가에 관한 상담·자문"],
    exclusive: [
      { text: "감정평가 업무는 감정평가사사무소·감정평가법인 소속 감정평가사가 해야 해요.", cite: { law: "감정평가 및 감정평가사에 관한 법률", article: "제21조·제29조" } },
      { text: "감정평가사가 아니면 감정평가사나 비슷한 명칭을 쓸 수 없어요.", cite: { law: "감정평가 및 감정평가사에 관한 법률", article: "제22조 제2항" } },
    ],
    guideDoes: ["수용 보상금 이의신청·소송과 공시가격 이의신청 기한을 계산해요.", "보상 절차 순서와 준비할 자료를 정리해요."],
    guideDoesNot: ["가격을 감정하거나 보상금을 산정하지 않아요.", "특정 감정평가사를 소개하지 않아요."],
    handOffWhen: ["수용 재결 보상금을 다툴 때", "상속·증여 신고에 감정가를 쓸 때", "경매·소송에서 시가가 쟁점일 때"],
    freeHelp: [
      { name: "중앙토지수용위원회", how: "oclt.molit.go.kr", what: "수용 재결·이의재결 절차 안내" },
      { name: "부동산 공시가격 알리미", how: "realtyprice.kr", what: "공시가격 열람과 이의신청" },
      { name: "대한법률구조공단", how: "☎ 132", what: "보상금 소송 무료 법률구조(요건 충족 시)" },
    ],
  },
  statutes: [
    s("lca-83", "appraisal", "공익사업을 위한 토지 등의 취득 및 보상에 관한 법률", "제83조", "수용 재결에 대한 이의신청", "토지수용위원회 재결에 불복하면 재결서 정본을 받은 날부터 30일 안에 중앙토지수용위원회에 이의신청할 수 있어요.", ["수용", "보상금", "재결", "이의신청", "30일"]),
    s("lca-85", "appraisal", "공익사업을 위한 토지 등의 취득 및 보상에 관한 법률", "제85조", "보상금 행정소송", "재결서를 받은 날부터 90일, 이의재결서를 받은 날부터 60일 안에 행정소송을 낼 수 있어요. 보상금 증액은 사업시행자를 상대로 해요.", ["보상금 증액", "행정소송", "90일", "60일"]),
    s("rpa-11", "appraisal", "부동산 가격공시에 관한 법률", "제7조·제11조", "공시지가 이의신청", "표준지공시지가는 공시일부터, 개별공시지가는 결정·공시일부터 30일 안에 서면으로 이의신청할 수 있어요.", ["공시지가", "개별공시지가", "이의신청", "30일", "공시가격"]),
    s("aa-10", "appraisal", "감정평가 및 감정평가사에 관한 법률", "제10조·제22조", "감정평가 업무와 명칭 제한", "공시지가 평가, 보상·소송·경매·담보 감정, 감정 상담이 감정평가법인등의 업무예요. 감정평가사가 아니면 그 명칭을 쓸 수 없어요.", ["감정평가", "감정평가사", "유사명칭", "탁상감정"]),
  ],
  topics: [
    {
      id: "appr-expropriation",
      domain: "appraisal",
      label: "수용 보상금이 너무 적어요",
      plain: "재결서를 받은 날부터 30일 안에 이의신청, 90일 안에 행정소송을 낼 수 있어요. 이의재결을 거쳤다면 이의재결서를 받은 날부터 60일 안에 소송해요.",
      questions: [
        { key: "decisionDate", ask: "수용 재결서(정본)를 받은 날은 언제인가요?", why: "이의신청 30일, 소송 90일이 이날부터 시작해요.", kind: "date", required: true },
        { key: "reDecisionDate", ask: "이의재결서를 받았다면 그날은 언제인가요?", why: "이의재결 뒤 소송은 60일 안이에요.", kind: "date" },
        { key: "gap", ask: "생각하는 금액과 보상금 차이는 얼마인가요?", why: "감정 비용과 소송 비용을 따져 볼 기준이에요.", kind: "number", unit: "won" },
      ],
      statutes: ["lca-83", "lca-85", "aa-10"],
      deadlines: [
        { id: "objection", label: "중앙토지수용위원회 이의신청", from: "decisionDate", days: 30, cite: "토지보상법 제83조" },
        { id: "suit", label: "행정소송(재결 뒤 바로)", from: "decisionDate", days: 90, cite: "토지보상법 제85조" },
        { id: "suit2", label: "행정소송(이의재결 뒤)", from: "reDecisionDate", days: 60, cite: "토지보상법 제85조" },
      ],
      tools: [],
      flags: (a         ) => {
        const f         = [{ tone: "info", text: "이의신청이나 소송을 해도 수용 절차는 멈추지 않아요. 보상금은 이의를 남기고(이의유보) 받을 수 있어요.", cite: "토지보상법 제88조" }];
        const gap = num(a.gap);
        if (Number.isFinite(gap) && gap < 5_000_000) f.push({ tone: "warn", text: `차이가 ${won(gap)}이면 감정·소송 비용이 더 클 수 있어요. 이의신청(비용 적음)부터 검토하세요.` });
        return f;
      },
      handOff: () => "보상금 증액은 재감정 결과가 핵심이라 감정평가사·변호사와 상의하세요.",
      documents: ["재결서·이의재결서 정본", "보상 감정평가서", "토지·건물 등기부, 영업 자료"],
    },
    {
      id: "appr-official-price",
      domain: "appraisal",
      label: "공시지가·공시가격이 이상해요",
      plain: "개별공시지가는 결정·공시일부터 30일 안에 시·군·구청에, 표준지공시지가는 공시일부터 30일 안에 국토교통부에 이의신청할 수 있어요. 공시가격은 세금과 건강보험료의 기준이 돼요.",
      questions: [
        { key: "priceType", ask: "어떤 가격인가요?", why: "이의신청할 기관이 달라요.", kind: "choice", required: true, options: [{ value: "individual", label: "개별공시지가" }, { value: "standard", label: "표준지공시지가" }, { value: "house", label: "주택 공시가격" }] },
        { key: "publishDate", ask: "공시(결정)일은 언제인가요?", why: "이의신청 30일이 이날부터 시작해요.", kind: "date", required: true },
      ],
      statutes: ["rpa-11"],
      deadlines: [{ id: "objection", label: "공시가격 이의신청", from: "publishDate", days: 30, cite: "부동산 가격공시에 관한 법률 제7조·제11조" }],
      tools: [{ label: "상속 주택 감정가 vs 공시가격", href: "/ko/inherited-house-appraisal-vs-official-price-calculator/" }],
      flags: (a         ) => (a.priceType === "house" ? [{ tone: "info", text: "주택 공시가격도 공시일부터 30일 안에 부동산 공시가격 알리미에서 이의신청할 수 있어요.", cite: "부동산 가격공시에 관한 법률" }] : []),
      handOff: () => null,
      documents: ["공시가격 확인서", "주변 거래 사례·감정 자료"],
    },
  ],
  scope: [{ task: "토지·건물 가격 감정평가(보상·소송·담보)", who: { appraisal: "yes" }, cite: "감정평가법 제10조·제21조" }],
};

/* ---------- 부동산 중개 ---------- */

const realty          = {
  profession: {
    domain: "realty",
    name: "부동산 거래·중개 법령 길잡이",
    licensed: "공인중개사",
    act: "공인중개사법",
    scopeCite: { law: "공인중개사법", article: "제9조" },
    scope: ["등록한 중개사무소에서 부동산 매매·임대차 중개", "중개대상물 확인·설명과 거래계약서·확인설명서 작성", "부동산 거래신고 대행(거래 당사자 대신)"],
    exclusive: [
      { text: "중개업을 하려면 중개사무소 개설등록을 해야 해요.", cite: { law: "공인중개사법", article: "제9조" } },
      { text: "공인중개사가 아니면 공인중개사나 비슷한 명칭을, 개업공인중개사가 아니면 '공인중개사사무소'·'부동산중개' 같은 명칭을 쓸 수 없어요.", cite: { law: "공인중개사법", article: "제8조·제18조" } },
    ],
    guideDoes: ["중개보수 상한과 거래·임대차 신고 기한을 계산해요.", "중개사고 때 손해배상·보증 청구 순서를 정리해요."],
    guideDoesNot: ["매물을 소개하거나 중개하지 않아요.", "계약서를 대신 작성하지 않아요."],
    handOffWhen: ["중개사 설명과 달라 손해가 났을 때", "보증금을 못 돌려받을 때(법무사·변호사)"],
    freeHelp: [
      { name: "한국공인중개사협회 공제", how: "kar.or.kr", what: "중개사고 공제금 청구 안내" },
      { name: "시·군·구청 부동산 담당", how: "관할 지자체", what: "중개보수 초과 수수·무등록 중개 신고" },
      { name: "부동산거래관리시스템", how: "rtms.molit.go.kr", what: "매매·임대차 거래신고" },
    ],
  },
  statutes: [
    s("bra-25", "realty", "공인중개사법", "제25조", "중개대상물의 확인·설명", "중개사는 계약 전에 권리관계·상태·보수 등을 확인해 근거 자료와 함께 성실하고 정확하게 설명해야 해요.", ["확인설명서", "설명의무", "중개사 설명"]),
    s("bra-30", "realty", "공인중개사법", "제30조", "손해배상책임과 보증", "중개사의 고의·과실로 거래 당사자가 재산상 손해를 입으면 배상해야 해요. 그래서 업무 시작 전에 보증보험·공제에 가입하거나 공탁해요.", ["중개사고", "손해배상", "공제", "보증보험"]),
    s("bra-32", "realty", "공인중개사법", "제32조", "중개보수", "중개보수는 주택이면 시·도 조례, 그 밖의 부동산은 국토교통부령이 정한 한도 안에서 받아요. 중개사 잘못으로 계약이 무효·취소되면 보수를 안 받아요.", ["중개보수", "복비", "수수료", "상한요율"]),
    s("bra-33", "realty", "공인중개사법", "제33조", "중개사 금지행위", "법정 보수를 넘는 금품을 받거나, 의뢰인과 직접 거래하거나, 쌍방을 대리하면 안 돼요.", ["초과 수수료", "직접거래", "쌍방대리", "금지행위"]),
    s("bra-8", "realty", "공인중개사법", "제8조·제9조·제18조", "등록과 명칭 제한", "중개업은 개설등록을 한 사람만 할 수 있고, 자격이 없으면 공인중개사 명칭을, 개업하지 않았으면 중개사무소 명칭을 쓸 수 없어요.", ["무등록 중개", "유사명칭", "중개사무소"]),
    s("rta-3", "realty", "부동산 거래신고 등에 관한 법률", "제3조·제6조의2", "거래신고·임대차 신고", "매매계약은 계약일부터 30일 안에 신고해요. 일정 금액을 넘는 주택 임대차도 계약일부터 30일 안에 신고해요.", ["거래신고", "실거래가 신고", "임대차 신고", "전월세 신고", "30일"]),
    s("civ-766", "realty", "민법", "제766조", "손해배상청구권의 소멸시효", "불법행위 손해배상은 손해와 가해자를 안 날부터 3년, 불법행위가 있은 날부터 10년이 지나면 청구할 수 없어요.", ["손해배상 시효", "3년", "10년"]),
  ],
  topics: [
    {
      id: "realty-fee",
      domain: "realty",
      label: "중개보수(복비)와 신고 기한을 확인해요",
      plain: "중개보수는 거래 금액과 종류별 상한요율 안에서 정해요. 상한을 넘게 받았다면 돌려받을 수 있고, 매매·임대차 신고는 계약일부터 30일 안이에요.",
      questions: [
        { key: "dealType", ask: "어떤 거래인가요?", why: "매매·전세·월세마다 상한요율이 달라요.", kind: "choice", required: true, options: [{ value: "sale", label: "매매" }, { value: "jeonse", label: "전세" }, { value: "monthly", label: "월세" }] },
        { key: "contractDate", ask: "계약일은 언제인가요?", why: "거래·임대차 신고 30일이 이날부터 시작해요.", kind: "date", required: true },
        { key: "price", ask: "거래 금액(보증금)은 얼마인가요?", why: "상한요율 구간을 정해요.", kind: "number", unit: "won" },
        { key: "paidFee", ask: "중개사가 요구한(받은) 보수는 얼마인가요?", why: "상한을 넘었는지 비교해요.", kind: "number", unit: "won" },
      ],
      statutes: ["bra-32", "bra-33", "rta-3"],
      deadlines: [{ id: "report", label: "거래신고(매매) 또는 임대차 신고", from: "contractDate", days: 30, cite: "부동산 거래신고 등에 관한 법률 제3조·제6조의2" }],
      tools: [{ label: "중개보수 계산기", href: "/ko/brokerage-calculator/" }],
      flags: (a         ) => {
        const f         = [{ tone: "info", text: "정확한 상한은 중개보수 계산기로 확인하세요. 상한요율 안에서도 협의할 수 있어요.", cite: "공인중개사법 제32조" }];
        if (num(a.paidFee) > 0) f.push({ tone: "info", text: "계산기 상한보다 많이 냈다면 초과분은 금지행위라 돌려받을 수 있고, 시·군·구청에 신고할 수 있어요.", cite: "공인중개사법 제33조" });
        return f;
      },
      handOff: () => null,
      documents: ["계약서", "중개대상물 확인·설명서", "보수 영수증"],
    },
    {
      id: "realty-accident",
      domain: "realty",
      label: "중개사 설명과 달라 손해를 봤어요",
      plain: "중개사가 확인·설명을 제대로 하지 않아 손해가 나면 배상 책임이 있고, 중개사가 가입한 공제·보증보험에 청구할 수 있어요. 손해를 안 날부터 3년이 지나기 전에 청구하세요.",
      questions: [
        { key: "knewDate", ask: "손해(설명과 다른 점)를 안 날은 언제인가요?", why: "손해배상 시효 3년이 이날부터 시작해요.", kind: "date", required: true },
        { key: "explained", ask: "확인·설명서를 받았나요?", why: "설명서 내용이 책임을 따지는 핵심 증거예요.", kind: "yesno", required: true },
        { key: "loss", ask: "손해액은 얼마인가요?", why: "공제 한도와 비교해요.", kind: "number", unit: "won" },
      ],
      statutes: ["bra-25", "bra-30", "civ-766"],
      deadlines: [{ id: "claim", label: "손해배상 청구(시효)", from: "knewDate", years: 3, cite: "민법 제766조" }],
      tools: [{ label: "전세보증 진단", href: "/ko/jeonse-guarantee-calculator/" }],
      flags: (a         ) => (a.explained === "no" || a.explained === false ? [{ tone: "warn", text: "확인·설명서를 받지 못했다면 중개사의 설명의무 위반을 따질 수 있어요. 문자·녹음 등 설명 내용을 모아 두세요.", cite: "공인중개사법 제25조" }] : []),
      handOff: () => "공제금 청구가 거절되거나 손해가 크면 변호사·법률구조공단(132)과 상의하세요.",
      documents: ["계약서·확인설명서", "등기부등본", "중개사와 나눈 문자·녹음"],
    },
  ],
  scope: [{ task: "부동산 매매·임대차 중개", who: { realty: "yes" }, cite: "공인중개사법 제9조" }],
};

export const PACKS            = [customs, ip, appraisal, realty];
