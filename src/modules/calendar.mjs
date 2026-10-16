/**
 * 대한민국 표준 공휴일 및 영업일 판별 모듈 (KASI 역서 및 관공서 공휴일 규정 준수)
 */

// 양력 고정 공휴일 규칙 (월-일)
const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: "신정", substitute: false },
  { month: 3, day: 1, name: "3·1절", substitute: true },
  { month: 5, day: 5, name: "어린이날", substitute: true },
  { month: 6, day: 6, name: "현충일", substitute: false },
  { month: 8, day: 15, name: "광복절", substitute: true },
  { month: 10, day: 3, name: "개천절", substitute: true },
  { month: 10, day: 9, name: "한글날", substitute: true },
  { month: 12, day: 25, name: "기독탄신일", substitute: true },
];

// 음력 변동 공휴일 (설날 3일, 부처님오신날, 추석 3일 및 정부 지정 대체공휴일 픽스처)
const LUNAR_HOLIDAYS_BY_YEAR = {
  2024: [
    { date: "2024-02-09", name: "설날 연휴", is_substitute: false },
    { date: "2024-02-10", name: "설날", is_substitute: false },
    { date: "2024-02-11", name: "설날 연휴", is_substitute: false },
    { date: "2024-02-12", name: "설날 대체공휴일", is_substitute: true },
    { date: "2024-05-15", name: "부처님오신날", is_substitute: false },
    { date: "2024-09-16", name: "추석 연휴", is_substitute: false },
    { date: "2024-09-17", name: "추석", is_substitute: false },
    { date: "2024-09-18", name: "추석 연휴", is_substitute: false },
  ],
  2025: [
    { date: "2025-01-28", name: "설날 연휴", is_substitute: false },
    { date: "2025-01-29", name: "설날", is_substitute: false },
    { date: "2025-01-30", name: "설날 연휴", is_substitute: false },
    { date: "2025-05-05", name: "어린이날/부처님오신날", is_substitute: false },
    { date: "2025-05-06", name: "대체공휴일", is_substitute: true },
    { date: "2025-10-05", name: "추석 연휴", is_substitute: false },
    { date: "2025-10-06", name: "추석", is_substitute: false },
    { date: "2025-10-07", name: "추석 연휴", is_substitute: false },
    { date: "2025-10-08", name: "추석 대체공휴일", is_substitute: true },
  ],
  2026: [
    { date: "2026-02-16", name: "설날 연휴", is_substitute: false },
    { date: "2026-02-17", name: "설날", is_substitute: false },
    { date: "2026-02-18", name: "설날 연휴", is_substitute: false },
    { date: "2026-03-02", name: "3·1절 대체공휴일", is_substitute: true },
    { date: "2026-05-24", name: "부처님오신날", is_substitute: false },
    { date: "2026-05-25", name: "부처님오신날 대체공휴일", is_substitute: true },
    { date: "2026-08-17", name: "광복절 대체공휴일", is_substitute: true },
    { date: "2026-09-24", name: "추석 연휴", is_substitute: false },
    { date: "2026-09-25", name: "추석", is_substitute: false },
    { date: "2026-09-26", name: "추석 연휴", is_substitute: false },
    { date: "2026-10-05", name: "개천절 대체공휴일", is_substitute: true },
  ],
  2027: [
    { date: "2027-02-06", name: "설날 연휴", is_substitute: false },
    { date: "2027-02-07", name: "설날", is_substitute: false },
    { date: "2027-02-08", name: "설날 연휴", is_substitute: false },
    { date: "2027-02-09", name: "설날 대체공휴일", is_substitute: true },
    { date: "2027-05-13", name: "부처님오신날", is_substitute: false },
    { date: "2027-09-14", name: "추석 연휴", is_substitute: false },
    { date: "2027-09-15", name: "추석", is_substitute: false },
    { date: "2027-09-16", name: "추석 연휴", is_substitute: false },
    { date: "2027-10-04", name: "개천절 대체공휴일", is_substitute: true },
    { date: "2027-10-11", name: "한글날 대체공휴일", is_substitute: true },
    { date: "2027-12-27", name: "기독탄신일 대체공휴일", is_substitute: true },
  ]
};

function formatZero(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * 주어진 연도의 대한민국 법정 공휴일 목록 반환
 */
export function getHolidays(year) {
  const y = parseInt(year, 10);
  if (isNaN(y) || y < 2000 || y > 2100) {
    throw new RangeError("Year must be between 2000 and 2100");
  }

  const holidays = [];

  // 1. 고정 공휴일 추가
  for (const h of FIXED_HOLIDAYS) {
    const dateStr = `${y}-${formatZero(h.month)}-${formatZero(h.day)}`;
    holidays.push({
      date: dateStr,
      name: h.name,
      is_substitute: false,
    });

    // 대체공휴일 자동 계산 (픽스처가 없는 연도를 위한 폴백)
    if (h.substitute && !LUNAR_HOLIDAYS_BY_YEAR[y]) {
      const d = new Date(Date.UTC(y, h.month - 1, h.day));
      const dayOfWeek = d.getUTCDay(); // 0: Sun, 6: Sat
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const offset = dayOfWeek === 6 ? 2 : 1;
        const subDate = new Date(Date.UTC(y, h.month - 1, h.day + offset));
        const subDateStr = `${subDate.getUTCFullYear()}-${formatZero(subDate.getUTCMonth() + 1)}-${formatZero(subDate.getUTCDate())}`;
        holidays.push({
          date: subDateStr,
          name: `${h.name} 대체공휴일`,
          is_substitute: true,
        });
      }
    }
  }

  // 2. 음력 변동 공휴일 및 정부 지정 대체공휴일 추가
  if (LUNAR_HOLIDAYS_BY_YEAR[y]) {
    for (const lh of LUNAR_HOLIDAYS_BY_YEAR[y]) {
      // 중복 방지
      if (!holidays.some((item) => item.date === lh.date)) {
        holidays.push(lh);
      }
    }
  }

  // 날짜 오름차순 정렬
  holidays.sort((a, b) => a.date.localeCompare(b.date));
  return holidays;
}

const DAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * 특정 날짜가 대한민국 법정 영업일인지 판별
 */
export function isBusinessDay(dateStr) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new TypeError("Date format must be YYYY-MM-DD");
  }

  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);

  const date = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = date.getUTCDay();

  const dayOfWeekKo = DAY_NAMES[dayOfWeek];
  const dayOfWeekEn = DAY_NAMES_EN[dayOfWeek];

  // 1. 주말 체크
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      date: dateStr,
      is_business_day: false,
      day_of_week: dayOfWeekEn,
      day_of_week_ko: dayOfWeekKo,
      reason: dayOfWeekKo,
    };
  }

  // 2. 공휴일 체크
  const holidays = getHolidays(y);
  const matchedHoliday = holidays.find((h) => h.date === dateStr);

  if (matchedHoliday) {
    return {
      date: dateStr,
      is_business_day: false,
      day_of_week: dayOfWeekEn,
      day_of_week_ko: dayOfWeekKo,
      reason: matchedHoliday.name,
    };
  }

  return {
    date: dateStr,
    is_business_day: true,
    day_of_week: dayOfWeekEn,
    day_of_week_ko: dayOfWeekKo,
    reason: null,
  };
}
