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
                                                                                   
                                                                       
/** Who the tool is mainly for (2026-11-22, CHOSEUN: split topics people care about from topics practitioners care about).
 *  person: everyday life (job ending, renting, cancelling a purchase, suing, inheritance, residency, personal income tax).
 *  pro: running a business or advising one (filing calendars, penalties, appeals, depreciation, VAT, payroll cost, e-invoicing). */
                                        
                                                                                                                                            
const PRO = /corporate_tax|court_fee|overtime_cap|irregular_hours|gst_registration|kleinunternehmer|withholding|depreciation|capital_allowances|penalty|late_fee|late_payment|late_filing|tax_sanction|appeal|claim_deadline|calendar|employer_cost|einvoic|invoice_transition|verifactu|vat|business_tax|business_income_tax|small_profit|consumption_tax|blue_return|micro_entrepreneur|autonomo|self_employ|estimated_tax/;
export const audienceOf = (mcp        )           => (PRO.test(mcp) ? "pro" : "person");

const T = "https://tools.oiyo.net/";
const t = (country         , area      , mcp        , path        , title        , keywords          )             => ({ country, area, audience: audienceOf(mcp), mcp, page: `${T}${path}/`, title, keywords });

export const WORLD_TOOLS               = [
  t("JP", "tax", "get_jp_tax_calendar", "ja/jp-tax-calendar", "個人事業主の申告・納付期限", ["期限", "いつまで", "確定申告", "予定納税", "納付", "calendar", "deadline"]),
  t("JP", "tax", "calculate_jp_invoice_transition", "ja/japan-invoice-keika-sochi-70", "インボイス経過措置（80%・70%・50%）", ["インボイス", "経過措置", "免税事業者", "仕入税額控除", "適格請求書", "8割", "7割"]),
  t("JP", "tax", "check_jp_company_calendar", "ja/japan-hojin-shinkoku-kigen-calendar", "法人税・消費税の申告期限カレンダー", ["法人税", "決算", "申告期限", "中間申告", "法人の消費税", "決算日"]),
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
  t("US", "tax", "check_us_residency", "en/us-substantial-presence-test-calculator", "Substantial presence test (US tax residency)", ["substantial presence", "tax resident", "resident alien", "nonresident alien", "183 days", "days in the us", "form 8843"]),
  t("US", "tax", "check_us_company_calendar", "en/us-business-tax-return-due-dates", "Business return due dates (1120, 1120-S, 1065)", ["1120", "1120-s", "1065", "corporate return", "fiscal year", "form 7004"]),
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
  t("FR", "tax", "check_fr_einvoicing", "fr/facturation-electronique-calendrier-entreprise", "Calendrier de la facturation électronique", ["facturation électronique", "facture électronique", "e-reporting", "plateforme agréée", "e-invoicing"]),
  t("FR", "tax", "check_fr_company_calendar", "fr/delai-approbation-depot-comptes-annuels", "Approbation et dépôt des comptes annuels", ["comptes annuels", "approbation des comptes", "greffe", "dépôt des comptes", "clôture", "assemblée"]),
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
  t("ES", "tax", "check_es_residency", "es/residencia-fiscal-espana-183-dias", "Residencia fiscal en España", ["residencia fiscal", "residente fiscal", "183 días", "no residente", "centro de intereses"]),
  t("ES", "tax", "check_es_verifactu", "es/verifactu-plazo-obligatorio-2027", "Plazo VERI*FACTU", ["verifactu", "veri*factu", "programa de facturación", "software de facturación", "factura electrónica", "sii"]),
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
  t("UK", "tax", "check_uk_residency", "en/uk-statutory-residence-test-calculator", "Statutory residence test (UK)", ["statutory residence", "srt", "uk resident", "non-resident", "uk ties", "days in the uk", "residence test"]),
  t("UK", "tax", "check_uk_company_calendar", "en/uk-company-accounts-ct600-deadlines", "Company accounts, Corporation Tax and CT600 deadlines", ["companies house", "annual accounts", "ct600", "corporation tax", "company tax return", "year end"]),
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
  t("TW", "tax", "check_tw_residency", "zh/taiwan-tax-resident-183-31-days", "稅務居住者判定（31天／183天）", ["居住者", "非居住者", "183天", "31天", "稅務居民", "戶籍"]),
  t("TW", "tax", "calculate_tw_income_tax", "zh/taiwan-income-tax-calculator", "綜合所得稅試算", ["綜合所得稅", "所得稅", "免稅額", "扣除額", "級距"]),
  t("TW", "tax", "check_tw_business_tax", "zh/taiwan-business-tax-threshold", "營業稅起徵點與小規模營業人", ["營業稅", "起徵點", "小規模", "統一發票", "1%"]),
  t("TW", "tax", "calculate_tw_late_fee", "zh/taiwan-late-tax-penalty-appeal", "滯納金", ["滯納金", "逾期", "遲繳"]),
  t("TW", "tax", "calculate_tw_tax_appeal_deadlines", "zh/taiwan-late-tax-penalty-appeal", "復查·訴願期限", ["復查", "訴願", "不服"]),
  t("TW", "tax", "calculate_tw_depreciation", "zh/taiwan-depreciation-calculator", "固定資產折舊", ["折舊", "耐用年數", "8萬"]),
  t("TW", "labor", "calculate_tw_labor_exit", "zh/taiwan-severance-notice-calculator", "資遣費·預告期間·特休·失業給付", ["資遣", "資遣費", "解僱", "離職", "預告", "特休", "失業給付", "最低工資", "勞退"]),
  t("TW", "tenancy", "check_tw_rental_deposit_termination", "zh/taiwan-rental-deposit-termination", "租屋押金與提前終止", ["租屋", "押金", "房東", "房客", "租約", "提前終止", "退租"]),
  t("TW", "claims", "check_tw_limitation_small_claims", "zh/taiwan-statute-limitation-small-claims", "消滅時效與小額訴訟", ["時效", "消滅時效", "小額訴訟", "欠錢", "欠款", "起訴", "打官司"]),
  t("TW", "consumer", "check_tw_7day_cancellation", "zh/taiwan-7-day-cancellation", "七日解約權", ["七日鑑賞期", "鑑賞期", "七天", "退貨", "網購", "解約", "退款"]),
  t("JP", "labor", "calculate_jp_take_home", "ja/japan-salary-calculator", "給与の手取り（社会保険料・所得税・住民税）", ["手取り", "給料", "給与", "月給", "年収", "天引き", "take home", "net pay"]),
  t("UK", "labor", "calculate_uk_take_home", "en/uk-take-home-pay-calculator-2026", "Take-home pay 2026-27 (tax, NI, student loan)", ["take home", "take-home", "net pay", "salary after tax", "payslip", "how much will i get", "student loan"]),
  t("US", "labor", "calculate_us_take_home", "en/us-take-home-pay-calculator-2026", "Take-home pay 2026 (federal tax and FICA)", ["take home", "take-home", "net pay", "paycheck", "after tax", "fica", "salary after tax"]),
  t("FR", "labor", "calculate_fr_take_home", "fr/france-salary-calculator", "Salaire net après impôt (brut en net)", ["brut en net", "salaire net", "net après impôt", "fiche de paie", "salaire brut", "combien je touche"]),
  t("ES", "labor", "calculate_es_take_home", "es/spain-salary-calculator", "Salario neto (bruto a neto, IRPF y cotizaciones)", ["salario neto", "bruto a neto", "nómina", "cuánto cobro", "sueldo neto", "neto"]),
  t("JP", "labor", "calculate_jp_overtime_cap_check", "en/overtime-cap-holiday-accrual-check", "時間外労働の上限 (36協定)", ["36協定", "サブロク", "特別条項", "時間外労働の上限", "上限規制", "月45時間", "80時間", "100時間", "過労死ライン"]),
  t("UK", "labor", "calculate_uk_irregular_hours_holiday", "en/overtime-cap-holiday-accrual-check", "Holiday accrual for irregular-hours and part-year workers (12.07%)", ["irregular hours", "part-year", "12.07", "zero hours", "zero-hours", "holiday accrual", "accrue holiday", "rolled-up holiday"]),
  t("UK", "labor", "calculate_uk_maternity_pay", "en/parental-pay-calculator-2026", "Statutory Maternity Pay", ["maternity pay", "statutory maternity pay", "smp", "maternity leave pay", "pregnant", "baby"]),
  t("UK", "labor", "calculate_uk_child_benefit", "en/parental-pay-calculator-2026", "Child Benefit and the High Income Child Benefit Charge", ["child benefit", "high income child benefit charge", "hicbc", "child benefit tax charge"]),
  t("JP", "labor", "calculate_jp_childcare_leave_benefit", "en/parental-pay-calculator-2026", "育児休業給付金", ["育児休業給付", "育休手当", "育休給付", "育児休業", "出生後休業支援", "産休", "育休 いくら"]),
  t("DE", "labor", "calculate_de_elterngeld", "en/parental-pay-calculator-2026", "Elterngeld und Kindergeld", ["elterngeld", "elterngeldplus", "elternzeit", "kindergeld", "basiselterngeld"]),
  t("DE", "claims", "calculate_de_late_payment_b2b", "en/b2b-late-payment-interest-calculator", "Verzugszinsen zwischen Unternehmen (§ 288 BGB)", ["verzugszins", "verzugszinsen", "zahlungsverzug", "rechnung nicht bezahlt", "40 euro pauschale", "basiszinssatz"]),
  t("FR", "claims", "calculate_fr_late_payment_b2b", "en/b2b-late-payment-interest-calculator", "Pénalités de retard entre professionnels", ["pénalités de retard", "indemnité forfaitaire", "facture impayée", "retard de paiement", "40 euros", "taux bce", "entre professionnels", "client ne paie pas"]),
  t("ES", "claims", "calculate_es_late_payment_b2b", "en/b2b-late-payment-interest-calculator", "Intereses de demora en operaciones comerciales", ["intereses de demora", "morosidad", "factura impagada", "ley 3/2004", "retraso en el pago"]),
  t("UK", "claims", "calculate_uk_late_payment_b2b", "en/b2b-late-payment-interest-calculator", "Statutory interest on late commercial payments", ["late commercial payment", "statutory interest", "unpaid invoice", "late payment of commercial debts", "debt recovery costs", "8% plus base rate"]),
  t("DE", "tax", "calculate_de_inheritance_tax", "de/erbschaftsteuer-rechner-2026", "Erbschaftsteuer: Freibeträge und Steuersätze", ["erbschaftsteuer", "erbe", "erben", "freibetrag erbschaft", "schenkungsteuer", "steuerklasse erbschaft", "inheritance tax"]),
  t("JP", "claims", "calculate_jp_court_fee", "en/court-fee-calculator-japan-germany", "訴訟の手数料 (収入印紙)", ["手数料", "収入印紙", "印紙代", "訴訟費用", "訴額", "貼用印紙", "裁判費用"]),
  t("DE", "claims", "calculate_de_court_fee", "en/court-fee-calculator-japan-germany", "Gerichtskosten (GKG)", ["gerichtskosten", "gerichtsgebühr", "gerichtskostenvorschuss", "streitwert", "gkg", "kosten einer klage", "mahnbescheid kosten"]),
  t("DE", "claims", "calculate_de_garnishment", "de/pfaendungsfreigrenze-rechner-2026", "Pfändungsfreigrenze für Arbeitseinkommen", ["pfändung", "lohnpfändung", "pfändungsfreigrenze", "pfändungstabelle", "pfändbar", "gehaltspfändung"]),
  t("DE", "consumer", "check_de_withdrawal_deadline", "de/widerruf-kaution-verjaehrung-rechner", "Widerrufsfrist (14 Tage)", ["widerruf", "widerrufsfrist", "online gekauft", "zurückschicken", "haustürgeschäft", "fernabsatz"]),
  t("DE", "tenancy", "check_de_rent_deposit", "de/widerruf-kaution-verjaehrung-rechner", "Mietkaution: Höchstbetrag und Raten", ["kaution", "mietkaution", "drei monatsmieten", "kaution raten", "mietsicherheit"]),
  t("DE", "claims", "check_de_limitation_period", "de/widerruf-kaution-verjaehrung-rechner", "Verjährung von Forderungen", ["verjährung", "verjährt", "verjährungsfrist", "forderung verjährt", "drei jahre"]),
  t("UK", "tax", "calculate_uk_home_purchase_tax", "en/uk-stamp-duty-calculator-2026", "Stamp Duty Land Tax on a home", ["stamp duty", "sdlt", "first-time buyer", "first time buyer", "buying a house", "buying a home", "second home", "buy to let"]),
  t("JP", "tax", "calculate_jp_home_purchase_tax", "ja/acquisition-tax-calculator", "家を買うときの税金（不動産取得税・登録免許税・印紙税）", ["不動産取得税", "登録免許税", "印紙税", "家を買う", "マイホーム", "住宅購入", "売買契約書"]),
  t("FR", "tax", "calculate_fr_home_purchase_tax", "fr/acquisition-tax-calculator", "Droits de mutation à l'achat d'un logement", ["frais de notaire", "droits de mutation", "achat immobilier", "primo-accédant", "dmto", "acheter un appartement"]),
  t("ES", "tax", "calculate_es_home_purchase_tax", "es/acquisition-tax-calculator", "Impuestos al comprar vivienda (ITP, IVA, AJD)", ["itp", "comprar piso", "comprar vivienda", "ajd", "impuesto transmisiones", "obra nueva"]),
  t("CN", "tax", "calculate_cn_home_purchase_tax", "zh/acquisition-tax-calculator", "买房契税", ["契税", "买房", "首套房", "二套房", "购房"]),
  t("JP", "tax", "calculate_jp_corporate_tax", "en/corporate-tax-calculator-2026", "法人税額（税率23.2%・中小法人15%）", ["法人税率", "法人税額", "中小法人", "軽減税率", "800万円", "資本金1億円", "法人税 いくら", "法人税の計算"]),
  t("UK", "tax", "calculate_uk_corporate_tax", "en/corporate-tax-calculator-2026", "Corporation Tax with marginal relief", ["corporation tax rate", "marginal relief", "small profits rate", "associated companies", "how much corporation tax", "ct rate"]),
  t("US", "tax", "calculate_us_corporate_tax", "en/corporate-tax-calculator-2026", "Federal corporate income tax (21%)", ["corporate tax rate", "c corporation tax", "c corp", "21%", "federal corporate tax", "how much corporate tax"]),
  t("FR", "tax", "calculate_fr_corporate_tax", "en/corporate-tax-calculator-2026", "Impôt sur les sociétés (taux normal et taux réduit PME)", ["impôt sur les sociétés", "taux réduit", "42 500", "is pme", "taux de l'is", "combien d'is"]),
  t("ES", "tax", "calculate_es_corporate_tax", "en/corporate-tax-calculator-2026", "Impuesto sobre Sociedades (tipos 2026)", ["impuesto sobre sociedades", "tipo de gravamen", "microempresa", "reducida dimensión", "nueva creación", "cuánto pago de sociedades"]),
  t("DE", "tax", "calculate_de_corporate_tax", "en/corporate-tax-calculator-2026", "Körperschaftsteuer und Gewerbesteuer", ["körperschaftsteuer", "gewerbesteuer", "hebesatz", "gmbh steuer", "kapitalgesellschaft", "unternehmenssteuer"]),
  t("JP", "tax", "check_jp_withholding", "en/withholding-tax-non-resident-payments", "非居住者への支払と源泉徴収税率", ["非居住者", "源泉徴収", "海外", "使用料", "20.42", "外国法人", "withholding"]),
  t("US", "tax", "check_us_withholding", "en/withholding-tax-non-resident-payments", "NRA withholding on payments to non-residents (30%)", ["nra withholding", "withholding", "non-resident", "nonresident", "fdap", "1042", "w-8ben", "foreign contractor"]),
  t("FR", "tax", "check_fr_withholding", "en/withholding-tax-non-resident-payments", "Retenue à la source sur paiements aux non-résidents (art. 182 B)", ["retenue à la source", "non-résident", "182 b", "redevances", "prestataire étranger"]),
  t("ES", "tax", "check_es_withholding", "en/withholding-tax-non-resident-payments", "Retenciones IRNR a no residentes", ["no residente", "irnr", "retención", "modelo 216", "cánones", "pago al extranjero"]),
  t("TW", "tax", "check_tw_withholding", "en/withholding-tax-non-resident-payments", "非居住者扣繳率", ["非居住者", "扣繳", "權利金", "外國", "境外", "扣繳率"]),
  t("DE", "tax", "check_de_withholding", "en/withholding-tax-non-resident-payments", "Steuerabzug nach § 50a EStG", ["50a", "steuerabzug", "beschränkt steuerpflichtig", "lizenz", "ausland", "quellensteuer"]),
  t("DE", "tax", "calculate_de_income_tax", "de/einkommensteuer-rechner-2026", "Einkommensteuer 2026 und Solidaritätszuschlag", ["einkommensteuer", "steuer", "zve", "grundfreibetrag", "splitting", "soli", "solidaritätszuschlag", "steuersatz", "income tax"]),
  t("DE", "labor", "calculate_de_notice_period", "de/kuendigungsfrist-rechner", "Kündigungsfrist nach § 622 BGB", ["kündigung", "kündigungsfrist", "gekündigt", "kündigen", "probezeit", "letzter arbeitstag", "notice", "fired", "dismissal"]),
  t("DE", "labor", "check_de_minimum_wage", "de/kuendigungsfrist-rechner", "Mindestlohn und Minijob-Grenze", ["mindestlohn", "minijob", "stundenlohn", "minimum wage", "603", "13,90", "13.90"]),
  t("DE", "tax", "check_de_einvoicing", "de/e-rechnung-pflicht-ab-wann", "E-Rechnung: ab wann Pflicht", ["e-rechnung", "erechnung", "xrechnung", "zugferd", "rechnung", "e-invoice", "einvoice"]),
  t("DE", "tax", "calculate_de_kleinunternehmer_vat", "en/small-business-vat-registration-check", "Kleinunternehmerregelung (§ 19 UStG)", ["kleinunternehmer", "kleinunternehmerregelung", "§ 19 ustg", "umsatzgrenze", "ohne umsatzsteuer", "25.000", "100.000"]),
  t("SG", "tax", "calculate_sg_gst_registration", "en/small-business-vat-registration-check", "GST registration (S$1 million)", ["gst registration", "register for gst", "gst-registered", "s$1 million", "retrospective view", "prospective view", "gst threshold"]),
  t("SG", "tax", "calculate_sg_income_tax", "en/singapore-income-tax-calculator", "Singapore income tax (IRAS rates, YA 2024 onwards)", ["income tax", "iras", "chargeable income", "tax resident", "non-resident", "rebate", "year of assessment"]),
  t("SG", "labor", "calculate_sg_cpf", "en/singapore-cpf-contribution-calculator-2026", "CPF contributions 2026", ["cpf", "contribution", "employer share", "ordinary wage", "payslip"]),
  t("SG", "labor", "calculate_sg_notice_period", "en/singapore-notice-period-calculator", "Notice period under the Employment Act", ["notice", "resign", "resignation", "terminate", "fired", "dismissed", "last day", "employment act"]),
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
  // DE and SG (2026-11-22): read from the statutes and official pages listed in de-sg-facts-2026-11-22.md.
  DE: { tax: "Finanzamt; for employees, a Lohnsteuerhilfeverein (members with employment or pension income only, income tax only, § 4 StBerG)", labor: "Gewerkschaft (for members, § 7 RDG); on a low income, Beratungshilfe at your Amtsgericht (BerHG)", tenancy: "Beratungshilfe at your Amtsgericht (BerHG); no tenancy tool yet", consumer: "Verbraucherzentrale (§ 8 RDG); no consumer tool yet", claims: "Beratungshilfe at your Amtsgericht (BerHG); no time-limit tool yet" },
  SG: { tax: "IRAS", labor: "TADM: mediation is compulsory before the Employment Claims Tribunals (salary claims within 1 year while employed or 6 months after leaving; wrongful dismissal within 1 month; up to $20,000, or $30,000 through tripartite or union mediation)", tenancy: "Small Claims Tribunals for a residential tenancy of up to 2 years (up to $20,000, or $30,000 with consent; file within 2 years)", consumer: "Small Claims Tribunals, including unfair practices under the CPFTA (up to $20,000, file within 2 years)", claims: "Small Claims Tribunals (up to $20,000, file within 2 years); free 20-minute guidance at the Community Legal Clinics (Pro Bono SG, 6536 0650); Legal Aid Bureau for citizens and PRs with limited means" },
  TW: { tax: "國稅局免付費電話 0800-000-321", labor: "地方勞工局", tenancy: "地方消保官或地政機關", consumer: "行政院消費者保護會、縣市消費者服務中心", claims: "各地方法院（簡易庭）" },
};

