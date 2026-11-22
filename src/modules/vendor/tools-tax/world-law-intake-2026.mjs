// GENERATED from tools-oiyo src/lib/world-law-intake-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Per-country intake router (2026-11-22, world pro gap review #1). Not a calculation: it points a question to the
// right OIYO tool (page + api.oiyo.net MCP tool), the free official help channel and who may give paid advice there.
// WHY: an agent or a person asking in their own language should land on the local tool, not a translated Korean one.
// Help channels and scope come only from texts already published in the tax, labour and tenancy packs (same sources).
// No legal advice, no representation, no filing.
import { JP_SCOPE } from "./jp-tax-pack-2026.mjs";
import { US_SCOPE } from "./us-tax-pack-2026.mjs";
import { FR_SCOPE } from "./fr-tax-pack-2026.mjs";
import { ES_SCOPE } from "./es-tax-pack-2026.mjs";
import { CN_SCOPE } from "./cn-tax-pack-2026.mjs";
import { UK_SCOPE } from "./uk-tax-pack-2026.mjs";
import { TW_SCOPE } from "./tw-tax-pack-2026.mjs";

export const INTAKE_AS_OF = "2026-11-22";
                                                                     
                                                                       
                                                                                                                        

const T = "https://tools.oiyo.net/";
const t = (country         , area      , mcp        , path        , title        , keywords          )             => ({ country, area, mcp, page: `${T}${path}/`, title, keywords });

