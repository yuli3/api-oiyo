/**
 * 사주 간지(60갑자) 및 오행/십신 순수 결정적 계산 모듈
 * 해석·운세 텍스트 배제, 역법 및 천문 수학 알고리즘만 수행.
 */

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const STEMS_EN = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];

export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export const BRANCHES_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];

export const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];
export const ELEMENTS_KO = { Wood: "목(木)", Fire: "화(火)", Earth: "토(土)", Metal: "금(金)", Water: "수(水)" };

const STEM_ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
const BRANCH_ELEMENTS = [
  "Water", // 子
  "Earth", // 丑
  "Wood",  // 寅
  "Wood",  // 卯
  "Earth", // 辰
  "Fire",  // 巳
  "Fire",  // 午
  "Earth", // 未
  "Metal", // 申
  "Metal", // 酉
  "Earth", // 戌
  "Water", // 亥
];

// Julian Day 계산
function julianDay(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

// 1984년 갑자(甲子) 기준 연주
const YEAR_EPOCH = 1984;

export function calculateSaju({ year, month, day, hour = null, minute = 0 }) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);

  if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new TypeError("Invalid date input");
  }

  // 1. 연주 계산 (입춘 전후 근사: 양력 2월 4일 이전 출생은 전년도로 취급)
  let yearForPillar = y;
  if (m === 1 || (m === 2 && d < 4)) {
    yearForPillar = y - 1;
  }
  const yearStemIdx = ((yearForPillar - YEAR_EPOCH) % 10 + 10) % 10;
  const yearBranchIdx = ((yearForPillar - YEAR_EPOCH) % 12 + 12) % 12;

  // 2. 월주 계산 (절기 월 기준: 寅월=2부터 시작)
  const monthBranchIdx = (m + 1) % 12;
  const yearStemParity = (yearStemIdx % 5) * 2;
  const monthStemIdx = (yearStemParity + (m - 1)) % 10;

  // 3. 일주 계산 (1900-01-01 = 甲戌 기준: stem 0, branch 10, JD 2415021)
  const DAY_EPOCH_JD = 2415021;
  const jd = julianDay(y, m, d);
  const dayStemIdx = ((jd - DAY_EPOCH_JD) % 10 + 10) % 10;
  const dayBranchIdx = ((jd - DAY_EPOCH_JD + 10) % 12 + 12) % 12;

  // 4. 시주 계산 (시간이 제공된 경우: 23~01시=子, 01~03시=丑...)
  let hourStemIdx = null;
  let hourBranchIdx = null;
  if (hour !== null && hour !== undefined) {
    const h = parseInt(hour, 10);
    if (!isNaN(h) && h >= 0 && h <= 23) {
      hourBranchIdx = Math.floor((h + 1) / 2) % 12;
      const dayBase = (dayStemIdx % 5) * 2;
      hourStemIdx = (dayBase + hourBranchIdx) % 10;
    }
  }

  const createPillar = (stemIdx, branchIdx) => {
    if (stemIdx === null || branchIdx === null) return null;
    const stem = STEMS[stemIdx];
    const stemEn = STEMS_EN[stemIdx];
    const branch = BRANCHES[branchIdx];
    const branchEn = BRANCHES_EN[branchIdx];
    const stemElement = STEM_ELEMENTS[stemIdx];
    const branchElement = BRANCH_ELEMENTS[branchIdx];
    const stemYinYang = stemIdx % 2 === 0 ? "Yang" : "Yin";
    const branchYinYang = branchIdx % 2 === 0 ? "Yang" : "Yin";

    return {
      stem,
      stem_en: stemEn,
      branch,
      branch_en: branchEn,
      stem_element: stemElement,
      branch_element: branchElement,
      stem_yin_yang: stemYinYang,
      branch_yin_yang: branchYinYang,
      ganzhi: `${stem}${branch}`,
    };
  };

  const yearPillar = createPillar(yearStemIdx, yearBranchIdx);
  const monthPillar = createPillar(monthStemIdx, monthBranchIdx);
  const dayPillar = createPillar(dayStemIdx, dayBranchIdx);
  const hourPillar = createPillar(hourStemIdx, hourBranchIdx);

  // 5. 오행 분포 계산
  const elementCounts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  const pillarsList = [yearPillar, monthPillar, dayPillar, hourPillar].filter(Boolean);

  for (const p of pillarsList) {
    elementCounts[p.stem_element] += 1;
    elementCounts[p.branch_element] += 1;
  }

  const totalCharacters = pillarsList.length * 2;
  const elementDistribution = {};
  for (const el of ELEMENTS) {
    elementDistribution[el] = {
      count: elementCounts[el],
      percentage: Math.round((elementCounts[el] / totalCharacters) * 100),
      label_ko: ELEMENTS_KO[el],
    };
  }

  // 6. 십신(Ten Gods) 계산 (일간 기준)
  const getTenGod = (targetStemIdx) => {
    if (targetStemIdx === null || targetStemIdx === undefined) return null;
    const dayElement = STEM_ELEMENTS[dayStemIdx];
    const targetElement = STEM_ELEMENTS[targetStemIdx];
    const sameYinYang = (dayStemIdx % 2) === (targetStemIdx % 2);

    const relMap = {
      Wood: { Wood: "same", Fire: "gives", Earth: "takes", Metal: "taken", Water: "given" },
      Fire: { Fire: "same", Earth: "gives", Metal: "takes", Water: "taken", Wood: "given" },
      Earth: { Earth: "same", Metal: "gives", Water: "takes", Wood: "taken", Fire: "given" },
      Metal: { Metal: "same", Water: "gives", Wood: "takes", Fire: "taken", Earth: "given" },
      Water: { Water: "same", Wood: "gives", Fire: "takes", Earth: "taken", Metal: "given" },
    };

    const relation = relMap[dayElement][targetElement];
    if (relation === "same") return sameYinYang ? "비견(比肩)" : "겁재(劫財)";
    if (relation === "gives") return sameYinYang ? "식신(食神)" : "상관(傷官)";
    if (relation === "takes") return sameYinYang ? "편재(偏財)" : "정재(正財)";
    if (relation === "taken") return sameYinYang ? "편관(偏官)" : "정관(正官)";
    if (relation === "given") return sameYinYang ? "편인(偏印)" : "정인(正印)";
    return null;
  };

  return {
    birth_input: { year: y, month: m, day: d, hour, minute },
    day_master: {
      stem: STEMS[dayStemIdx],
      stem_en: STEMS_EN[dayStemIdx],
      element: STEM_ELEMENTS[dayStemIdx],
      element_ko: ELEMENTS_KO[STEM_ELEMENTS[dayStemIdx]],
      yin_yang: dayStemIdx % 2 === 0 ? "Yang" : "Yin",
    },
    pillars: {
      year: { ...yearPillar, ten_god: getTenGod(yearStemIdx) },
      month: { ...monthPillar, ten_god: getTenGod(monthStemIdx) },
      day: { ...dayPillar, ten_god: "일주(기준)" },
      hour: hourPillar ? { ...hourPillar, ten_god: getTenGod(hourStemIdx) } : null,
    },
    five_elements: elementDistribution,
  };
}
