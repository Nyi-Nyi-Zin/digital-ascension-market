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
  | "allRightsReserved"
  | "home"
  | "switchToLight"
  | "switchToDark"
  | "toggleMenu"
  | "units"
  | "dashboard"
  | "adminDashboard"
  | "availableUnits"
  | "fixedUnitRate"
  | "productPricesInUsd"
  | "unitsToBuy"
  | "exactAmountToTransfer"
  | "enterUsdUnits"
  | "examples"
  | "localPayment"
  | "transferExactly"
  | "submitPaymentProof"
  | "afterTransferInstruction"
  | "transactionIdNote"
  | "paymentScreenshot"
  | "chooseImage"
  | "pendingVerification"
  | "topupHistory"
  | "noTopups"
  | "exampleProduct"
  | "unitTopupSubmitted"
  | "enterUnitAmount"
  | "invalidNote"
  | "uploadScreenshot"
  | "imageFileOnly"
  | "screenshotMax"
  | "topupSubmitError"
  | "balance"
  | "unitsRequired"
  | "inStock"
  | "previewCount"
  | "signInToPurchase"
  | "publicBrowseNotice"
  | "tryPurchase"
  | "walletManagement"
  | "unitTopups"
  | "noPaymentProof"
  | "optionalRejectionReason"
  | "reject"
  | "approveAndCredit"
  | "approved"
  | "rejected"
  | "pending"
  | "dashboardSummary"
  | "totalRevenue"
  | "pendingOrders"
  | "totalProducts"
  | "totalCustomers"
  | "recentOrders"
  | "reviewOrders"
  | "noOrders"
  | "adminOnly"
  | "adminOnlyDescription"
  | "orderNotFound"
  | "orderReceived"
  | "orderId"
  | "product"
  | "total"
  | "paidWith"
  | "viewMyPurchases"
  | "keepShopping"
  | "reason"
  | "growthDiscoverability"
  | "seoAnalytics"
  | "analyticsDescription"
  | "pageviews"
  | "uniqueVisitors"
  | "publicPagesTracked"
  | "searchConsole"
  | "notConnected"
  | "visitorTrend"
  | "pageviewsPerDay"
  | "deviceMix"
  | "noPageviews"
  | "topPublicPages"
  | "trafficReferrers"
  | "noData"
  | "seoHealth"
  | "publicCrawlAssets"
  | "sitemapReady"
  | "sitemapXml"
  | "robotsTxt"
  | "analyticsTableMissing"
  | "applyAnalyticsMigration"
  | "days"
  | "lightMode"
  | "darkMode"
  | "footerDescription"
  | "paymentMethods"
  | "price"
  | "insufficientBalance"
  | "trackPurchases"
  | "credentials"
  | "credentialsPreparing"
  | "viewDetails"
  | "hideDetails"
  | "copied"
  | "copy"
  | "qty"
  | "awaitingVerification"
  | "checkoutWithUnits"
  | "temporaryPurchaseMode"
  | "purchaseTemporarilyUnavailable"
  | "checkingAvailability"
  | "stockUnavailable"
  | "unitPrice"
  | "unitsUsed"
  | "lovedByCustomers";