export const WORLD_TOOLS               = [
  t("JP", "tax", "get_jp_tax_calendar", "ja/jp-tax-calendar", "個人事業主の申告・納付期限", ["期限", "いつまで", "確定申告", "予定納税", "納付", "calendar", "deadline"]),
  t("JP", "tax", "calculate_jp_blue_return_deduction", "ja/aoiro-shinkoku-deduction-calculator", "青色申告特別控除", ["青色", "65万", "55万", "10万", "白色", "e-tax", "blue return"]),
  t("JP", "tax", "check_jp_consumption_tax", "ja/consumption-tax-invoice-check", "消費税の納税義務・インボイス2割特例", ["消費税", "インボイス", "2割", "3割", "免税事業者", "1000万", "consumption tax", "invoice"]),
  t("JP", "tax", "calculate_jp_penalty_tax", "ja/kasanzei-entaizei-calculator", "加算税・延滞税", ["加算税", "延滞税", "無申告", "過少", "期限後", "penalty"]),
  t("JP", "tax", "calculate_jp_appeal_deadlines", "ja/kasanzei-entaizei-calculator", "再調査・審査請求の期限", ["再調査", "審査請求", "不服", "更正の請求", "appeal"]),
  t("JP", "tax", "calculate_jp_depreciation", "ja/genka-shokyaku-calculator", "減価償却", ["減価償却", "耐用年数", "少額", "30万", "一括償却", "depreciation"]),
  t("JP", "labor", "calculate_jp_labor_exit", "ja/japan-dismissal-unemployment-checker", "解雇予告手当・失業手当・有給", ["解雇", "解雇予告", "退職", "失業", "基本手当", "有給", "最低賃金", "残業代", "未払い", "dismiss", "fired", "unemployment"]),
  t("JP", "labor", "calculate_jp_employer_cost", "ja/japan-employer-social-insurance-cost", "社会保険料の会社負担", ["会社負担", "事業主負担", "社会保険料", "人件費", "雇う", "採用コスト", "厚生年金"]),
  t("JP", "tenancy", "check_jp_rental_deposit_notice", "ja/japan-rental-deposit-notice-checker", "敷金・解約予告", ["敷金", "賃貸", "家賃", "退去", "解約", "更新", "定期借家", "大家", "deposit", "rent", "lease"]),
  t("JP", "claims", "check_jp_limitation_small_claims", "ja/japan-shometsu-jiko-shogaku-sosho", "消滅時効と少額訴訟", ["時効", "消滅時効", "少額訴訟", "貸したお金", "返してくれない", "請求", "訴え", "裁判"]),
  t("JP", "consumer", "check_jp_cooling_off", "ja/japan-cooling-off-deadline", "クーリング・オフ期限", ["クーリング・オフ", "クーリングオフ", "訪問販売", "電話勧誘", "エステ", "マルチ", "解約したい", "返品", "契約をやめ"]),
  t("JP", "tax", "calculate_jp_inheritance_gift_tax", "ja/japan-inheritance-gift-tax-deadline", "相続税・贈与税の基礎控除と期限", ["相続税", "相続", "遺産", "贈与税", "贈与", "生前贈与", "基礎控除"]),

  t("US", "tax", "get_us_tax_calendar", "en/us-tax-deadline-calendar", "US federal tax deadlines", ["deadline", "due date", "1040", "april 15", "extension", "calendar", "when"]),
  t("US", "tax", "calculate_us_self_employment_tax", "en/self-employment-tax-qbi-calculator", "Self-employment tax and QBI", ["self-employment", "self employed", "1099", "schedule c", "qbi", "freelance", "se tax"]),
  t("US", "tax", "calculate_us_estimated_tax", "en/estimated-tax-safe-harbor-calculator", "Estimated tax and safe harbor", ["estimated", "quarterly", "1040-es", "safe harbor", "underpayment"]),
  t("US", "tax", "calculate_us_irs_penalty", "en/irs-penalty-interest-calculator", "IRS penalties and interest", ["penalty", "late filing", "late payment", "interest", "irs"]),
  t("US", "tax", "calculate_us_tax_appeal_deadlines", "en/irs-penalty-interest-calculator", "Tax Court, CDP and refund deadlines", ["tax court", "notice of deficiency", "cdp", "refund claim", "appeal"]),
  t("US", "tax", "calculate_us_depreciation", "en/macrs-section-179-calculator", "MACRS, Section 179 and bonus depreciation", ["depreciation", "section 179", "macrs", "bonus", "de minimis"]),
  t("US", "labor", "check_us_labor_rights", "en/us-wage-layoff-deadline-checker", "Minimum wage, overtime, WARN and EEOC deadlines", ["minimum wage", "overtime", "layoff", "warn", "fired", "final pay", "eeoc", "discrimination", "back wages"]),
  t("US", "labor", "calculate_us_employer_cost", "en/us-employer-payroll-tax-fica-2026", "Employer FICA (Social Security and Medicare)", ["employer fica", "payroll tax", "employer share", "social security tax", "medicare tax", "cost of hiring"]),
  t("US", "tenancy", "check_us_security_deposit_notice", "en/california-new-york-security-deposit-notice", "California and New York security deposit, notice and rent cap", ["security deposit", "rent", "landlord", "tenant", "lease", "move out", "rent increase", "ab 1482", "rent stabilized"]),
  t("US", "claims", "check_ca_limitation_small_claims", "en/california-statute-of-limitations-small-claims", "California deadlines to sue and small claims", ["statute of limitations", "small claims", "sue", "lawsuit", "deadline to sue", "owes me money"]),
  t("US", "consumer", "check_us_cooling_off", "en/ftc-cooling-off-rule-deadline", "FTC three-day Cooling-Off Rule", ["cooling-off", "cooling off", "door-to-door", "cancel a purchase", "salesperson", "three-day", "3-day", "refund"]),
  t("US", "tax", "check_us_estate_gift_exclusion", "en/us-estate-gift-tax-exclusion-2026", "Estate and gift tax exclusions and due dates", ["estate tax", "gift tax", "inheritance", "form 706", "form 709", "annual exclusion", "estate"]),

  t("FR", "tax", "get_fr_tax_calendar", "fr/calendrier-fiscal-entreprise", "Calendrier fiscal 2026", ["calendrier", "échéance", "date limite", "déclaration", "cfe", "tva"]),
  t("FR", "tax", "calculate_fr_micro_entrepreneur", "fr/micro-entrepreneur-cotisations-impot", "Micro-entrepreneur : cotisations et impôt", ["micro-entrepreneur", "auto-entrepreneur", "cotisations", "urssaf", "versement libératoire", "chiffre d'affaires"]),
  t("FR", "tax", "check_fr_vat_franchise", "fr/franchise-tva-seuils", "Franchise en base de TVA", ["franchise", "tva", "seuil", "facturer la tva"]),
  t("FR", "tax", "calculate_fr_tax_penalty", "fr/interet-de-retard-majoration", "Intérêt de retard et majorations", ["intérêt de retard", "majoration", "pénalité", "retard"]),
  t("FR", "tax", "calculate_fr_claim_deadline", "fr/interet-de-retard-majoration", "Délai de réclamation", ["réclamation", "contester", "dégrèvement", "délai"]),
  t("FR", "tax", "calculate_fr_depreciation", "fr/amortissement-lineaire-degressif", "Amortissement linéaire et dégressif", ["amortissement", "dégressif", "linéaire", "immobilisation"]),
  t("FR", "labor", "calculate_fr_labor_exit", "fr/indemnite-licenciement-delais-prudhommes", "Indemnité de licenciement, préavis et prud'hommes", ["licenciement", "licencié", "indemnité", "préavis", "rupture conventionnelle", "prud'hommes", "smic", "chômage", "démission"]),
  t("FR", "tenancy", "check_fr_deposit_notice_irl", "fr/depot-de-garantie-preavis-irl", "Dépôt de garantie, préavis et révision IRL", ["dépôt de garantie", "caution", "loyer", "bail", "propriétaire", "locataire", "préavis", "irl", "état des lieux", "meublé"]),
  t("FR", "claims", "check_fr_prescription", "fr/delai-prescription-dette-injonction", "Prescription d'une dette et injonction de payer", ["prescription", "dette", "injonction de payer", "créance", "recouvrement", "me doit"]),
  t("FR", "consumer", "check_fr_retractation", "fr/delai-retractation-achat-distance", "Délai de rétractation de 14 jours", ["rétractation", "retractation", "remboursement", "achat en ligne", "commande", "démarchage", "annuler un achat"]),
  t("FR", "tax", "calculate_fr_droits_succession", "fr/droits-succession-abattement-delai", "Droits de succession : abattement et délai", ["succession", "héritage", "heritage", "hériter", "abattement", "notaire", "décès"]),

  t("ES", "tax", "get_es_tax_calendar", "es/calendario-fiscal-autonomos-2026", "Calendario fiscal de autónomos 2026", ["calendario", "plazo", "modelo 303", "modelo 130", "renta", "cuándo"]),
  t("ES", "tax", "calculate_es_autonomo_quota", "es/cuota-autonomos-tramos-irpf", "Cuota de autónomos por tramos", ["cuota", "autónomo", "tramos", "seguridad social", "reta", "tarifa plana"]),
  t("ES", "tax", "calculate_es_vat", "es/iva-tipos-recargo-equivalencia", "IVA y recargo de equivalencia", ["iva", "recargo de equivalencia", "21%", "10%", "4%"]),
  t("ES", "tax", "calculate_es_late_filing_surcharge", "es/recargo-extemporaneo-sanciones-plazos", "Recargo por presentación fuera de plazo", ["recargo", "fuera de plazo", "extemporáneo", "tarde"]),
  t("ES", "tax", "calculate_es_tax_sanction", "es/recargo-extemporaneo-sanciones-plazos", "Sanciones tributarias", ["sanción", "multa", "infracción"]),
  t("ES", "tax", "calculate_es_appeal_deadlines", "es/recargo-extemporaneo-sanciones-plazos", "Plazos de recurso", ["recurso", "reposición", "reclamación económico", "plazo para recurrir"]),
  t("ES", "tax", "calculate_es_depreciation", "es/amortizacion-tablas-oficiales", "Amortización por tablas oficiales", ["amortización", "tablas", "coeficiente"]),
  t("ES", "labor", "calculate_es_labor_exit", "es/indemnizacion-despido-paro-plazos", "Indemnización por despido, paro y plazos", ["despido", "despedid", "me echan", "indemnización", "improcedente", "objetivo", "paro", "finiquito", "smi", "conciliación"]),
  t("ES", "labor", "calculate_es_employer_cost", "es/coste-empresa-seguridad-social-2026", "Coste de empresa en Seguridad Social", ["coste empresa", "cuota empresa", "seguridad social empresa", "contratar", "cotización empresa", "coste de un trabajador"]),
  t("ES", "tenancy", "check_es_fianza_preaviso", "es/fianza-alquiler-preaviso-actualizacion", "Fianza, preaviso y actualización del alquiler", ["fianza", "alquiler", "arrendador", "inquilino", "casero", "preaviso", "prórroga", "irav", "subida del alquiler"]),
  t("ES", "consumer", "check_es_desistimiento", "es/plazo-desistimiento-compra-online", "Plazo de desistimiento de 14 días", ["desistimiento", "devolución", "devolver", "compra online", "reembolso", "pedido"]),

  t("CN", "tax", "get_cn_tax_calendar", "zh/china-tax-filing-calendar-2026", "2026年申报纳税期限", ["申报", "期限", "征期", "什么时候", "汇算"]),
  t("CN", "tax", "calculate_cn_business_income_tax", "zh/china-business-income-tax-calculator", "个体工商户经营所得", ["经营所得", "个体工商户", "个体户", "减半"]),
  t("CN", "tax", "calculate_cn_comprehensive_income_tax", "zh/china-business-income-tax-calculator", "综合所得个人所得税", ["综合所得", "工资薪金", "个税", "专项附加扣除", "年度汇算"]),
  t("CN", "tax", "calculate_cn_small_profit_cit", "zh/china-business-income-tax-calculator", "小型微利企业所得税", ["小型微利", "企业所得税", "小微企业"]),
  t("CN", "tax", "check_cn_small_scale_vat", "zh/china-small-scale-vat-threshold", "小规模纳税人增值税", ["小规模", "增值税", "起征点", "1%", "免征"]),
  t("CN", "tax", "calculate_cn_late_payment_surcharge", "zh/china-late-payment-surcharge-appeal", "滞纳金", ["滞纳金", "逾期", "晚交"]),
  t("CN", "tax", "calculate_cn_tax_appeal_deadlines", "zh/china-late-payment-surcharge-appeal", "税务行政复议·诉讼期限", ["复议", "行政诉讼", "不服"]),
  t("CN", "tax", "calculate_cn_depreciation", "zh/china-depreciation-calculator", "固定资产折旧", ["折旧", "固定资产", "一次性扣除"]),
  t("CN", "labor", "calculate_cn_labor_exit", "zh/china-severance-compensation-calculator", "经济补偿·赔偿金·失业保险金", ["辞退", "解除劳动合同", "经济补偿", "赔偿金", "n+1", "2n", "失业", "年休假", "仲裁", "裁员", "最低工资"]),
  t("CN", "tenancy", "check_cn_rental_contract_deposit", "zh/china-rental-contract-deposit-check", "租房合同与押金", ["租房", "押金", "房东", "租客", "租赁合同", "退租", "房租"]),
  t("CN", "claims", "check_cn_small_claims", "zh/china-small-claims-threshold", "小额诉讼适用判断", ["小额诉讼", "起诉", "欠钱", "欠款", "打官司", "诉讼"]),
  t("CN", "consumer", "check_cn_7day_return", "zh/china-7-day-return-deadline", "七日无理由退货", ["七天无理由", "七日无理由", "退货", "网购", "退款", "签收"]),

  t("UK", "tax", "get_uk_tax_calendar", "en/uk-self-assessment-deadlines-2026", "Self Assessment and MTD deadlines", ["self assessment", "31 january", "deadline", "mtd", "payment on account", "tax return"]),
  t("UK", "tax", "calculate_uk_self_employed_tax", "en/uk-self-employed-tax-ni-calculator", "Self-employed Income Tax and NI", ["self-employed", "sole trader", "class 4", "class 2", "national insurance", "profit"]),
  t("UK", "tax", "check_uk_vat_registration", "en/uk-vat-registration-threshold-check", "VAT registration threshold and Flat Rate Scheme", ["vat", "90,000", "90k", "register for vat", "flat rate"]),
  t("UK", "tax", "calculate_uk_sa_penalty", "en/hmrc-late-filing-penalty-interest-calculator", "HMRC late filing penalties", ["late filing", "penalty", "£100", "hmrc"]),
  t("UK", "tax", "calculate_uk_late_payment_interest", "en/hmrc-late-filing-penalty-interest-calculator", "HMRC late payment interest", ["late payment", "interest", "pay late"]),
  t("UK", "tax", "calculate_uk_tax_appeal_deadlines", "en/hmrc-late-filing-penalty-interest-calculator", "HMRC appeal deadlines", ["appeal", "30 days", "tribunal", "review"]),
  t("UK", "tax", "calculate_uk_capital_allowances", "en/uk-capital-allowances-aia-calculator", "Capital allowances, AIA and full expensing", ["capital allowances", "aia", "full expensing", "writing down", "van", "equipment"]),
  t("UK", "labor", "calculate_uk_labor_exit", "en/uk-redundancy-notice-tribunal-calculator", "Redundancy pay, notice and tribunal deadline", ["redundancy", "redundant", "notice", "tribunal", "acas", "minimum wage", "holiday pay", "sick pay", "ssp", "dismissed"]),
  t("UK", "labor", "calculate_uk_employer_cost", "en/uk-employer-national-insurance-2026", "Employer National Insurance and Employment Allowance", ["employer ni", "employer national insurance", "employment allowance", "apprenticeship levy", "cost of hiring", "employer nics"]),
  t("UK", "tenancy", "check_uk_tenancy_deposit_notice", "en/england-tenancy-deposit-notice-checker", "England deposit cap, protection and notice", ["deposit", "tenancy", "landlord", "tenant", "rent", "renters' rights", "section 21", "deposit protection", "evict"]),
  t("UK", "claims", "check_uk_limitation_small_claims", "en/uk-limitation-period-small-claims", "Limitation period and small claims fee", ["limitation", "small claims", "sue", "money claim", "court claim", "owes me", "county court"]),
  t("UK", "consumer", "check_uk_cancellation_period", "en/uk-consumer-cancellation-period", "14-day cancellation period", ["cancel", "cancellation", "refund", "online order", "doorstep", "cooling-off"]),
  t("UK", "tax", "calculate_uk_inheritance_tax", "en/uk-inheritance-tax-threshold-deadline", "Inheritance Tax threshold and payment date", ["inheritance tax", "inheritance", "estate", "nil rate band", "iht", "probate", "gifts before death"]),

  t("TW", "tax", "get_tw_tax_calendar", "zh/taiwan-tax-filing-calendar-2026", "綜所稅與營所稅申報期限", ["申報", "期限", "五月", "綜所稅", "營所稅", "什麼時候"]),
  t("TW", "tax", "calculate_tw_income_tax", "zh/taiwan-income-tax-calculator", "綜合所得稅試算", ["綜合所得稅", "所得稅", "免稅額", "扣除額", "級距"]),
  t("TW", "tax", "check_tw_business_tax", "zh/taiwan-business-tax-threshold", "營業稅起徵點與小規模營業人", ["營業稅", "起徵點", "小規模", "統一發票", "1%"]),
  t("TW", "tax", "calculate_tw_late_fee", "zh/taiwan-late-tax-penalty-appeal", "滯納金", ["滯納金", "逾期", "遲繳"]),
  t("TW", "tax", "calculate_tw_tax_appeal_deadlines", "zh/taiwan-late-tax-penalty-appeal", "復查·訴願期限", ["復查", "訴願", "不服"]),
  t("TW", "tax", "calculate_tw_depreciation", "zh/taiwan-depreciation-calculator", "固定資產折舊", ["折舊", "耐用年數", "8萬"]),
  t("TW", "labor", "calculate_tw_labor_exit", "zh/taiwan-severance-notice-calculator", "資遣費·預告期間·特休·失業給付", ["資遣", "資遣費", "解僱", "離職", "預告", "特休", "失業給付", "最低工資", "勞退"]),
  t("TW", "tenancy", "check_tw_rental_deposit_termination", "zh/taiwan-rental-deposit-termination", "租屋押金與提前終止", ["租屋", "押金", "房東", "房客", "租約", "提前終止", "退租"]),
  t("TW", "claims", "check_tw_limitation_small_claims", "zh/taiwan-statute-limitation-small-claims", "消滅時效與小額訴訟", ["時效", "消滅時效", "小額訴訟", "欠錢", "欠款", "起訴", "打官司"]),
  t("TW", "consumer", "check_tw_7day_cancellation", "zh/taiwan-7-day-cancellation", "七日解約權", ["七日鑑賞期", "鑑賞期", "七天", "退貨", "網購", "解約", "退款"]),
  t("TW", "tax", "check_tw_estate_tax_deadline", "zh/taiwan-estate-tax-filing-deadline", "遺產稅申報期限", ["遺產稅", "遺產", "繼承", "過世", "申報期限"]),
];

