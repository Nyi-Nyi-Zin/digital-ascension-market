import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGUAGES = ["en", "my", "th", "zh", "ja"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  my: "မြန်မာ",
  th: "ไทย",
  zh: "中文",
  ja: "日本語",
};

type MessageKey =
  | "products"
  | "categories"
  | "faq"
  | "signIn"
  | "getStarted"
  | "admin"
  | "myPurchases"
  | "signOut"
  | "allProducts"
  | "support"
  | "all"
  | "viewAll"
  | "featuredProducts"
  | "liveStock"
  | "noProducts"
  | "demoPreview"
  | "previewOnly"
  | "backToStore"
  | "language"
  | "pageNotFound"
  | "goHome"
  | "tryAgain"
  | "thisPageDidntLoad"
  | "somethingWentWrong"
  | "createAccount"
  | "welcomeBack"
  | "startBuying"
  | "signInToTrack"
  | "continueGoogle"
  | "or"
  | "fullName"
  | "email"
  | "password"
  | "atLeastSix"
  | "alreadyHaveAccount"
  | "newToCloudNine"
  | "howItWorks"
  | "browseProducts"
  | "premiumDigitalProducts"
  | "heroDescription"
  | "securePayment"
  | "instantDelivery"
  | "support247"
  | "stepPick"
  | "stepPay"
  | "stepCredentials"
  | "stepPickBody"
  | "stepPayBody"
  | "stepCredentialsBody"
  | "frequentlyAsked"
  | "marketplace"
  | "allRightsReserved";

