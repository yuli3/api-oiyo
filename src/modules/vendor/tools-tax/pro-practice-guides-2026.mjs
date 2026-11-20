// GENERATED from tools-oiyo src/lib/pro-practice-guides-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 전문 직업 역량 지도의 빈칸을 채우는 실무 길잡이 데이터 (2026-11-17).
// 세운 "기존 전문 자격증의 업무범위에 필요한 모든 도구와 스킬 추가".
// 서류 작성·신고 대리·감정·손해사정·중개는 자격사 업무예요. 여기서는 준비물, 확인할 점, 기한, 공식 창구만 정리해요.
// 화면: components/tools/practice/PracticeGuide.tsx. 기한 계산: kr-expert-guide-2026.ts dueDate(초일 불산입, 말일 휴일이면 다음 날).
import { dueDate } from "./kr-expert-guide-2026.mjs";

                                
             
                
                             
               
                                                                                                  
               
 
                            
               
                
                                       
                 
 
                            
             
                
               
                  
                                 
              
                       
                     
                             
                                           
 
                                
               
                
                
                 
                         
                     
 

const MONTH_15 = { fromMonthEnd: true, days: 15 }         ;
const GOV24 = { label: "정부24", href: "https://www.gov.kr/" };

export const GUIDES                  = [
  {
    slug: "permit-document-checklist",
    title: "영업신고·허가 준비 서류 점검표",
    intro: "가게를 열기 전 지자체에 내는 영업신고 서류와 미리 확인할 건물 요건을 정리했어요. 지자체마다 추가 서류가 있을 수 있어요.",
    competencies: ["admin-permit"],
    cases: [
      {
        id: "food",
        label: "일반·휴게음식점 영업신고",
        summary: "식당·카페는 영업 전에 시·군·구청 위생과에 신고해요(식품위생법 제37조).",
        who: "본인이 직접 신고할 수 있어요. 서류 작성·제출을 돈 받고 대행하는 건 행정사 업무예요(행정사법 제2조).",
        prepare: [
          { text: "영업신고서", cite: "식품위생법 시행규칙 제42조", self: true },
          { text: "식품위생교육 수료증(영업 전 미리 받아요)", cite: "식품위생법 제41조", self: true },
          { text: "건강진단결과서(보건증), 영업자와 종업원 모두", cite: "식품위생법 제40조", self: true },
          { text: "액화석유가스 사용시설 완성검사증명서(LPG를 쓸 때)", cite: "액화석유가스법 제44조", self: true },
          { text: "안전시설등 완비증명서(지하 66㎡ 이상, 지상 2층 이상 100㎡ 이상 등 다중이용업소)", cite: "다중이용업소법 제9조", self: true },
          { text: "먹는물 수질검사 성적서(수돗물이 아닌 지하수를 쓸 때)", self: true },
        ],
        check: [
          { text: "건축물대장 용도가 제1·2종 근린생활시설(또는 음식점이 가능한 용도)인지", self: true },
          { text: "위반건축물 표시가 없는지(있으면 신고가 반려될 수 있어요)", self: true },
          { text: "학교 주변 교육환경보호구역에서 주류 판매 영업은 제한될 수 있어요", self: true },
          { text: "영업신고증을 받은 뒤 사업자등록(개업일부터 20일 안)", cite: "부가가치세법 제8조", self: true },
        ],
        deadlines: [{ id: "biz-reg", label: "사업자등록 신청", from: "영업 시작일", rule: { days: 20 }, cite: "부가가치세법 제8조" }],
        links: [GOV24, { label: "식품안전나라", href: "https://www.foodsafetykorea.go.kr/" }],
      },
      {
        id: "online",
        label: "통신판매업 신고",
        summary: "인터넷·SNS로 물건을 팔면 시·군·구청에 통신판매업 신고를 해요(전자상거래법 제12조).",
        who: "본인이 정부24에서 바로 신고할 수 있어요.",
        prepare: [
          { text: "사업자등록증", self: true },
          { text: "구매안전서비스 이용 확인증(에스크로·결제대행 이용 확인)", cite: "전자상거래법 제13조의2", self: true },
          { text: "통신판매업 신고서", self: true },
        ],
        check: [
          { text: "직전 연도 거래 횟수 50회 미만이거나 간이과세자면 신고 면제(공정위 고시)", self: true },
          { text: "상호·대표자·주소·전화·신고번호를 판매 화면에 표시해요", cite: "전자상거래법 제10조", self: true },
          { text: "등록면허세를 매년 내요(지역·인구에 따라 금액이 달라요)", self: true },
        ],
        deadlines: [],
        links: [GOV24, { label: "공정거래위원회 사업자정보", href: "https://www.ftc.go.kr/" }],
      },
      {
        id: "beauty",
        label: "미용업·이용업 신고",
        summary: "미용실·네일숍은 공중위생영업 신고를 해요(공중위생관리법 제3조).",
        who: "본인이 직접 신고할 수 있어요.",
        prepare: [
          { text: "영업신고서와 영업시설·설비 개요서", self: true },
          { text: "미용사 면허증(업종에 맞는 일반·피부·네일·화장 면허)", cite: "공중위생관리법 제6조", self: true },
          { text: "위생교육 수료증(영업 전)", cite: "공중위생관리법 제17조", self: true },
        ],
        check: [
          { text: "건축물 용도가 근린생활시설인지", self: true },
          { text: "면허 종류 밖의 시술(예: 네일 면허로 피부관리)은 할 수 없어요", self: true },
        ],
        deadlines: [{ id: "biz-reg2", label: "사업자등록 신청", from: "영업 시작일", rule: { days: 20 }, cite: "부가가치세법 제8조" }],
        links: [GOV24],
      },
    ],
  },
  {
    slug: "visa-stay-status-guide",
    title: "체류자격·외국인등록 기한 길잡이",
    intro: "외국인이 한국에 머물 때 꼭 지켜야 하는 신고 기한과 체류자격별 핵심을 정리했어요. 신청은 하이코리아나 관할 출입국·외국인관서에서 해요.",
    competencies: ["admin-visa"],
    cases: [
      {
        id: "arrival",
        label: "입국 뒤 외국인등록",
        summary: "90일을 넘게 머물려면 입국한 날부터 90일 안에 외국인등록을 해요(출입국관리법 제31조).",
        who: "본인이 직접 신청해요. 서류 작성·제출 대행은 출입국 업무를 하는 행정사·변호사 업무예요.",
        prepare: [
          { text: "여권과 사진", self: true },
          { text: "통합신청서", self: true },
          { text: "체류자격별 서류(재학증명서, 고용계약서 등)", self: true },
          { text: "체류지 입증 서류(임대차계약서 등)", self: true },
          { text: "수수료", self: true },
        ],
        check: [
          { text: "방문 예약을 하이코리아에서 먼저 해요", self: true },
          { text: "등록 뒤 체류지를 옮기면 15일 안에 전입신고", cite: "출입국관리법 제36조", self: true },
        ],
        deadlines: [
          { id: "register", label: "외국인등록", from: "입국한 날", rule: { days: 90 }, cite: "출입국관리법 제31조" },
          { id: "move", label: "체류지 변경 신고", from: "새 체류지로 옮긴 날", rule: { days: 15 }, cite: "출입국관리법 제36조" },
          { id: "change", label: "여권·소속 기관 등 등록사항 변경 신고", from: "바뀐 날", rule: { days: 15 }, cite: "출입국관리법 제35조" },
        ],
        links: [{ label: "하이코리아", href: "https://www.hikorea.go.kr/" }, { label: "외국인종합안내센터 1345", href: "tel:1345" }],
      },
      {
        id: "extend",
        label: "체류기간 연장·자격 변경",
        summary: "체류기간이 끝나기 전에 연장을 신청하고, 활동이 바뀌면 미리 체류자격 변경 허가를 받아요(제24조·제25조).",
        who: "본인이 하이코리아 전자민원이나 방문으로 신청해요.",
        prepare: [
          { text: "여권, 외국인등록증, 통합신청서", self: true },
          { text: "연장 사유 서류(재학·재직·혼인 관계 등)", self: true },
          { text: "체류지 입증 서류", self: true },
        ],
        check: [
          { text: "연장은 보통 만료 4개월 전부터 만료일까지 신청해요", self: true },
          { text: "만료일을 넘기면 범칙금과 출국 조치 대상이 될 수 있어요", cite: "출입국관리법 제94조", self: true },
          { text: "허가받지 않은 취업 활동은 체류자격 외 활동으로 처벌받아요", cite: "출입국관리법 제20조·제18조", self: true },
        ],
        deadlines: [{ id: "extend-open", label: "연장 신청 시작(만료 4개월 전)", from: "체류기간 만료일", rule: { months: -4 }, cite: "하이코리아 안내" }],
        links: [{ label: "하이코리아 전자민원", href: "https://www.hikorea.go.kr/" }],
      },
      {
        id: "status",
        label: "자주 묻는 체류자격",
        summary: "체류자격마다 할 수 있는 활동이 정해져 있어요(출입국관리법 시행령 별표 1).",
        who: "판단이 애매하면 1345나 관할 출입국 관서에 물어보세요.",
        prepare: [
          { text: "D-2 유학: 학위 과정. 시간제 취업은 사전 허가 필요", self: true },
          { text: "D-10 구직: 졸업 뒤 전문 분야 구직 활동", self: true },
          { text: "E-7 특정활동: 전문 인력 취업(직종 지정)", self: true },
          { text: "E-9 비전문취업: 고용허가제 근로자", self: true },
          { text: "F-2 거주·F-5 영주·F-6 결혼이민: 취업 활동 제한이 적어요", self: true },
          { text: "F-4 재외동포: 단순노무 등 일부 제한", self: true },
        ],
        check: [{ text: "체류자격 코드는 외국인등록증 앞면에 있어요", self: true }],
        deadlines: [],
        links: [{ label: "하이코리아 체류자격 안내", href: "https://www.hikorea.go.kr/" }],
      },
    ],
  },
  {
    slug: "eportal-practice-guide",
    title: "전자 창구 실무 길잡이 — 홈택스·4대보험·등기·전자소송·유니패스·특허로",
    intro: "세무·노무·법무·관세·특허 실무는 대부분 공공 전자 창구에서 끝나요. 창구마다 할 수 있는 일, 로그인 수단, 자주 놓치는 기한을 모았어요.",
    competencies: ["tax-hometax", "labor-portal", "court-efile", "cu-unipass", "pt-efile"],
    cases: [
      {
        id: "hometax",
        label: "홈택스(국세청)",
        summary: "세금 신고·납부, 전자세금계산서, 연말정산 간소화 자료, 증명 발급을 해요.",
        who: "본인이 직접 할 수 있어요. 남의 신고를 대리하는 건 세무사 업무예요(세무사법 제2조).",
        prepare: [
          { text: "공동·금융인증서 또는 간편인증(전자세금계산서 발급은 사업자용 인증서)", self: true },
          { text: "사업자는 사업용 카드·계좌 등록", self: true },
        ],
        check: [
          { text: "전자세금계산서는 공급한 달의 다음 달 10일까지 발급, 발급 다음 날까지 국세청 전송", cite: "부가가치세법 제32조·시행령 제68조", self: true },
          { text: "원천세는 지급한 달의 다음 달 10일까지 신고·납부(반기 납부 승인 제외)", cite: "소득세법 제128조", self: true },
          { text: "연말정산 간소화 자료는 1월 15일 무렵 열려요", self: true },
        ],
        deadlines: [
          { id: "einvoice", label: "전자세금계산서 발급", from: "공급한 날", rule: { fromMonthEnd: true, days: 10, tax: true }, cite: "부가가치세법 제34조" },
          { id: "withholding", label: "원천세 신고·납부", from: "급여를 준 날", rule: { fromMonthEnd: true, days: 10, tax: true }, cite: "소득세법 제128조" },
        ],
        links: [{ label: "홈택스", href: "https://www.hometax.go.kr/" }, { label: "국세상담센터 126", href: "tel:126" }],
      },
      {
        id: "insurance4",
        label: "4대보험·고용24",
        summary: "직원 입사·퇴사 때 국민연금·건강보험·고용보험·산재보험 취득·상실 신고를 해요.",
        who: "사업주가 직접 할 수 있어요. 대행은 공인노무사·세무사(보수 신고 등)·보험사무대행기관이 해요.",
        prepare: [
          { text: "사업장 관리번호와 공동인증서", self: true },
          { text: "근로자 주민등록번호, 취득일, 월 보수액, 근로시간", self: true },
          { text: "퇴사 때 상실 사유 코드와 이직확인서(고용24)", self: true },
        ],
        check: [
          { text: "4대보험 정보연계센터에서 한 번에 신고할 수 있어요", self: true },
          { text: "이직확인서는 실업급여 신청에 필요해요. 늦으면 퇴사자가 손해를 봐요", cite: "고용보험법 제42조", self: true },
          { text: "일용근로자는 근로내용확인신고로 한 번에 처리해요", self: true },
        ],
        deadlines: [
          { id: "acquire", label: "취득 신고", from: "입사일", rule: MONTH_15, cite: "고용보험법 제15조, 국민연금법 제21조" },
          { id: "lose", label: "상실 신고", from: "퇴사 다음 날(상실일)", rule: MONTH_15, cite: "고용보험법 제15조" },
        ],
        links: [{ label: "4대사회보험 정보연계센터", href: "https://www.4insure.or.kr/" }, { label: "고용24", href: "https://www.work24.go.kr/" }, { label: "고용노동부 1350", href: "tel:1350" }],
      },
      {
        id: "registry",
        label: "인터넷등기소",
        summary: "부동산·법인 등기부 열람과 발급, 전자 신청을 해요.",
        who: "본인 등기는 직접 신청할 수 있어요. 대리는 법무사·변호사 업무예요(법무사법 제2조).",
        prepare: [
          { text: "열람·발급은 회원 로그인과 결제 수단", self: true },
          { text: "전자 신청은 사용자 등록(등기소 방문 1회)과 인증서", self: true },
        ],
        check: [
          { text: "갑구(소유권)와 을구(근저당·전세권)를 함께 봐요", self: true },
          { text: "계약 당일과 잔금일에 다시 열람해 바뀐 게 없는지 확인해요", self: true },
          { text: "부동산 매매는 잔금일부터 60일 안에 소유권 이전등기를 신청해요", cite: "부동산등기특별조치법 제2조", self: true },
        ],
        deadlines: [{ id: "transfer", label: "소유권 이전등기 신청", from: "잔금일", rule: { days: 60 }, cite: "부동산등기특별조치법 제2조" }],
        links: [{ label: "인터넷등기소", href: "https://www.iros.go.kr/" }],
      },
      {
        id: "ecourt",
        label: "전자소송",
        summary: "소장·지급명령 신청, 서류 제출과 송달 확인을 온라인으로 해요.",
        who: "당사자 본인이 할 수 있어요. 소송 대리는 변호사, 법원 제출 서류 작성은 법무사 업무예요.",
        prepare: [
          { text: "사용자 등록과 인증서", self: true },
          { text: "소송 서류 PDF, 증거 파일", self: true },
        ],
        check: [
          { text: "전자 송달은 확인한 때, 확인하지 않아도 통지 뒤 1주가 지나면 송달된 것으로 봐요", cite: "민사소송 등에서의 전자문서 이용 등에 관한 법률 제11조", self: true },
          { text: "판결서를 송달받은 날부터 2주 안에 항소", cite: "민사소송법 제396조", self: true },
          { text: "지급명령을 송달받은 날부터 2주 안에 이의신청", cite: "민사소송법 제470조", self: true },
        ],
        deadlines: [
          { id: "appeal", label: "항소", from: "판결서를 송달받은 날", rule: { days: 14 }, cite: "민사소송법 제396조" },
          { id: "objection", label: "지급명령 이의신청", from: "지급명령을 송달받은 날", rule: { days: 14 }, cite: "민사소송법 제470조" },
        ],
        links: [{ label: "전자소송", href: "https://ecfs.scourt.go.kr/" }],
      },
      {
        id: "unipass",
        label: "유니패스(관세청)",
        summary: "통관 진행 조회, 개인통관고유부호 발급, 수입·수출 신고를 해요.",
        who: "화주가 직접 신고할 수 있어요. 신고 대리는 관세사 업무예요(관세사법 제2조).",
        prepare: [
          { text: "개인통관고유부호(직구할 때 주민등록번호 대신 써요)", self: true },
          { text: "운송장(B/L·AWB) 번호", self: true },
          { text: "직접 신고는 신고인 부호와 인증서", self: true },
        ],
        check: [
          { text: "통관 단계가 '반출'이면 세관을 나온 거예요", self: true },
          { text: "원산지증명서를 나중에 받았으면 수리일부터 1년 안에 FTA 사후 적용 신청", cite: "FTA관세특례법 제9조", self: true },
          { text: "관세를 덜 냈으면 수리일부터 6개월 안에 보정", cite: "관세법 제38조의2", self: true },
        ],
        deadlines: [
          { id: "fta-after", label: "FTA 협정세율 사후 적용 신청", from: "수입신고 수리일", rule: { years: 1 }, cite: "FTA관세특례법 제9조" },
          { id: "correct", label: "보정 신청", from: "수입신고 수리일", rule: { months: 6 }, cite: "관세법 제38조의2" },
        ],
        links: [{ label: "유니패스", href: "https://unipass.customs.go.kr/" }, { label: "관세청 125", href: "tel:125" }],
      },
      {
        id: "patentro",
        label: "특허로(특허청)",
        summary: "특허·상표 전자출원, 수수료 납부, 심사 진행 조회를 해요.",
        who: "출원인이 직접 출원할 수 있어요. 출원 대리는 변리사 업무예요(변리사법 제2조).",
        prepare: [
          { text: "특허고객번호와 인증서", self: true },
          { text: "명세서·도면·요약서(특허), 상표 견본과 지정상품(상표)", self: true },
        ],
        check: [
          { text: "심사청구는 출원일부터 3년 안에 해야 하고, 안 하면 취하로 봐요", cite: "특허법 제59조", self: true },
          { text: "거절이유통지의 의견서 제출 기간(보통 2개월)은 연장할 수 있어요", cite: "특허법 제63조", self: true },
          { text: "등록 뒤 연차료를 안 내면 권리가 소멸해요(추가 납부 6개월)", cite: "특허법 제81조", self: true },
        ],
        deadlines: [{ id: "exam", label: "심사청구", from: "출원일", rule: { years: 3 }, cite: "특허법 제59조" }],
        links: [{ label: "특허로", href: "https://www.patent.go.kr/" }, { label: "특허고객상담센터 1544-8080", href: "tel:15448080" }],
      },
    ],
  },
  {
    slug: "pro-document-reading-guide",
    title: "전문가 서류 읽는 법 — 손해사정서·감정평가서·확인설명서·명세서·수입신고 서류",
    intro: "자격사가 작성하는 서류를 받았을 때 꼭 들어 있어야 할 내용과 확인할 점, 내가 준비할 자료를 정리했어요. 서류를 대신 쓰지 않아요.",
    competencies: ["adj-report", "ap-report", "br-docs", "pt-claims", "cu-docs"],
    cases: [
      {
        id: "adjust",
        label: "손해사정서",
        summary: "보험사고의 손해액과 보험금을 사정한 결과를 적은 서류예요.",
        who: "손해사정사(보험업법 제186조) 업무예요. 보험계약자는 따로 손해사정사를 선임할 수 있어요(제185조).",
        prepare: [
          { text: "사고 경위서, 진단서·진료비 영수증, 수리 견적", self: true },
          { text: "가입한 약관(장해분류표·면책 조항)", self: true },
        ],
        check: [
          { text: "손해사정사 이름·등록번호와 서명·날인이 있는지", cite: "보험업법 제189조", self: true },
          { text: "사고 사실, 손해액 산정 근거, 적용 약관 조항이 적혀 있는지", self: true },
          { text: "의료자문 결과를 썼다면 그 근거와 자문의 소속", self: true },
          { text: "결과가 다르면 금융감독원 분쟁조정(1332)을 무료로 신청할 수 있어요", self: true },
        ],
        deadlines: [{ id: "claim-3y", label: "보험금 청구 시효", from: "사고가 난 날", rule: { years: 3 }, cite: "상법 제662조" }],
        links: [{ label: "금융감독원 1332", href: "tel:1332" }],
      },
      {
        id: "appraise",
        label: "감정평가서",
        summary: "토지·건물의 경제적 가치를 판정한 결과와 근거를 적은 서류예요.",
        who: "감정평가사 업무예요(감정평가법 제10조).",
        prepare: [
          { text: "등기부, 건축물대장, 토지이용계획확인서", self: true },
          { text: "주변 거래 사례나 임대료 자료(의견을 낼 때)", self: true },
        ],
        check: [
          { text: "기준시점과 가치의 종류(시장가치 등)가 적혀 있는지", cite: "감정평가에 관한 규칙 제13조", self: true },
          { text: "평가 방법(거래사례비교법·원가법·수익환원법)과 고른 이유", self: true },
          { text: "비교한 거래 사례의 위치·시점과 시점수정·지역요인 보정 근거", self: true },
          { text: "감정평가사 서명·날인", cite: "감정평가법 제6조", self: true },
          { text: "수용 보상 평가에 이의가 있으면 재결서 받은 날부터 30일 안에 이의신청", cite: "토지보상법 제83조", self: true },
        ],
        deadlines: [{ id: "objection-30", label: "수용재결 이의신청", from: "재결서 정본을 받은 날", rule: { days: 30 }, cite: "토지보상법 제83조" }],
        links: [{ label: "한국감정평가사협회", href: "https://www.kapanet.or.kr/" }],
      },
      {
        id: "broker",
        label: "중개대상물 확인·설명서",
        summary: "중개사가 계약 전에 권리관계·상태·비용을 설명하고 주는 서류예요.",
        who: "개업공인중개사가 작성·서명하고 거래당사자에게 줘요(공인중개사법 제25조).",
        prepare: [
          { text: "등기부(갑구·을구)를 직접 열람", self: true },
          { text: "건축물대장(위반건축물 여부)", self: true },
          { text: "임대차면 전입세대 열람, 국세·지방세 체납 확인(임대인 동의)", self: true },
        ],
        check: [
          { text: "근저당·압류·가등기 등 권리관계가 등기부와 같은지", self: true },
          { text: "임대차면 선순위 보증금·확정일자 현황 설명이 있는지", self: true },
          { text: "중개보수와 실비가 상한 안인지", cite: "공인중개사법 제32조", self: true },
          { text: "중개사의 서명·날인, 공제증서 사본을 받았는지", cite: "공인중개사법 제25조·제30조", self: true },
        ],
        deadlines: [{ id: "report-30", label: "부동산 거래·임대차 신고", from: "계약일", rule: { days: 30 }, cite: "부동산거래신고법 제3조·제6조의2" }],
        links: [{ label: "인터넷등기소", href: "https://www.iros.go.kr/" }, { label: "부동산거래관리시스템", href: "https://rtms.molit.go.kr/" }],
      },
      {
        id: "patent",
        label: "특허 명세서·청구범위",
        summary: "발명을 설명하고 권리 범위를 정하는 서류예요. 권리는 청구범위로만 정해져요.",
        who: "출원인이 직접 쓸 수 있고, 대리는 변리사 업무예요.",
        prepare: [
          { text: "발명의 핵심 구성요소 목록과 기존 기술과의 차이", self: true },
          { text: "도면, 실험 데이터", self: true },
          { text: "먼저 공개했다면 공개 날짜와 자료(공지예외 12개월)", cite: "특허법 제30조", self: true },
        ],
        check: [
          { text: "독립항이 꼭 필요한 구성만 담아 넓게 쓰였는지", self: true },
          { text: "종속항이 단계별로 좁혀 무효 공격을 막는지", self: true },
          { text: "청구범위가 발명의 설명으로 뒷받침되고 명확한지", cite: "특허법 제42조 제4항", self: true },
          { text: "명세서에 없는 내용은 나중에 보정으로 추가할 수 없어요", cite: "특허법 제47조 제2항", self: true },
        ],
        deadlines: [{ id: "grace", label: "공지예외 출원", from: "처음 공개한 날", rule: { months: 12 }, cite: "특허법 제30조" }],
        links: [{ label: "특허로", href: "https://www.patent.go.kr/" }, { label: "KIPRIS 선행기술 검색", href: "https://www.kipris.or.kr/" }],
      },
      {
        id: "import",
        label: "수입신고 서류",
        summary: "수입신고서에 붙이는 상업 서류예요. 숫자가 서로 맞아야 통관이 빨라요.",
        who: "화주가 직접 신고하거나 관세사가 대리해요.",
        prepare: [
          { text: "상업송장(Invoice)", self: true },
          { text: "포장명세서(Packing List)", self: true },
          { text: "선하증권(B/L) 또는 항공화물운송장(AWB)", self: true },
          { text: "원산지증명서(FTA 세율을 쓸 때)", self: true },
          { text: "요건 확인 서류(식품·전기용품 등 세관장 확인 대상)", cite: "관세법 제226조", self: true },
        ],
        check: [
          { text: "인보이스 금액·수량이 포장명세서·B/L과 같은지", self: true },
          { text: "거래 조건(FOB·CIF 등)에 따라 운임·보험료를 과세가격에 더했는지", cite: "관세법 제30조", self: true },
          { text: "원산지증명서의 품목·HS 코드·원산지 기준이 인보이스와 맞는지", self: true },
        ],
        deadlines: [{ id: "fta-after2", label: "FTA 사후 적용 신청", from: "수입신고 수리일", rule: { years: 1 }, cite: "FTA관세특례법 제9조" }],
        links: [{ label: "유니패스", href: "https://unipass.customs.go.kr/" }, { label: "FTA 종합지원센터 1380", href: "tel:1380" }],
      },
    ],
  },
];

