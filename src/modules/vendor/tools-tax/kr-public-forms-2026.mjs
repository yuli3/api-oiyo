// GENERATED from tools-oiyo src/lib/kr-public-forms-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 공공 서식·신청 화면 바로가기 (2026-11-20, 다음 10종 #8). 법령 길잡이 주제마다 "어디서 서식을 받거나 신청하는지"를 알려 줘요.
// 원칙: 주소는 각 기관 첫 화면만 써요(깊은 링크와 메뉴 이름은 자주 바뀌어요). 그 사이트 검색창에 넣을 낱말만 적어요.
// 서식을 대신 채우거나 제출하지 않아요. 길만 알려 줘요.

export const FORMS_AS_OF = "2026-11-20";

                      
                                                                                                                            
                                                                                                                     
                                                

export const PORTALS                                                  = {
  gov: { name: "정부24", url: "https://www.gov.kr/" },
  hometax: { name: "홈택스", url: "https://www.hometax.go.kr/" },
  wetax: { name: "위택스", url: "https://www.wetax.go.kr/" },
  moel: { name: "고용노동부", url: "https://www.moel.go.kr/" },
  nlrc: { name: "노동위원회", url: "https://www.nlrc.go.kr/" },
  comwel: { name: "근로복지공단", url: "https://www.comwel.or.kr/" },
  work24: { name: "고용24", url: "https://www.work24.go.kr/" },
  insure4: { name: "4대사회보험 정보연계센터", url: "https://www.4insure.or.kr/" },
  ecfs: { name: "전자소송", url: "https://ecfs.scourt.go.kr/" },
  scourt: { name: "대법원 전자민원센터", url: "https://help.scourt.go.kr/" },
  iros: { name: "인터넷등기소", url: "https://www.iros.go.kr/" },
  efamily: { name: "대법원 전자가족관계등록시스템", url: "https://efamily.scourt.go.kr/" },
  simpan: { name: "온라인행정심판", url: "https://www.simpan.go.kr/" },
  tt: { name: "조세심판원", url: "https://www.tt.go.kr/" },
  epeople: { name: "국민신문고", url: "https://www.epeople.go.kr/" },
  open: { name: "정보공개포털", url: "https://www.open.go.kr/" },
  privacy: { name: "개인정보 포털", url: "https://www.privacy.go.kr/" },
  ccn: { name: "1372 소비자상담센터", url: "https://www.ccn.go.kr/" },
  hikorea: { name: "하이코리아", url: "https://www.hikorea.go.kr/" },
  unipass: { name: "유니패스(관세청)", url: "https://unipass.customs.go.kr/" },
  patent: { name: "특허로", url: "https://www.patent.go.kr/" },
  bokjiro: { name: "복지로", url: "https://www.bokjiro.go.kr/" },
  kmedi: { name: "한국의료분쟁조정중재원", url: "https://www.k-medi.or.kr/" },
  fcsc: { name: "금융감독원 e-금융민원센터", url: "https://www.fcsc.kr/" },
  eais: { name: "세움터", url: "https://www.eais.go.kr/" },
  rtms: { name: "부동산거래관리시스템", url: "https://rtms.molit.go.kr/" },
  klac: { name: "대한법률구조공단", url: "https://www.klac.or.kr/" },
  efine: { name: "교통민원24(이파인)", url: "https://www.efine.go.kr/" },
};

                           
                      
               
                   
                         
               
 

const f = (what        , portal          , find        )           => ({ what, portal, find });