const messages: Record<Language, Record<MessageKey, string>> = {
  en: {
    products: "Products",
    categories: "Categories",
    faq: "FAQ",
    signIn: "Sign In",
    getStarted: "Get Started",
    admin: "Admin",
    myPurchases: "My Purchases",
    signOut: "Sign out",
    allProducts: "All products",
    support: "Support",
    all: "All",
    viewAll: "View all →",
    featuredProducts: "Featured products",
    liveStock: "Live stock counts, instant delivery after verification.",
    noProducts: "No products in this category yet.",
    demoPreview: "Demo preview",
    previewOnly: "Preview only",
    backToStore: "← Back to store",
    language: "Language",
    pageNotFound: "Page not found",
    goHome: "Go home",
    tryAgain: "Try again",
    thisPageDidntLoad: "This page didn't load",
    somethingWentWrong:
      "Something went wrong on our end. You can try refreshing or head back home.",
    createAccount: "Create your account",
    welcomeBack: "Welcome back",
    startBuying: "Start buying digital products with local payment methods.",
    signInToTrack: "Sign in to track orders and view your credentials.",
    continueGoogle: "Continue with Google",
    or: "or",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    atLeastSix: "At least 6 characters. Special characters are optional.",
    alreadyHaveAccount: "Already have an account?",
    newToCloudNine: "New to Cloud Nine?",
    howItWorks: "How it works",
    browseProducts: "Browse products",
    premiumDigitalProducts: "Premium digital products, delivered on cloud nine",
    heroDescription:
      "AI subscriptions, design tools, virtual cards and streaming accounts — pay with KBZPay, WavePay or bank transfer and receive your credentials the moment we verify.",
    securePayment: "Secure Payment",
    instantDelivery: "Instant Delivery",
    support247: "24/7 Support",
    stepPick: "Pick your product",
    stepPay: "Pay & upload proof",
    stepCredentials: "Get your credentials",
    stepPickBody: "Browse curated AI, design, card and streaming products with live stock counts.",
    stepPayBody: "Transfer with KBZPay, WavePay or bank, then upload your payment screenshot.",
    stepCredentialsBody:
      "Our team verifies manually and your login details unlock in My Purchases.",
    frequentlyAsked: "Frequently asked questions",
    marketplace: "Marketplace",
    allRightsReserved: "All rights reserved.",
  },
  my: {
    products: "ထုတ်ကုန်များ",
    categories: "အမျိုးအစားများ",
    faq: "မေးလေ့ရှိသောမေးခွန်းများ",
    signIn: "ဝင်ရန်",
    getStarted: "စတင်ရန်",
    admin: "စီမံခန့်ခွဲသူ",
    myPurchases: "ကျွန်ုပ်ဝယ်ယူမှုများ",
    signOut: "ထွက်ရန်",
    allProducts: "ထုတ်ကုန်အားလုံး",
    support: "အကူအညီ",
    all: "အားလုံး",
    viewAll: "အားလုံးကြည့်ရန် →",
    featuredProducts: "အထူးပြုထုတ်ကုန်များ",
    liveStock: "လက်ကျန်အရေအတွက်ကို တိုက်ရိုက်ကြည့်ပြီး အတည်ပြုပြီးနောက် ချက်ချင်းပို့ပေးပါသည်။",
    noProducts: "ဤအမျိုးအစားတွင် ထုတ်ကုန်မရှိသေးပါ။",
    demoPreview: "နမူနာကြည့်ရှုမှု",
    previewOnly: "နမူနာသာ",
    backToStore: "← ဆိုင်သို့ပြန်ရန်",
    language: "ဘာသာစကား",
    pageNotFound: "စာမျက်နှာမတွေ့ပါ",
    goHome: "ပင်မစာမျက်နှာ",
    tryAgain: "ထပ်ကြိုးစားရန်",
    thisPageDidntLoad: "ဤစာမျက်နှာ မဖွင့်နိုင်ပါ",
    somethingWentWrong:
      "တစ်စုံတစ်ခုမှားယွင်းနေပါသည်။ Refresh လုပ်ပါ သို့မဟုတ် ပင်မစာမျက်နှာသို့ ပြန်သွားပါ။",
    createAccount: "အကောင့်ဖွင့်ရန်",
    welcomeBack: "ပြန်လည်ကြိုဆိုပါတယ်",
    startBuying: "ဒေသတွင်းငွေပေးချေမှုနည်းလမ်းများဖြင့် ဒစ်ဂျစ်တယ်ထုတ်ကုန်များ စတင်ဝယ်ယူပါ။",
    signInToTrack: "အော်ဒါများနှင့် သင့်အကောင့်အချက်အလက်များကို ကြည့်ရန် ဝင်ပါ။",
    continueGoogle: "Google ဖြင့် ဆက်လုပ်ရန်",
    or: "သို့မဟုတ်",
    fullName: "အမည်အပြည့်အစုံ",
    email: "အီးမေးလ်",
    password: "စကားဝှက်",
    atLeastSix: "အနည်းဆုံး စာလုံး ၆ လုံး။ သင်္ကေတများ မဖြစ်မနေမလိုပါ။",
    alreadyHaveAccount: "အကောင့်ရှိပြီးသားလား?",
    newToCloudNine: "Cloud Nine မှာ အသစ်လား?",
    howItWorks: "အသုံးပြုပုံ",
    browseProducts: "ထုတ်ကုန်များကြည့်ရန်",
    premiumDigitalProducts: "အရည်အသွေးမြင့် ဒစ်ဂျစ်တယ်ထုတ်ကုန်များကို လွယ်ကူစွာရယူပါ",
    heroDescription:
      "AI subscription၊ design tools၊ virtual cards နှင့် streaming account များကို KBZPay၊ WavePay သို့မဟုတ် ဘဏ်လွှဲဖြင့် ပေးချေပြီး အတည်ပြုပြီးသည်နှင့် ရယူပါ။",
    securePayment: "လုံခြုံသောငွေပေးချေမှု",
    instantDelivery: "ချက်ချင်းပို့ဆောင်မှု",
    support247: "၂၄/၇ အကူအညီ",
    stepPick: "ထုတ်ကုန်ရွေးပါ",
    stepPay: "ငွေပေးပြီး အထောက်အထားတင်ပါ",
    stepCredentials: "အကောင့်အချက်အလက်ရယူပါ",
    stepPickBody:
      "AI၊ design၊ card နှင့် streaming ထုတ်ကုန်များကို လက်ကျန်အရေအတွက်နှင့်အတူ ကြည့်ရှုပါ။",
    stepPayBody: "KBZPay၊ WavePay သို့မဟုတ် ဘဏ်ဖြင့် ငွေလွှဲပြီး screenshot တင်ပါ။",
    stepCredentialsBody:
      "အဖွဲ့က စစ်ဆေးပြီး My Purchases ထဲတွင် login အချက်အလက်များကို ဖွင့်ပေးပါမည်။",
    frequentlyAsked: "မေးလေ့ရှိသောမေးခွန်းများ",
    marketplace: "ဈေးကွက်",
    allRightsReserved: "မူပိုင်ခွင့်အားလုံး ရှိပါသည်။",
  },
  th: {
    products: "สินค้า",
    categories: "หมวดหมู่",
    faq: "คำถามที่พบบ่อย",
    signIn: "เข้าสู่ระบบ",
    getStarted: "เริ่มต้นใช้งาน",
    admin: "ผู้ดูแลระบบ",
    myPurchases: "การซื้อของฉัน",
    signOut: "ออกจากระบบ",
    allProducts: "สินค้าทั้งหมด",
    support: "ช่วยเหลือ",
    all: "ทั้งหมด",
    viewAll: "ดูทั้งหมด →",
    featuredProducts: "สินค้าแนะนำ",
    liveStock: "ดูสต็อกแบบเรียลไทม์และจัดส่งทันทีหลังตรวจสอบ",
    noProducts: "ยังไม่มีสินค้าในหมวดหมู่นี้",
    demoPreview: "ตัวอย่างเดโม",
    previewOnly: "ดูตัวอย่างเท่านั้น",
    backToStore: "← กลับไปที่ร้าน",
    language: "ภาษา",
    pageNotFound: "ไม่พบหน้านี้",
    goHome: "กลับหน้าหลัก",
    tryAgain: "ลองอีกครั้ง",
    thisPageDidntLoad: "หน้านี้โหลดไม่ได้",
    somethingWentWrong: "เกิดข้อผิดพลาด ลองรีเฟรชหรือกลับไปหน้าหลัก",
    createAccount: "สร้างบัญชีของคุณ",
    welcomeBack: "ยินดีต้อนรับกลับ",
    startBuying: "เริ่มซื้อสินค้าดิจิทัลด้วยวิธีชำระเงินท้องถิ่น",
    signInToTrack: "เข้าสู่ระบบเพื่อติดตามคำสั่งซื้อและดูข้อมูลของคุณ",
    continueGoogle: "ดำเนินการต่อด้วย Google",
    or: "หรือ",
    fullName: "ชื่อเต็ม",
    email: "อีเมล",
    password: "รหัสผ่าน",
    atLeastSix: "อย่างน้อย 6 ตัวอักษร ไม่จำเป็นต้องมีอักขระพิเศษ",
    alreadyHaveAccount: "มีบัญชีอยู่แล้วใช่ไหม?",
    newToCloudNine: "เพิ่งรู้จัก Cloud Nine หรือไม่?",
    howItWorks: "วิธีการทำงาน",
    browseProducts: "ดูสินค้า",
    premiumDigitalProducts: "สินค้าดิจิทัลพรีเมียม ส่งตรงถึงคุณ",
    heroDescription:
      "สมัครสมาชิก AI เครื่องมือออกแบบ บัตรเสมือน และบัญชีสตรีมมิ่ง ชำระผ่านวิธีท้องถิ่นและรับข้อมูลหลังตรวจสอบ",
    securePayment: "ชำระเงินปลอดภัย",
    instantDelivery: "จัดส่งทันที",
    support247: "ช่วยเหลือ 24/7",
    stepPick: "เลือกสินค้า",
    stepPay: "ชำระเงินและอัปโหลดหลักฐาน",
    stepCredentials: "รับข้อมูลการใช้งาน",
    stepPickBody: "เรียกดูสินค้า AI ออกแบบ บัตร และสตรีมมิ่งพร้อมสต็อกแบบเรียลไทม์",
    stepPayBody: "โอนเงินแล้วอัปโหลดภาพหลักฐานการชำระเงิน",
    stepCredentialsBody: "ทีมงานตรวจสอบและเปิดข้อมูลในรายการซื้อของฉัน",
    frequentlyAsked: "คำถามที่พบบ่อย",
    marketplace: "มาร์เก็ตเพลส",
    allRightsReserved: "สงวนลิขสิทธิ์",
  },
  zh: {
    products: "产品",
    categories: "分类",
    faq: "常见问题",
    signIn: "登录",
    getStarted: "开始使用",
    admin: "管理员",
    myPurchases: "我的订单",
    signOut: "退出登录",
    allProducts: "全部产品",
    support: "支持",
    all: "全部",
    viewAll: "查看全部 →",
    featuredProducts: "精选产品",
    liveStock: "实时库存，审核后立即交付。",
    noProducts: "此分类暂无产品。",
    demoPreview: "演示预览",
    previewOnly: "仅供预览",
    backToStore: "← 返回商店",
    language: "语言",
    pageNotFound: "页面不存在",
    goHome: "返回首页",
    tryAgain: "重试",
    thisPageDidntLoad: "页面加载失败",
    somethingWentWrong: "发生错误，请刷新或返回首页。",
    createAccount: "创建账户",
    welcomeBack: "欢迎回来",
    startBuying: "使用本地支付方式开始购买数字产品。",
    signInToTrack: "登录以跟踪订单并查看账户信息。",
    continueGoogle: "使用 Google 继续",
    or: "或",
    fullName: "姓名",
    email: "邮箱",
    password: "密码",
    atLeastSix: "至少 6 个字符，不强制要求特殊字符。",
    alreadyHaveAccount: "已经有账户？",
    newToCloudNine: "第一次使用 Cloud Nine？",
    howItWorks: "使用方法",
    browseProducts: "浏览产品",
    premiumDigitalProducts: "优质数字产品，轻松交付",
    heroDescription: "AI 订阅、设计工具、虚拟卡和流媒体账户，支持本地支付，审核后立即获得信息。",
    securePayment: "安全支付",
    instantDelivery: "即时交付",
    support247: "全天候支持",
    stepPick: "选择产品",
    stepPay: "付款并上传凭证",
    stepCredentials: "获取账户信息",
    stepPickBody: "浏览 AI、设计、卡片和流媒体产品及实时库存。",
    stepPayBody: "通过本地方式转账并上传付款截图。",
    stepCredentialsBody: "团队审核后，信息将在我的订单中解锁。",
    frequentlyAsked: "常见问题",
    marketplace: "商城",
    allRightsReserved: "版权所有。",
  },
  ja: {
    products: "商品",
    categories: "カテゴリー",
    faq: "よくある質問",
    signIn: "ログイン",
    getStarted: "始める",
    admin: "管理者",
    myPurchases: "購入履歴",
    signOut: "ログアウト",
    allProducts: "すべての商品",
    support: "サポート",
    all: "すべて",
    viewAll: "すべて見る →",
    featuredProducts: "おすすめ商品",
    liveStock: "在庫をリアルタイムで確認し、確認後すぐにお届けします。",
    noProducts: "このカテゴリーにはまだ商品がありません。",
    demoPreview: "デモプレビュー",
    previewOnly: "プレビューのみ",
    backToStore: "← ストアに戻る",
    language: "言語",
    pageNotFound: "ページが見つかりません",
    goHome: "ホームへ",
    tryAgain: "もう一度試す",
    thisPageDidntLoad: "ページを読み込めませんでした",
    somethingWentWrong: "問題が発生しました。更新するかホームへ戻ってください。",
    createAccount: "アカウントを作成",
    welcomeBack: "おかえりなさい",
    startBuying: "現地の支払い方法でデジタル商品を購入できます。",
    signInToTrack: "ログインして注文とアカウント情報を確認してください。",
    continueGoogle: "Googleで続行",
    or: "または",
    fullName: "氏名",
    email: "メール",
    password: "パスワード",
    atLeastSix: "6文字以上。特殊文字は必須ではありません。",
    alreadyHaveAccount: "すでにアカウントをお持ちですか？",
    newToCloudNine: "Cloud Nineは初めてですか？",
    howItWorks: "使い方",
    browseProducts: "商品を見る",
    premiumDigitalProducts: "プレミアムなデジタル商品をすぐにお届け",
    heroDescription:
      "AIサブスクリプション、デザインツール、バーチャルカード、ストリーミングアカウントを現地決済で購入できます。",
    securePayment: "安全な支払い",
    instantDelivery: "即時配信",
    support247: "24時間サポート",
    stepPick: "商品を選ぶ",
    stepPay: "支払いと証明を送信",
    stepCredentials: "情報を受け取る",
    stepPickBody: "AI、デザイン、カード、ストリーミング商品を在庫付きで閲覧できます。",
    stepPayBody: "送金後、支払い画面のスクリーンショットをアップロードします。",
    stepCredentialsBody: "確認後、購入履歴でログイン情報を確認できます。",
    frequentlyAsked: "よくある質問",
    marketplace: "マーケットプレイス",
    allRightsReserved: "無断転載を禁じます。",
  },
};

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
}>({
  language: "en",
  setLanguage: () => undefined,
  t: (key) => messages.en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("cloud-nine-language") as Language | null;
    return saved && LANGUAGES.includes(saved) ? saved : "en";
  });

  function setLanguage(next: Language) {
    setLanguageState(next);
    window.localStorage.setItem("cloud-nine-language", next);
  }

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: MessageKey) => messages[language][key] ?? messages.en[key],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

export type { MessageKey };