// Free official help, as already published in the packs and skills (tax: *_SCOPE; labour and tenancy: pack items / SKILL.md; consumer: world-consumer-pack-2026).
export const HELP                                        = {
  JP: { tax: "税務署の電話相談センター、税理士会の無料税務相談", labor: "総合労働相談コーナー", tenancy: "消費者ホットライン 188", consumer: "消費者ホットライン 188", claims: "簡易裁判所の窓口" },
  US: { tax: "IRS VITA and TCE (free return preparation), Taxpayer Advocate Service, Low Income Taxpayer Clinics", labor: "US Department of Labor 1-866-487-2365 (Wage and Hour Division) or your state labor department", tenancy: "California courts self-help, New York Attorney General", consumer: "FTC ReportFraud.ftc.gov, your state attorney general", claims: "California Courts Self-Help, county small claims advisor" },
  FR: { tax: "centre des finances publiques ou SIE, messagerie sécurisée impots.gouv, 0 809 401 401 (particuliers), 0 806 807 807 (professionnels), France Services", labor: "conseil de prud'hommes, service-public.gouv.fr", tenancy: "ADIL, commission départementale de conciliation", consumer: "SignalConso, conciliateur de justice", claims: "tribunal judiciaire (greffe), justice.fr" },
  ES: { tax: "AEAT: 91 333 5 333 (información y cita previa), 91 554 87 70 (información tributaria básica)", labor: "conciliación (SMAC) de tu comunidad autónoma", tenancy: "oficina de consumo o de vivienda de tu comunidad o ayuntamiento", consumer: "OMIC de su municipio, consumoresponde.es", claims: "no hay herramienta todavía: consulte un servicio de orientación jurídica" },
  CN: { tax: "国家税务总局12366纳税服务平台（12366.chinatax.gov.cn）", labor: "当地人社部门、劳动争议仲裁委员会", tenancy: "12345 政务服务便民热线", consumer: "12315 平台", claims: "当地人民法院诉讼服务中心" },
  UK: { tax: "HMRC; on a low income, free independent advice such as TaxAid", labor: "Acas", tenancy: "Shelter, Citizens Advice, the deposit scheme's free dispute service", consumer: "Citizens Advice consumer service", claims: "Citizens Advice, Money Claim Online (gov.uk)" },
  TW: { tax: "國稅局免付費電話 0800-000-321", labor: "地方勞工局", tenancy: "地方消保官或地政機關", consumer: "行政院消費者保護會、縣市消費者服務中心", claims: "各地方法院（簡易庭）" },
};