const messages: Record<Language, Partial<Record<MessageKey, string>>> = {
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

const extraMessages: Record<Language, Partial<Record<MessageKey, string>>> = {
  en: {
    home: "Home", lovedByCustomers: "Loved by 12,000+ customers", switchToLight: "Switch to light mode", switchToDark: "Switch to dark mode", toggleMenu: "Toggle menu", units: "Units", dashboard: "Dashboard", adminDashboard: "Admin dashboard",
    availableUnits: "Available units", fixedUnitRate: "Fixed unit rate", productPricesInUsd: "Product prices remain in USD. Add units with MMK and spend them on digital products.", unitsToBuy: "Units to buy", exactAmountToTransfer: "Exact amount to transfer", enterUsdUnits: "Enter your USD units above", examples: "Examples: 5 USD = 18,315 MMK · 10 USD = 36,630 MMK · 50 USD = 183,150 MMK", localPayment: "Local payment", transferExactly: "Transfer exactly", submitPaymentProof: "Submit payment proof", afterTransferInstruction: "After transferring the exact amount, enter your transaction ID and upload the payment screenshot. Your units stay pending until an admin verifies the proof.", transactionIdNote: "Transaction ID / note (required)", paymentScreenshot: "Payment screenshot (required)", chooseImage: "Choose an image (PNG, JPG, or WEBP · max 5MB)", pendingVerification: "Your submission will show as pending until an admin verifies the transfer and credits your units.", topupHistory: "Top-up history", noTopups: "No unit top-ups yet. Submit your first payment proof to add units.", exampleProduct: "Example: a $12.00 product requires 12.00 units.", unitTopupSubmitted: "Unit top-up submitted for verification", enterUnitAmount: "Enter a unit amount between 0.01 and 10,000.", invalidNote: "Invalid note", uploadScreenshot: "Please upload your payment screenshot", imageFileOnly: "Please upload an image file", screenshotMax: "Screenshot must be smaller than 5MB", topupSubmitError: "Could not submit the unit top-up", balance: "Balance", unitsRequired: "units required", inStock: "in stock", previewCount: "preview count", signInToPurchase: "Sign in to purchase", publicBrowseNotice: "Product details are public to browse. Sign in is required before purchase.", tryPurchase: "Try purchase", walletManagement: "Wallet management", unitTopups: "Unit top-ups", noPaymentProof: "No payment proof uploaded.", optionalRejectionReason: "Optional rejection reason", reject: "Reject", approveAndCredit: "Approve and credit units", approved: "Approved", rejected: "Rejected", pending: "Pending", dashboardSummary: "Verify payments, manage stock and keep deliveries flowing.", totalRevenue: "Total revenue", pendingOrders: "Pending orders", totalProducts: "Total products", totalCustomers: "Total customers", recentOrders: "Recent orders", reviewOrders: "Review orders", noOrders: "No orders yet.", adminOnly: "Admins only", adminOnlyDescription: "This area is restricted to Cloud Nine staff accounts.", orderNotFound: "Order not found", orderReceived: "Order received", orderId: "Order ID", product: "Product", total: "Total", paidWith: "Paid with", viewMyPurchases: "View my purchases", keepShopping: "Keep shopping", reason: "Reason", growthDiscoverability: "Growth and discoverability", seoAnalytics: "SEO & visitor analytics", analyticsDescription: "Privacy-safe first-party pageview summary. Account, checkout, wallet and admin routes are never tracked.", pageviews: "Pageviews", uniqueVisitors: "Unique visitors", publicPagesTracked: "Public pages tracked", searchConsole: "Search Console", notConnected: "Not connected", visitorTrend: "Visitor trend", pageviewsPerDay: "Pageviews per day", deviceMix: "Device mix", noPageviews: "No pageviews collected yet.", topPublicPages: "Top public pages", trafficReferrers: "Traffic referrers", noData: "No data collected yet.", seoHealth: "SEO health", publicCrawlAssets: "Public crawl assets are deployed.", sitemapReady: "Sitemap ready", sitemapXml: "Sitemap.xml", robotsTxt: "Robots.txt", analyticsTableMissing: "Analytics table is not available yet.", applyAnalyticsMigration: "Apply the analytics migration in Supabase to start collecting pageviews.",     days: "days", lightMode: "Light mode", darkMode: "Dark mode", footerDescription: "A curated marketplace for digital subscriptions, design tools, virtual cards and streaming accounts — paid locally, delivered instantly.", paymentMethods: "KBZPay · WavePay · Bank", price: "Price", insufficientBalance: "Insufficient balance", trackPurchases: "Track verification status and copy your delivered credentials.", credentials: "Your credentials", credentialsPreparing: "Credentials are being prepared — refresh in a moment.", viewDetails: "View details", hideDetails: "Hide details", copied: "Copied", copy: "Copy", qty: "Qty", awaitingVerification: "Awaiting manual payment verification — usually within 3 hours.", checkoutWithUnits: "Checkout with units", temporaryPurchaseMode: "Temporary purchase mode is active. Buy attempts do not deduct units or create orders.", purchaseTemporarilyUnavailable: "Purchase temporarily unavailable", checkingAvailability: "Checking availability…", stockUnavailable: "Stock unavailable — no units were deducted.", unitPrice: "Unit price", unitsUsed: "Units used",

  },
  my: {
    home: "ပင်မ", lovedByCustomers: "ဖောက်သည် ၁၂,၀၀၀ ကျော်၏ အားပေးမှုရရှိထားသည်", switchToLight: "အလင်းမုဒ်ပြောင်းရန်", switchToDark: "အမှောင်မုဒ်ပြောင်းရန်", toggleMenu: "မီနူးဖွင့်/ပိတ်ရန်", units: "ယူနစ်များ", dashboard: "ဒက်ရှ်ဘုတ်", adminDashboard: "စီမံခန့်ခွဲသူ ဒက်ရှ်ဘုတ်",
    availableUnits: "ရရှိနိုင်သောယူနစ်", fixedUnitRate: "သတ်မှတ်ယူနစ်နှုန်း", productPricesInUsd: "ထုတ်ကုန်စျေးနှုန်းများကို USD ဖြင့်ပြထားပါသည်။ MMK ဖြင့် ယူနစ်ထည့်ပြီး ဒစ်ဂျစ်တယ်ထုတ်ကုန်များတွင် အသုံးပြုပါ။", unitsToBuy: "ဝယ်မည့်ယူနစ်", exactAmountToTransfer: "တိတိကျကျ လွှဲရမည့်ပမာဏ", enterUsdUnits: "အထက်တွင် USD ယူနစ်ပမာဏ ထည့်ပါ", examples: "ဥပမာ: 5 USD = 18,315 MMK · 10 USD = 36,630 MMK · 50 USD = 183,150 MMK", localPayment: "ဒေသတွင်းငွေပေးချေမှု", transferExactly: "တိတိကျကျ လွှဲရန်", submitPaymentProof: "ငွေပေးချေမှုအထောက်အထား တင်ရန်", afterTransferInstruction: "တိတိကျကျ ပမာဏလွှဲပြီးနောက် transaction ID ထည့်ကာ payment screenshot တင်ပါ။ Admin စစ်ဆေးသည်အထိ ယူနစ်များ pending ဖြစ်နေပါမည်။", transactionIdNote: "Transaction ID / မှတ်ချက် (မဖြစ်မနေ)", paymentScreenshot: "ငွေပေးချေမှု screenshot (မဖြစ်မနေ)", chooseImage: "ပုံရွေးပါ (PNG, JPG, WEBP · 5MB အောက်)", pendingVerification: "Admin က စစ်ဆေးပြီး ယူနစ်ထည့်ပေးသည်အထိ pending အဖြစ်ပြပါမည်။", topupHistory: "ယူနစ်ဖြည့်မှတ်တမ်း", noTopups: "ယူနစ်ဖြည့်ထားခြင်း မရှိသေးပါ။ ပထမဆုံး payment proof တင်ပါ။", exampleProduct: "ဥပမာ: $12.00 ထုတ်ကုန်သည် 12.00 ယူနစ်လိုပါသည်။", unitTopupSubmitted: "ယူနစ်ဖြည့်တင်ပြချက်ကို စစ်ဆေးရန် တင်ပြီးပါပြီ", enterUnitAmount: "0.01 မှ 10,000 အတွင်း ယူနစ်ပမာဏထည့်ပါ။", invalidNote: "မှတ်ချက်မမှန်ပါ", uploadScreenshot: "Payment screenshot တင်ပါ", imageFileOnly: "ပုံဖိုင်သာ တင်ပါ", screenshotMax: "Screenshot သည် 5MB အောက် ဖြစ်ရပါမည်", topupSubmitError: "ယူနစ်ဖြည့်တင်ပြချက် မတင်နိုင်ပါ", balance: "လက်ကျန်", unitsRequired: "ယူနစ်လိုအပ်သည်", inStock: "လက်ကျန်ရှိသည်", previewCount: "နမူနာအရေအတွက်", signInToPurchase: "ဝယ်ယူရန် ဝင်ပါ", publicBrowseNotice: "ထုတ်ကုန်အသေးစိတ်ကို အများပြည်သူကြည့်နိုင်ပါသည်။ ဝယ်ယူရန် ဝင်ရပါမည်။", tryPurchase: "ဝယ်ယူရန် စမ်းပါ", walletManagement: "Wallet စီမံခန့်ခွဲမှု", unitTopups: "ယူနစ်ဖြည့်တင်ပြချက်များ", noPaymentProof: "Payment proof တင်ထားခြင်း မရှိပါ။", optionalRejectionReason: "ငြင်းပယ်ရသည့်အကြောင်းရင်း (မဖြစ်မနေမဟုတ်)", reject: "ငြင်းပယ်ရန်", approveAndCredit: "အတည်ပြုပြီး ယူနစ်ထည့်ရန်", approved: "အတည်ပြုပြီး", rejected: "ငြင်းပယ်ပြီး", pending: "စောင့်ဆိုင်းနေသည်", dashboardSummary: "ငွေပေးချေမှုစစ်ဆေးပြီး stock နဲ့ delivery ကို စီမံပါ။", totalRevenue: "စုစုပေါင်းဝင်ငွေ", pendingOrders: "စောင့်ဆိုင်းနေသောအော်ဒါများ", totalProducts: "ထုတ်ကုန်စုစုပေါင်း", totalCustomers: "ဖောက်သည်စုစုပေါင်း", recentOrders: "လတ်တလောအော်ဒါများ", reviewOrders: "အော်ဒါစစ်ဆေးရန်", noOrders: "အော်ဒါမရှိသေးပါ။", adminOnly: "စီမံခန့်ခွဲသူများသာ", adminOnlyDescription: "ဤနေရာကို Cloud Nine ဝန်ထမ်းအကောင့်များသာ ဝင်နိုင်ပါသည်။", orderNotFound: "အော်ဒါမတွေ့ပါ", orderReceived: "အော်ဒါလက်ခံရရှိပါပြီ", orderId: "အော်ဒါ ID", product: "ထုတ်ကုန်", total: "စုစုပေါင်း", paidWith: "ပေးချေသည့်နည်းလမ်း", viewMyPurchases: "ကျွန်ုပ်ဝယ်ယူမှုများကြည့်ရန်", keepShopping: "ဆက်လက်ဝယ်ယူရန်", reason: "အကြောင်းရင်း", growthDiscoverability: "တိုးတက်မှုနှင့် ရှာဖွေတွေ့ရှိနိုင်မှု", seoAnalytics: "SEO နှင့် လာရောက်ကြည့်ရှုသူခွဲခြမ်းစိတ်ဖြာမှု", analyticsDescription: "Privacy-safe pageview အကျဉ်းချုပ်။ Account၊ checkout၊ wallet နှင့် admin စာမျက်နှာများကို မမှတ်တမ်းတင်ပါ။", pageviews: "စာမျက်နှာကြည့်ရှုမှု", uniqueVisitors: "ထူးခြားလာရောက်သူများ", publicPagesTracked: "မှတ်တမ်းတင်ထားသော public စာမျက်နှာများ", searchConsole: "Search Console", notConnected: "မချိတ်ဆက်ရသေးပါ", visitorTrend: "လာရောက်သူလမ်းကြောင်း", pageviewsPerDay: "တစ်နေ့စာမျက်နှာကြည့်ရှုမှု", deviceMix: "စက်အမျိုးအစား", noPageviews: "Pageview မစုဆောင်းရသေးပါ။", topPublicPages: "လူကြည့်အများဆုံး public စာမျက်နှာများ", trafficReferrers: "Traffic referrer များ", noData: "ဒေတာမစုဆောင်းရသေးပါ။", seoHealth: "SEO အခြေအနေ", publicCrawlAssets: "Public crawl assets များ deploy လုပ်ပြီးပါပြီ။", sitemapReady: "Sitemap အဆင်သင့်", sitemapXml: "Sitemap.xml", robotsTxt: "Robots.txt", analyticsTableMissing: "Analytics table မရှိသေးပါ။", applyAnalyticsMigration: "Pageview စုဆောင်းရန် Supabase တွင် analytics migration ကို run ပါ။",     days: "ရက်", lightMode: "အလင်းမုဒ်", darkMode: "အမှောင်မုဒ်", footerDescription: "ဒစ်ဂျစ်တယ် subscription၊ design tools၊ virtual cards နှင့် streaming accounts များကို ဒေသတွင်းငွေပေးချေပြီး ချက်ချင်းရယူနိုင်သော marketplace ဖြစ်ပါသည်။", paymentMethods: "KBZPay · WavePay · Bank", price: "Price", insufficientBalance: "Insufficient balance", trackPurchases: "Track verification status and copy your delivered credentials.", credentials: "Your credentials", credentialsPreparing: "Credentials are being prepared — refresh in a moment.", viewDetails: "View details", hideDetails: "Hide details", copied: "Copied", copy: "Copy", qty: "Qty", awaitingVerification: "Awaiting manual payment verification — usually within 3 hours.", checkoutWithUnits: "Checkout with units", temporaryPurchaseMode: "Temporary purchase mode is active. Buy attempts do not deduct units or create orders.", purchaseTemporarilyUnavailable: "Purchase temporarily unavailable", checkingAvailability: "Checking availability…", stockUnavailable: "Stock unavailable — no units were deducted.", unitPrice: "Unit price", unitsUsed: "Units used",

  },
  th: {
    units: "หน่วย", dashboard: "แดชบอร์ด", availableUnits: "หน่วยที่มี", fixedUnitRate: "อัตราหน่วยคงที่", unitsToBuy: "หน่วยที่ต้องการซื้อ", exactAmountToTransfer: "ยอดโอนที่แน่นอน", enterUsdUnits: "กรอกจำนวนหน่วย USD ด้านบน", localPayment: "การชำระเงินท้องถิ่น", transferExactly: "โอนให้ตรงจำนวน", submitPaymentProof: "ส่งหลักฐานการชำระเงิน", transactionIdNote: "รหัสธุรกรรม / หมายเหตุ (จำเป็น)", paymentScreenshot: "ภาพหน้าจอการชำระเงิน (จำเป็น)", chooseImage: "เลือกรูปภาพ (PNG, JPG หรือ WEBP · สูงสุด 5MB)", pendingVerification: "รายการจะรอตรวจสอบจนกว่าแอดมินจะยืนยันการโอนและเติมหน่วยให้", topupHistory: "ประวัติการเติมหน่วย", noTopups: "ยังไม่มีการเติมหน่วย ส่งหลักฐานการชำระเงินครั้งแรกของคุณ", enterUnitAmount: "กรอกจำนวนหน่วยระหว่าง 0.01 ถึง 10,000", uploadScreenshot: "กรุณาอัปโหลดภาพหน้าจอการชำระเงิน", imageFileOnly: "กรุณาอัปโหลดไฟล์รูปภาพ", screenshotMax: "ภาพหน้าจอต้องมีขนาดต่ำกว่า 5MB", unitTopupSubmitted: "ส่งรายการเติมหน่วยเพื่อตรวจสอบแล้ว", balance: "ยอดคงเหลือ", unitsRequired: "หน่วยที่ต้องใช้", inStock: "มีสินค้า", previewCount: "จำนวนตัวอย่าง", signInToPurchase: "เข้าสู่ระบบเพื่อซื้อ", publicBrowseNotice: "ดูรายละเอียดสินค้าได้โดยไม่ต้องเข้าสู่ระบบ แต่ต้องเข้าสู่ระบบก่อนซื้อ", tryPurchase: "ลองซื้อ", walletManagement: "จัดการวอลเล็ต", unitTopups: "การเติมหน่วย", noPaymentProof: "ยังไม่มีหลักฐานการชำระเงิน", optionalRejectionReason: "เหตุผลที่ปฏิเสธ (ไม่บังคับ)", reject: "ปฏิเสธ", approveAndCredit: "อนุมัติและเติมหน่วย", approved: "อนุมัติแล้ว", rejected: "ปฏิเสธแล้ว", pending: "รอตรวจสอบ", dashboardSummary: "ตรวจสอบการชำระเงิน จัดการสต็อก และดูแลการส่งมอบ", totalRevenue: "รายได้รวม", pendingOrders: "คำสั่งซื้อที่รอดำเนินการ", totalProducts: "สินค้าทั้งหมด", totalCustomers: "ลูกค้าทั้งหมด", recentOrders: "คำสั่งซื้อล่าสุด", reviewOrders: "ตรวจสอบคำสั่งซื้อ", noOrders: "ยังไม่มีคำสั่งซื้อ", adminOnly: "สำหรับผู้ดูแลเท่านั้น", adminOnlyDescription: "ส่วนนี้จำกัดสำหรับบัญชีทีมงาน Cloud Nine", orderNotFound: "ไม่พบคำสั่งซื้อ", orderReceived: "ได้รับคำสั่งซื้อแล้ว", orderId: "รหัสคำสั่งซื้อ", product: "สินค้า", total: "ยอดรวม", paidWith: "ชำระด้วย", viewMyPurchases: "ดูการซื้อของฉัน", keepShopping: "ช้อปต่อ", reason: "เหตุผล", growthDiscoverability: "การเติบโตและการค้นพบ", seoAnalytics: "SEO และการวิเคราะห์ผู้เข้าชม", analyticsDescription: "สรุป pageview แบบคำนึงถึงความเป็นส่วนตัว ไม่ติดตามหน้าบัญชี ชำระเงิน วอลเล็ต หรือแอดมิน", pageviews: "จำนวนการดูหน้า", uniqueVisitors: "ผู้เข้าชมไม่ซ้ำ", publicPagesTracked: "หน้าสาธารณะที่ติดตาม", searchConsole: "Search Console", notConnected: "ยังไม่เชื่อมต่อ", visitorTrend: "แนวโน้มผู้เข้าชม", pageviewsPerDay: "การดูหน้าต่อวัน", deviceMix: "ประเภทอุปกรณ์", noPageviews: "ยังไม่มี pageview", topPublicPages: "หน้าสาธารณะที่ได้รับความนิยม", trafficReferrers: "แหล่งอ้างอิงการเข้าชม", noData: "ยังไม่มีข้อมูล", seoHealth: "สุขภาพ SEO", publicCrawlAssets: "เผยแพร่ไฟล์สำหรับการค้นหาแล้ว", sitemapReady: "Sitemap พร้อมใช้งาน", sitemapXml: "Sitemap.xml", robotsTxt: "Robots.txt", analyticsTableMissing: "ยังไม่มีตาราง Analytics", applyAnalyticsMigration: "ใช้ migration Analytics ใน Supabase เพื่อเริ่มเก็บ pageview",     days: "วัน", lightMode: "โหมดสว่าง", darkMode: "โหมดมืด", footerDescription: "มาร์เก็ตเพลสรวมสินค้าดิจิทัลแบบคัดสรร ชำระเงินท้องถิ่นและจัดส่งอย่างรวดเร็ว", paymentMethods: "KBZPay · WavePay · Bank", price: "ราคา", insufficientBalance: "ยอดไม่เพียงพอ", trackPurchases: "ติดตามสถานะการตรวจสอบและคัดลอกข้อมูลที่จัดส่งแล้ว", credentials: "ข้อมูลของคุณ", credentialsPreparing: "กำลังเตรียมข้อมูล กรุณารีเฟรชอีกสักครู่", viewDetails: "ดูรายละเอียด", hideDetails: "ซ่อนรายละเอียด", copied: "คัดลอกแล้ว", copy: "คัดลอก", qty: "จำนวน", awaitingVerification: "รอการตรวจสอบการชำระเงินด้วยตนเอง โดยปกติภายใน 3 ชั่วโมง", switchToLight: "เปลี่ยนเป็นโหมดสว่าง", switchToDark: "เปลี่ยนเป็นโหมดมืด", toggleMenu: "เปิด/ปิดเมนู", home: "หน้าแรก", lovedByCustomers: "ได้รับความไว้วางใจจากลูกค้ากว่า 12,000 ราย", adminDashboard: "แดชบอร์ดผู้ดูแลระบบ",
  },
  zh: {
    units: "单位", dashboard: "仪表盘", availableUnits: "可用单位", fixedUnitRate: "固定单位汇率", unitsToBuy: "购买单位", exactAmountToTransfer: "准确转账金额", enterUsdUnits: "请在上方输入美元单位", localPayment: "本地支付", transferExactly: "请准确转账", submitPaymentProof: "提交付款凭证", transactionIdNote: "交易编号 / 备注（必填）", paymentScreenshot: "付款截图（必填）", chooseImage: "选择图片（PNG、JPG 或 WEBP · 最大 5MB）", pendingVerification: "管理员验证转账并充值单位前，申请将保持待审核状态", topupHistory: "充值记录", noTopups: "暂无单位充值，请提交第一份付款凭证", enterUnitAmount: "请输入 0.01 至 10,000 之间的单位", uploadScreenshot: "请上传付款截图", imageFileOnly: "请上传图片文件", screenshotMax: "截图必须小于 5MB", unitTopupSubmitted: "单位充值已提交审核", balance: "余额", unitsRequired: "所需单位", inStock: "有库存", previewCount: "预览数量", signInToPurchase: "登录后购买", publicBrowseNotice: "产品详情可公开浏览，购买前需要登录", tryPurchase: "尝试购买", walletManagement: "钱包管理", unitTopups: "单位充值", noPaymentProof: "尚未上传付款凭证", optionalRejectionReason: "拒绝原因（可选）", reject: "拒绝", approveAndCredit: "批准并充值单位", approved: "已批准", rejected: "已拒绝", pending: "待审核", dashboardSummary: "验证付款、管理库存并保持交付顺畅", totalRevenue: "总收入", pendingOrders: "待处理订单", totalProducts: "产品总数", totalCustomers: "客户总数", recentOrders: "最近订单", reviewOrders: "审核订单", noOrders: "暂无订单", adminOnly: "仅限管理员", adminOnlyDescription: "此区域仅限 Cloud Nine 工作人员账户访问", orderNotFound: "未找到订单", orderReceived: "已收到订单", orderId: "订单编号", product: "产品", total: "总计", paidWith: "支付方式", viewMyPurchases: "查看我的订单", keepShopping: "继续购物", reason: "原因", growthDiscoverability: "增长与可发现性", seoAnalytics: "SEO 与访客分析", analyticsDescription: "隐私安全的页面浏览摘要，不跟踪账户、结账、钱包或管理员页面", pageviews: "页面浏览量", uniqueVisitors: "独立访客", publicPagesTracked: "已跟踪的公开页面", searchConsole: "Search Console", notConnected: "未连接", visitorTrend: "访客趋势", pageviewsPerDay: "每日页面浏览", deviceMix: "设备类型", noPageviews: "暂未收集页面浏览", topPublicPages: "热门公开页面", trafficReferrers: "流量来源", noData: "暂无数据", seoHealth: "SEO 状态", publicCrawlAssets: "公开抓取资源已部署", sitemapReady: "Sitemap 已就绪", sitemapXml: "Sitemap.xml", robotsTxt: "Robots.txt", analyticsTableMissing: "Analytics 数据表尚未建立", applyAnalyticsMigration: "在 Supabase 中运行 Analytics migration 以开始收集页面浏览",     days: "天", lightMode: "浅色模式", darkMode: "深色模式", footerDescription: "精选数字产品商城，支持本地支付并快速交付", paymentMethods: "KBZPay · WavePay · Bank", price: "价格", insufficientBalance: "余额不足", trackPurchases: "查看审核状态并复制已交付的凭证", credentials: "您的凭证", credentialsPreparing: "凭证正在准备中，请稍后刷新", viewDetails: "查看详情", hideDetails: "隐藏详情", copied: "已复制", copy: "复制", qty: "数量", awaitingVerification: "等待人工验证付款，通常在 3 小时内完成", switchToLight: "切换到浅色模式", switchToDark: "切换到深色模式", toggleMenu: "切换菜单", home: "首页", lovedByCustomers: "深受 12,000+ 位客户喜爱", adminDashboard: "管理员仪表盘",
  },
  ja: {
    units: "ユニット", dashboard: "ダッシュボード", availableUnits: "利用可能なユニット", fixedUnitRate: "固定ユニットレート", unitsToBuy: "購入するユニット", exactAmountToTransfer: "正確な振込金額", enterUsdUnits: "上にUSDユニット数を入力してください", localPayment: "現地決済", transferExactly: "正確に振り込む金額", submitPaymentProof: "支払い証明を送信", transactionIdNote: "取引ID / メモ（必須）", paymentScreenshot: "支払いスクリーンショット（必須）", chooseImage: "画像を選択（PNG、JPG、WEBP · 最大5MB）", pendingVerification: "管理者が振込を確認してユニットを追加するまで保留になります", topupHistory: "チャージ履歴", noTopups: "ユニットチャージはまだありません。最初の支払い証明を送信してください", enterUnitAmount: "0.01〜10,000のユニット数を入力してください", uploadScreenshot: "支払いスクリーンショットをアップロードしてください", imageFileOnly: "画像ファイルをアップロードしてください", screenshotMax: "スクリーンショットは5MB未満にしてください", unitTopupSubmitted: "ユニットチャージを確認のため送信しました", balance: "残高", unitsRequired: "必要ユニット", inStock: "在庫あり", previewCount: "プレビュー数", signInToPurchase: "ログインして購入", publicBrowseNotice: "商品詳細は公開されています。購入にはログインが必要です", tryPurchase: "購入を試す", walletManagement: "ウォレット管理", unitTopups: "ユニットチャージ", noPaymentProof: "支払い証明はありません", optionalRejectionReason: "却下理由（任意）", reject: "却下", approveAndCredit: "承認してユニットを追加", approved: "承認済み", rejected: "却下済み", pending: "保留中", dashboardSummary: "支払いを確認し、在庫と配信を管理します", totalRevenue: "総売上", pendingOrders: "保留中の注文", totalProducts: "商品数", totalCustomers: "顧客数", recentOrders: "最近の注文", reviewOrders: "注文を確認", noOrders: "注文はまだありません", adminOnly: "管理者のみ", adminOnlyDescription: "このエリアはCloud Nineスタッフ専用です", orderNotFound: "注文が見つかりません", orderReceived: "注文を受け付けました", orderId: "注文ID", product: "商品", total: "合計", paidWith: "支払い方法", viewMyPurchases: "購入履歴を見る", keepShopping: "買い物を続ける", reason: "理由", growthDiscoverability: "成長と発見性", seoAnalytics: "SEOと訪問者分析", analyticsDescription: "アカウント、決済、ウォレット、管理者ページを追跡しないプライバシー重視のページビュー概要", pageviews: "ページビュー", uniqueVisitors: "ユニーク訪問者", publicPagesTracked: "追跡中の公開ページ", searchConsole: "Search Console", notConnected: "未接続", visitorTrend: "訪問者の推移", pageviewsPerDay: "1日あたりのページビュー", deviceMix: "デバイス構成", noPageviews: "ページビューはまだありません", topPublicPages: "人気の公開ページ", trafficReferrers: "流入元", noData: "データはまだありません", seoHealth: "SEO 状態", publicCrawlAssets: "公開クロール用ファイルを公開済み", sitemapReady: "Sitemap 準備完了", sitemapXml: "Sitemap.xml", robotsTxt: "Robots.txt", analyticsTableMissing: "Analyticsテーブルがまだありません", applyAnalyticsMigration: "ページビュー収集を開始するにはSupabaseでAnalytics migrationを実行してください",     days: "日", lightMode: "ライトモード", darkMode: "ダークモード", footerDescription: "デジタル商品を現地決済で購入でき、すぐにお届けするマーケットプレイスです", paymentMethods: "KBZPay · WavePay · Bank", price: "価格", insufficientBalance: "残高不足", trackPurchases: "確認状況を確認し、配信された認証情報をコピーできます", credentials: "認証情報", credentialsPreparing: "認証情報を準備中です。しばらくしてから更新してください", viewDetails: "詳細を見る", hideDetails: "詳細を隠す", copied: "コピーしました", copy: "コピー", qty: "数量", awaitingVerification: "手動で支払いを確認しています。通常3時間以内に完了します", switchToLight: "ライトモードに切り替え", switchToDark: "ダークモードに切り替え", toggleMenu: "メニューを切り替え", home: "ホーム", lovedByCustomers: "12,000人以上のお客様に選ばれています", adminDashboard: "管理者ダッシュボード",
  },
};

const localeOverrides: Record<Language, Partial<Record<MessageKey, string>>> = {
  en: {},
  my: {
    price: "စျေးနှုန်း", insufficientBalance: "ယူနစ်မလုံလောက်ပါ", trackPurchases: "စစ်ဆေးမှုအခြေအနေကိုကြည့်ပြီး ပေးပို့ထားသော credential များကို ကူးယူပါ။", credentials: "သင့် credential များ", credentialsPreparing: "Credential များ ပြင်ဆင်နေပါသည် — ခဏအကြာ refresh လုပ်ပါ။", viewDetails: "အသေးစိတ်ကြည့်ရန်", hideDetails: "အသေးစိတ်ဖျောက်ရန်", copied: "ကူးယူပြီး", copy: "ကူးယူရန်", qty: "အရေအတွက်", awaitingVerification: "ငွေပေးချေမှုကို လက်ဖြင့်စစ်ဆေးနေပါသည် — ပုံမှန်အားဖြင့် ၃ နာရီအတွင်း။", checkoutWithUnits: "ယူနစ်ဖြင့်ဝယ်ယူရန်", temporaryPurchaseMode: "ယာယီဝယ်ယူမှုမုဒ် ဖွင့်ထားပါသည်။ ဝယ်ယူရန်ကြိုးစားမှုများသည် ယူနစ်မဖြတ်ပါ၊ အော်ဒါမဖန်တီးပါ။", purchaseTemporarilyUnavailable: "ဝယ်ယူမှုကို ယာယီမရနိုင်သေးပါ", checkingAvailability: "ရရှိနိုင်မှုကို စစ်ဆေးနေသည်…", stockUnavailable: "Stock မရနိုင်ပါ — ယူနစ်မဖြတ်ပါ။", unitPrice: "ယူနစ်စျေးနှုန်း", unitsUsed: "သုံးသောယူနစ်",
  },
  th: {
    lovedByCustomers: "ได้รับความไว้วางใจจากลูกค้ากว่า 12,000 ราย", checkoutWithUnits: "ชำระด้วยหน่วย", temporaryPurchaseMode: "โหมดซื้อชั่วคราวเปิดอยู่ การลองซื้อจะไม่หักหน่วยหรือสร้างคำสั่งซื้อ", purchaseTemporarilyUnavailable: "ยังไม่สามารถซื้อได้ชั่วคราว", checkingAvailability: "กำลังตรวจสอบความพร้อม…", stockUnavailable: "ไม่มีสินค้า — ไม่หักหน่วย", unitPrice: "ราคาต่อหน่วย", unitsUsed: "หน่วยที่ใช้",
  },
  zh: {
    lovedByCustomers: "深受 12,000+ 位客户喜爱", checkoutWithUnits: "用单位结账", temporaryPurchaseMode: "临时购买模式已启用，尝试购买不会扣除单位或创建订单", purchaseTemporarilyUnavailable: "暂时无法购买", checkingAvailability: "正在检查可用性…", stockUnavailable: "库存不可用，不会扣除单位", unitPrice: "单位价格", unitsUsed: "使用单位",
  },
  ja: {
    lovedByCustomers: "12,000人以上のお客様に選ばれています", checkoutWithUnits: "ユニットで購入", temporaryPurchaseMode: "一時購入モードが有効です。購入を試してもユニットは減らず、注文も作成されません", purchaseTemporarilyUnavailable: "購入は一時的に利用できません", checkingAvailability: "在庫を確認中…", stockUnavailable: "在庫がありません。ユニットは減りません", unitPrice: "単価", unitsUsed: "使用ユニット",
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
      t: (key: MessageKey) => localeOverrides[language][key] ?? extraMessages[language][key] ?? messages[language][key] ?? extraMessages.en[key] ?? messages.en[key] ?? key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

export type { MessageKey };