export const guideBySlug = (slug        ) => GUIDES.find((g) => g.slug === slug);

export function guideDeadlines(c           , from                        ) {
  return c.deadlines.map((d) => {
    const base = from[d.id];
    const r = base ? dueDate(d.rule, base) : null;
    return { ...d, due: r?.due ?? "", shifted: r?.shifted ?? false };
  });
}

// ───────────────────────── 설명·적합성 기록(보험 모집) ─────────────────────────
// 금소법 제17조(적합성), 제18조(적정성), 제19조(설명의무·설명서 제공·이해 확인), 제28조(자료 기록·유지, 시행령 제26조 10년),
// 제46조(청약철회: 보험증권 받은 날부터 15일, 청약일부터 30일 중 먼저 오는 날), 제47조(위법계약해지: 안 날부터 1년, 계약일부터 5년 안).

export const SUITABILITY_ITEMS = [
  { id: "purpose", label: "가입 목적(보장·저축·노후 등)" },
  { id: "age", label: "나이와 가족 상황" },
  { id: "income", label: "소득과 보험료 납입 여력" },
  { id: "asset", label: "재산 상황과 기존 보험" },
  { id: "risk", label: "위험 감수 성향(변액보험 등 투자성 상품)" },
]         ;

export const EXPLAIN_ITEMS = [
  { id: "coverage", label: "보장 내용과 보험금 지급 사유" },
  { id: "exclusion", label: "보장하지 않는 사항(면책)과 감액 기간" },
  { id: "premium", label: "보험료, 납입 기간, 갱신 시 보험료 변동" },
  { id: "surrender", label: "해지환급금과 원금 손실 가능성" },
  { id: "disclosure", label: "계약 전 알릴 의무(고지의무)와 위반 효과" },
  { id: "withdraw", label: "청약철회권(15일·30일)과 위법계약해지권" },
  { id: "compare", label: "갈아타는 계약이면 기존·신규 비교(보험기간·예정이율·보장)" },
]         ;

                              
                   
                  
               
                        
                      
                                            
                                           
                   
               
 