const DE_SCOPE = [
  { title: "Who may give tax help", body: "Tax help for others, paid or unpaid, is reserved to authorised people: Steuerberater, Steuerbevollmächtigte, Rechtsanwälte, Wirtschaftsprüfer and vereidigte Buchprüfer, among others.", cite: "§§ 2, 3 StBerG" },
  { title: "Lohnsteuerhilfeverein", body: "May help members with employment income, certain recurring and pension payments and maintenance, for income tax only. Not for members with business, farming or self-employed income or VAT-liable sales.", cite: "§ 4 StBerG" },
  { title: "This guide", body: "General information only. It gives no tax help in a single case and does not represent anyone.", cite: "—" },
];
const SG_SCOPE = [
  { title: "Tax agents", body: "We did not find on the IRAS pages we read whether tax agents in Singapore must be licensed or accredited, so this guide does not say. Ask IRAS.", cite: "IRAS (tax agents page)" },
  { title: "This guide", body: "General information only. It gives no tax advice and does not represent anyone.", cite: "—" },
];
export const TAX_SCOPE                                                                   = { JP: JP_SCOPE, US: US_SCOPE, FR: FR_SCOPE, ES: ES_SCOPE, CN: CN_SCOPE, UK: UK_SCOPE, TW: TW_SCOPE, DE: DE_SCOPE, SG: SG_SCOPE };