export const TAX_SCOPE                                                                   = { JP: JP_SCOPE, US: US_SCOPE, FR: FR_SCOPE, ES: ES_SCOPE, CN: CN_SCOPE, UK: UK_SCOPE, TW: TW_SCOPE };

const AREA_WORDS                         = {
  tax: ["tax", "税", "稅", "impôt", "impuesto", "tva", "iva", "vat", "hmrc", "irs", "申告", "申报", "申報"],
  labor: ["job", "work", "employer", "salary", "wage", "労働", "雇用", "劳动", "工资", "勞工", "工資", "travail", "salarié", "trabajo", "despido", "employ"],
  claims: ["sue", "court", "裁判", "訴訟", "诉讼", "時効", "时效", "prescription", "tribunal"],
  consumer: ["refund", "cancel", "返品", "退货", "退貨", "rétractation", "desistimiento", "クーリング"],
  tenancy: ["rent", "deposit", "賃貸", "家賃", "租", "押金", "loyer", "bail", "alquiler", "fianza", "landlord"],
};

const norm = (s        ) => s.toLowerCase().normalize("NFKC");

export function intake(x                                                        ) {
  const q = norm(x.question ?? "");
  const pool = WORLD_TOOLS.filter((w) => w.country === x.country);
  const scored = pool
    .map((w) => {
      const hits = w.keywords.filter((k) => q.includes(norm(k)));
      const areaHit = AREA_WORDS[w.area].some((k) => q.includes(norm(k))) ? 0.5 : 0;
      return { tool: w, score: hits.length + (hits.length ? areaHit : 0), hits };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  const matches = scored.slice(0, Math.max(1, x.limit ?? 3)).map((s) => ({ ...s.tool, matched: s.hits }));
  const areas = [...new Set(matches.map((m) => m.area))];
  return {
    asOf: INTAKE_AS_OF,
    country: x.country,
    matches,
    ...(matches.length ? {} : { tools: pool.map(({ area, mcp, page, title }) => ({ area, mcp, page, title })) }),
    help: (areas.length ? areas : (["tax", "labor", "tenancy", "consumer", "claims"]          )).map((a) => ({ area: a, channel: HELP[x.country][a] })),
    taxScope: areas.includes("tax") || !areas.length ? TAX_SCOPE[x.country] : undefined,
    note: "Routing only: general information, no legal or tax advice, no representation, no filing. Areas not covered yet: inheritance in Spain and mainland China, limitation periods in Spain and mainland China, employer payroll in France, Taiwan and mainland China, company filings, tax residency.",
  };
}