export const TOPIC_FORMS                             = {
  "tax-dispute": [f("이의신청·심사청구", "hometax", "검색: 이의신청·심사청구"), f("심판청구서", "tt", "검색: 심판청구서"), f("과세전적부심사 청구", "hometax", "검색: 과세전적부심사")],
  "tax-fix": [f("수정신고·경정청구", "hometax", "검색: 수정신고·경정청구"), f("지급명세서 제출 내역 조회", "hometax", "검색: 지급명세서 제출 내역 조회")],
  "tax-estate": [f("안심상속 원스톱 서비스(재산 조회)", "gov", "검색: 안심상속"), f("상속세·증여세 신고", "hometax", "검색: 상속세·증여세 신고"), f("가족관계증명서·기본증명서", "efamily", "검색: 가족관계증명서·기본증명서")],
  "tax-home-sale": [f("양도소득세 예정신고", "hometax", "검색: 양도소득세 예정신고"), f("주민등록표 초본(거주기간)", "gov", "검색: 주민등록표 초본")],
  "acc-books": [f("부가세·소득 신고 자료 조회", "hometax", "검색: 부가세·소득 신고 자료 조회"), f("사업자등록증명", "hometax", "검색: 사업자등록증명")],
  "acc-audit": [f("4대보험 가입자 명부", "insure4", "검색: 4대보험 가입자 명부")],
  "acc-closing": [f("법인세 신고", "hometax", "검색: 법인세 신고"), f("법인지방소득세 신고", "wetax", "검색: 법인지방소득세 신고")],
  "labor-dismissal": [f("부당해고 구제신청서", "nlrc", "검색: 부당해고 구제신청서"), f("실업급여(구직급여) 신청", "work24", "검색: 실업급여 신청"), f("무료 법률 상담", "klac", "검색: 무료 법률 상담")],
  "labor-unpaid": [f("임금체불 진정서", "moel", "검색: 임금체불 진정서"), f("대지급금 신청", "comwel", "검색: 대지급금"), f("체불 소송 무료 법률구조", "klac", "검색: 체불 소송 무료 법률구조")],
  "labor-harassment": [f("직장 내 괴롭힘 신고(진정)", "moel", "검색: 직장 내 괴롭힘 신고")],
  "labor-injury": [f("요양급여 신청서(산재)", "comwel", "검색: 요양급여 신청서"), f("산재 전자신청", "comwel", "검색: 산재 전자신청")],
  "labor-freelance": [f("임금체불 진정(근로자로 볼 수 있을 때)", "moel", "검색: 임금체불 진정"), f("지급명령 신청(대금 미지급)", "ecfs", "검색: 지급명령 신청"), f("3.3% 낸 세금 정산(종합소득세)", "hometax", "검색: 3.3% 낸 세금 정산")],
  "admin-sanction": [f("행정심판 청구서", "simpan", "검색: 행정심판 청구서"), f("행정소송 소장", "ecfs", "검색: 행정소송 소장"), f("처분 기준 확인(법령)", "gov", "검색: 해당 법령 '행정처분 기준'")],
  "admin-permit": [f("민원 신청서·구비서류", "gov", "검색: 신청하려는 인허가 이름"), f("체류 민원(외국인)", "hikorea", "검색: 체류 민원")],
  "admin-fine": [f("과태료·범칙금 조회·의견진술", "efine", "검색: 과태료·범칙금 조회·의견진술"), f("지자체 과태료 조회·납부", "wetax", "검색: 지자체 과태료 조회·납부")],
  "admin-info": [f("정보공개 청구서", "open", "검색: 정보공개 청구서"), f("이의신청·행정심판", "open", "검색: 이의신청·행정심판")],
  "court-renounce": [f("상속포기·한정승인 심판청구서", "scourt", "검색: 상속포기·한정승인 심판청구서"), f("전자 제출", "ecfs", "검색: 전자 제출"), f("안심상속 원스톱(재산·빚 조회)", "gov", "검색: 안심상속")],
  "court-transfer": [f("소유권이전등기 신청(전자)", "iros", "검색: 소유권이전등기 신청"), f("취득세 신고·납부", "wetax", "검색: 취득세 신고·납부"), f("부동산 거래 신고", "rtms", "검색: 부동산 거래 신고")],
  "court-money": [f("지급명령 신청서", "ecfs", "검색: 지급명령 신청서"), f("소액사건 소장 양식", "scourt", "검색: 소액사건 소장 양식")],
  "court-deposit": [f("임차권등기명령 신청서", "ecfs", "검색: 임차권등기명령 신청서"), f("지급명령·소장", "ecfs", "검색: 지급명령·소장"), f("확정일자 부여 현황", "iros", "검색: 확정일자 부여 현황")],
  "court-company": [f("법인 변경등기 신청", "iros", "검색: 법인 변경등기 신청")],
  "ins-undo": [f("금융 민원 신청(보험)", "fcsc", "검색: 금융 민원 신청")],
  "ins-claim": [f("금융 분쟁조정 신청", "fcsc", "검색: 금융 분쟁조정 신청")],
  "ins-sales-check": [],
  "ins-pro-scope": [],
  "customs-direct": [f("개인통관고유부호 발급·조회", "unipass", "검색: 개인통관고유부호 발급·조회"), f("통관 진행 조회", "unipass", "검색: 통관 진행 조회")],
  "customs-correct": [f("보정·경정청구 신청", "unipass", "검색: 보정·경정청구 신청"), f("심판청구서", "tt", "검색: 심판청구서")],
  "ip-disclosed": [f("특허 출원(공지예외 주장)", "patent", "검색: 특허 출원")],
  "ip-rejected": [f("의견서·보정서 제출", "patent", "검색: 의견서·보정서 제출"), f("거절결정불복심판 청구", "patent", "검색: 거절결정불복심판 청구")],
  "appr-expropriation": [f("이의신청(재결)", "gov", "검색: 중앙토지수용위원회 이의신청"), f("행정소송 소장", "ecfs", "검색: 행정소송 소장")],
  "appr-official-price": [f("공시가격 이의신청", "gov", "검색: 개별공시지가 이의신청 또는 공동주택가격 이의신청")],
  "realty-fee": [f("부동산 거래 신고", "rtms", "검색: 부동산 거래 신고"), f("중개사무소 등록 확인", "gov", "검색: 중개업소 조회")],
  "realty-accident": [f("손해배상 소장·지급명령", "ecfs", "검색: 손해배상 소장·지급명령"), f("무료 법률 상담", "klac", "검색: 무료 법률 상담")],
  "bld-violation": [f("건축물대장 열람·발급", "gov", "검색: 건축물대장"), f("행정심판 청구서", "simpan", "검색: 행정심판 청구서")],
  "bld-permit": [f("건축 인허가 신청·건축물대장", "eais", "검색: 건축 인허가 신청·건축물대장"), f("토지이용계획확인서", "gov", "검색: 토지이용계획")],
  "health-records": [f("진료기록 열람·사본 신청(동의서·위임장 양식)", "gov", "검색: 진료기록 사본 발급 동의서")],
  "health-dispute": [f("의료분쟁 조정 신청", "kmedi", "검색: 의료분쟁 조정 신청"), f("진료비 확인 신청", "gov", "검색: 진료비 확인 요청")],
  "fam-divorce": [f("협의이혼의사확인신청서", "scourt", "검색: 협의이혼의사확인신청서"), f("혼인관계증명서·가족관계증명서", "efamily", "검색: 혼인관계증명서·가족관계증명서")],
  "fam-support": [f("양육비 이행명령 신청서", "scourt", "검색: 양육비 이행명령 신청서"), f("양육비 이행 지원 상담", "gov", "검색: 양육비이행관리원")],
  "welfare-basic": [f("기초생활보장 급여 신청", "bokjiro", "검색: 기초생활보장 급여 신청"), f("이의신청서", "gov", "검색: 기초생활보장 이의신청")],
  "welfare-emergency": [f("긴급복지 지원 신청", "bokjiro", "검색: 긴급복지지원"), f("주민센터 방문 신청 안내", "gov", "검색: 긴급복지 (전화 상담은 보건복지상담센터 129)")],
  "cons-online": [f("소비자 상담·피해구제 신청", "ccn", "검색: 소비자 상담·피해구제 신청"), f("판매자 신원 확인", "gov", "검색: 통신판매사업자 조회")],
  "cons-contract": [f("소비자 상담·피해구제 신청", "ccn", "검색: 소비자 상담·피해구제 신청")],
  "privacy-breach": [f("유출 신고", "privacy", "검색: 유출 신고")],
  "privacy-victim": [f("개인정보 침해 신고·상담", "privacy", "검색: 개인정보 침해 신고·상담"), f("분쟁조정 신청", "privacy", "검색: 분쟁조정 신청")],
  "privacy-policy": [f("처리방침 작성 지침", "privacy", "검색: 처리방침 작성 지침")],
  "traffic-victim": [f("교통사고 사실 확인원", "efine", "검색: 교통사고 사실 확인원"), f("손해배상 소장", "ecfs", "검색: 손해배상 소장"), f("무료 법률 상담", "klac", "검색: 무료 법률 상담")],
  "traffic-driver": [f("교통사고 사실 확인원", "efine", "검색: 교통사고 사실 확인원"), f("범칙금·벌점 조회", "efine", "검색: 범칙금·벌점 조회")],
};

/** 주제의 서식·신청 화면 목록(주소 포함) */
export function formsFor(topicId        ) {
  return (TOPIC_FORMS[topicId] ?? []).map((x) => ({ ...x, site: PORTALS[x.portal].name, url: PORTALS[x.portal].url }));
}