const AREA_WORDS                         = {
  tax: ["tax", "steuer", "finanzamt", "税", "稅", "impôt", "impuesto", "tva", "iva", "vat", "hmrc", "irs", "申告", "申报", "申報"],
  labor: ["job", "work", "employer", "salary", "wage", "労働", "雇用", "劳动", "工资", "勞工", "工資", "travail", "salarié", "trabajo", "despido", "employ", "arbeit", "lohn", "gehalt"],
  claims: ["sue", "court", "裁判", "訴訟", "诉讼", "時効", "时效", "prescription", "tribunal"],
  consumer: ["refund", "cancel", "返品", "退货", "退貨", "rétractation", "desistimiento", "クーリング"],
  tenancy: ["rent", "deposit", "賃貸", "家賃", "租", "押金", "loyer", "bail", "alquiler", "fianza", "landlord"],
};

const norm = (s        ) => s.toLowerCase().normalize("NFKC");

export function intake(x                                                                             ) {
  const q = norm(x.question ?? "");
  const aud = x.audience === "person" || x.audience === "pro" ? x.audience : undefined;
  const pool = WORLD_TOOLS.filter((w) => w.country === x.country && (!aud || w.audience === aud));
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
    ...(aud ? { audience: aud } : {}),
    matches,
    ...(matches.length ? {} : { tools: pool.map(({ area, audience, mcp, page, title }) => ({ area, audience, mcp, page, title })) }),
    help: (areas.length ? areas : (["tax", "labor", "tenancy", "consumer", "claims"]          )).map((a) => ({ area: a, channel: HELP[x.country][a] })),
    taxScope: areas.includes("tax") || !areas.length ? TAX_SCOPE[x.country] : undefined,
    note: "Routing only: general information, no legal or tax advice, no representation, no filing. Areas not covered yet: inheritance in Spain and mainland China, limitation periods in Spain and mainland China, employer payroll in France, Taiwan and mainland China, company filing calendars in Spain, Taiwan and mainland China, tax residency in mainland China; in Germany and Singapore only income tax, notice periods, minimum wage or CPF and German e-invoicing so far.",
  };
}