export function recordCheck(i             ) {
  const missingSuit = SUITABILITY_ITEMS.filter((x) => !i.suitability.includes(x.id)).map((x) => x.label);
  const need = EXPLAIN_ITEMS.filter((x) => x.id !== "compare" || i.replace);
  const missingExplain = need.filter((x) => !i.explained.includes(x.id)).map((x) => x.label);
  const problems = [
    ...(missingSuit.length ? [`적합성 확인 빠짐: ${missingSuit.join(", ")}`] : []),
    ...(missingExplain.length ? [`설명 빠짐: ${missingExplain.join(", ")}`] : []),
    ...(!i.delivered ? ["설명서 제공 방법을 고르세요(금소법 제19조 제2항)."] : []),
    ...(!i.confirm ? ["이해했다는 확인 방법(서명·기명날인·녹취)을 고르세요(금소법 제19조 제2항)."] : []),
  ];
  const keepUntil = i.date ? dueDate({ years: 10, days: 0 }, i.date)?.nominal ?? "" : "";
  const withdrawBy = i.date ? dueDate({ days: 30 }, i.date)?.due ?? "" : "";
  return { ok: problems.length === 0, problems, keepUntil, withdrawBy };
}

const DELIVER = { paper: "서면 교부", email: "전자우편", app: "모바일 앱·문자 링크", "": "미선택" }         ;
const CONFIRM = { sign: "서명", seal: "기명날인", record: "녹취", "": "미선택" }         ;

