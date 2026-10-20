// Military service duration and milestone calculation for South Korea
// Statutory reference: Military Service Act (병역법) & Ministry of National Defense

const SERVICE_MONTHS = {
  army: 18,        // 육군, 카투사
  marines: 18,     // 해병대
  navy: 20,        // 해군
  airforce: 21,    // 공군
  social: 21,      // 사회복무요원
};

/**
 * Calculates South Korea military service milestones, discharge date, and progress
 * @param {Object} params
 * @param {string} params.enlistmentDate - Enlistment date in YYYY-MM-DD format
 * @param {'army'|'marines'|'navy'|'airforce'|'social'} [params.branch='army'] - Military branch
 * @param {string} [params.currentDate] - Reference date in YYYY-MM-DD (defaults to today)
 */
export function calculateMilitaryService({
  enlistmentDate,
  branch = "army",
  currentDate,
}) {
  if (!enlistmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(enlistmentDate)) {
    throw new Error("Invalid enlistmentDate format. Required: YYYY-MM-DD");
  }

  const validBranch = SERVICE_MONTHS[branch] ? branch : "army";
  const months = SERVICE_MONTHS[validBranch];

  const [eYear, eMonth, eDay] = enlistmentDate.split("-").map(Number);
  const start = new Date(Date.UTC(eYear, eMonth - 1, eDay));

  // 전역일 = 복무 개월 뒤 같은 날의 전날. 그 달에 같은 날이 없으면 그 달 말일(민법 제160조③).
  const lastDayOfEndMonth = new Date(Date.UTC(eYear, eMonth - 1 + months + 1, 0)).getUTCDate();
  const discharge =
    eDay > lastDayOfEndMonth
      ? new Date(Date.UTC(eYear, eMonth - 1 + months, lastDayOfEndMonth))
      : new Date(Date.UTC(eYear, eMonth - 1 + months, eDay - 1));

  const dischargeDateStr = discharge.toISOString().slice(0, 10);

  // Reference date (defaults to today KST)
  let now;
  if (currentDate && /^\d{4}-\d{2}-\d{2}$/.test(currentDate)) {
    const [cYear, cMonth, cDay] = currentDate.split("-").map(Number);
    now = new Date(Date.UTC(cYear, cMonth - 1, cDay));
  } else {
    // Current UTC timestamp
    const today = new Date();
    now = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((discharge.getTime() - start.getTime()) / msPerDay) + 1;
  const daysFromStart = Math.round((now.getTime() - start.getTime()) / msPerDay) + 1;

  const servedDays = Math.max(0, Math.min(totalDays, daysFromStart));
  const remainingDays = Math.max(0, totalDays - servedDays);
  const progressPercent = Number(((servedDays / totalDays) * 100).toFixed(2));

  // Promotion dates (1st of the designated month after enlistment):
  // Private 1st Class (일등병): after 2 months (1st day of month)
  // Corporal (상등병): after 8 months total (1st day of month)
  // Sergeant (병장): after 14 months total (1st day of month)
  const promoPfc = new Date(Date.UTC(eYear, eMonth - 1 + 2, 1));
  const promoCpl = new Date(Date.UTC(eYear, eMonth - 1 + 8, 1));
  const promoSgt = new Date(Date.UTC(eYear, eMonth - 1 + 14, 1));

  let currentRank = "이병";
  if (now >= discharge) {
    currentRank = "전역";
  } else if (now >= promoSgt) {
    currentRank = "병장";
  } else if (now >= promoCpl) {
    currentRank = "상병";
  } else if (now >= promoPfc) {
    currentRank = "일병";
  }

  return {
    branch: validBranch,
    serviceMonths: months,
    enlistmentDate,
    dischargeDate: dischargeDateStr,
    totalDays,
    servedDays,
    remainingDays,
    progressPercent,
    currentRank,
    promotions: {
      privateFirstClass: promoPfc.toISOString().slice(0, 10),
      corporal: promoCpl.toISOString().slice(0, 10),
      sergeant: promoSgt.toISOString().slice(0, 10),
    },
  };
}