export function recordText(i             ) {
  const r = recordCheck(i);
  const lab =                                          (list              , ids          ) => list.filter((x) => ids.includes(x.id)).map((x) => `- ${x.label}`).join("\n") || "- (없음)";
  return [
    `[설명·적합성 확인 기록] ${i.date || "날짜 미입력"}`,
    `고객: ${i.customer || "(이름)"} / 상품: ${i.product || "(상품명)"}${i.replace ? " / 승환(갈아타기) 계약" : ""}`,
    "",
    "1. 적합성 확인(금소법 제17조)",
    lab(SUITABILITY_ITEMS, i.suitability),
    "",
    "2. 설명한 중요사항(금소법 제19조)",
    lab(EXPLAIN_ITEMS, i.explained),
    "",
    `3. 설명서 제공: ${DELIVER[i.delivered]} / 이해 확인: ${CONFIRM[i.confirm]}`,
    `4. 청약철회 안내: 보험증권 받은 날부터 15일, 청약일부터 30일(늦어도 ${r.withdrawBy || "—"}) 중 먼저 오는 날까지(금소법 제46조)`,
    `5. 보관: 계약 관련 자료는 ${r.keepUntil || "10년"}까지 보관(금소법 제28조)`,
    i.note ? `\n메모: ${i.note}` : "",
    r.ok ? "" : `\n※ 보완 필요: ${r.problems.join(" / ")}`,
  ]
    .filter((x) => x !== "")
    .join("\n");
}
