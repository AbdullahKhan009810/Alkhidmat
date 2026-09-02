import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Knowledge Base Entries ──────────────────────────────
  const kbEntries = [
    {
      title: "Al Khidmat Free Hospitals — Rawalpindi",
      titleUr: "الخدمت مفت ہسپتال — راولپنڈی",
      category: "hospitals",
      language: "both",
      status: "active",
      contentEn:
        "Al Khidmat Foundation operates 4 free hospitals in Rawalpindi:\n\n1. Al Khidmat Shifa Hospital — Satellite Town\n2. Al Khidmat Hospital — Murree Road\n3. Al Khidmat Medical Center — GT Road\n4. Al Khidmat Welfare Hospital — Rawalpindi\n\nFree Services: Checkup, Medicine, Surgery, Cardiac Treatment",
      contentUr:
        "الخدمت فاؤنڈیشن راولپنڈی میں 4 مفت ہسپتال چلاتی ہے:\n\n1. الخدمت شفا ہسپتال — سیٹلائٹ ٹاؤن\n2. الخدمت ہسپتال — مرری روڈ\n3. الخدمت طبی مرکز — جی ٹی روڈ\n4. الخدمت فلاحی ہسپتال — راولپنڈی\n\nمفت سروسز: چیک اپ، ادویات، سرجری، دل کا علاج",
    },
    {
      title: "Al Khidmat Free Hospitals — Lahore",
      titleUr: "الخدمت مفت ہسپتال — لاہور",
      category: "hospitals",
      language: "both",
      status: "active",
      contentEn:
        "Al Khidmat Foundation free hospitals in Lahore:\n\n1. Al Khidmat Hospital — Township\n2. Al Khidmat Medical Complex — Gulberg\n\nFree Services: OPD, Emergency, Surgery, Lab Tests",
      contentUr:
        "الخدمت فاؤنڈیشن کے لاہور میں مفت ہسپتال:\n\n1. الخدمت ہسپتال — ٹاؤن شپ\n2. الخدمت طبی کمپلیکس — گلبرگ\n\nمفت سروسز: او پی ڈی، ایمرجنسی، سرجری، لیب ٹیسٹ",
    },
    {
      title: "Al Khidmat Free Hospitals — Karachi",
      titleUr: "الخدمت مفت ہسپتال — کراچی",
      category: "hospitals",
      language: "both",
      status: "active",
      contentEn:
        "Al Khidmat Foundation free hospitals in Karachi:\n\n1. Al Khidmat Shifa Hospital — North Nazimabad\n2. Al Khidmat Medical Center — Korangi\n\nFree Services: General Medicine, Surgery, Maternity Care",
      contentUr:
        "الخدمت فاؤنڈیشن کے کراچی میں مفت ہسپتال:\n\n1. الخدمت شفا ہسپتال — نارتھ ناظم آباد\n2. الخدمت طبی مرکز — کورنگی\n\nمفت سروسز: جنرل میڈیسن، سرجری، زچگی کی دیکھ بھال",
    },
    {
      title: "Orphan Sponsorship Program",
      titleUr: "یتیم اسپانسرشپ پروگرام",
      category: "programs",
      language: "both",
      status: "active",
      contentEn:
        "Al Khidmat Yateem Program provides complete care for orphan children:\n\n• Education support (school fees, books, uniform)\n• Monthly stipend\n• Healthcare coverage\n• Moral & spiritual training\n\nHow to apply: Visit nearest Al Khidmat center with CNIC + child's B-Form",
      contentUr:
        "الخدمت یتیم پروگرام یتیم بچوں کی مکمل دیکھ بھال فراہم کرتا ہے:\n\n• تعلیمی مدد (فیس، کتابیں، یونیفارم)\n• ماہانہ وظیفہ\n• صحت کی سہولت\n• اخلاقی و روحانی تربیت\n\nاپلائی کرنے کا طریقہ: قریبی الخدمت سینٹر میں CNIC + بچے کا B-Form لے کر جائیں",
    },
    {
      title: "Education Support Program",
      titleUr: "تعلیمی مدد پروگرام",
      category: "programs",
      language: "both",
      status: "active",
      contentEn:
        "Al Khidmat Education Support helps underprivileged students:\n\n• Scholarship for merit students\n• Free coaching centers\n• School supplies distribution\n• Computer literacy programs",
      contentUr:
        "الخدمت تعلیمی مدد محروم طلباء کی مدد کرتی ہے:\n\n• میرٹ طلباء کے لیے اسکالرشپ\n• مفت کوچنگ سینٹرز\n• اسکولی سامان کی تقسیم\n• کمپیوٹر لٹریسی پروگرام",
    },
    {
      title: "Zakat & Donation Methods",
      titleUr: "زکوٰۃ اور عطیہ کے طریقے",
      category: "donations",
      language: "both",
      status: "active",
      contentEn:
        "Donate to Al Khidmat Foundation:\n\nBank: United Bank Limited\nAccount: Al Khidmat Foundation\nAccount No: 0123-4567-8901\n\nOnline: alkhidmat.org/donate\n\nZakat is distributed to: Food, Education, Healthcare, Orphan Care, Flood Relief",
      contentUr:
        "الخدمت فاؤنڈیشن میں عطیہ کریں:\n\nبینک: یونائیٹڈ بینک لمیٹڈ\nاکاؤنٹ: الخدمت فاؤنڈیشن\nاکاؤنٹ نمبر: 0123-4567-8901\n\nآن لائن: alkhidmat.org/donate\n\nزکوٰۃ کی تقسیم: کھانا، تعلیم، صحت، یتیم دیکھ بھال، سیلاب ریلیف",
    },
    {
      title: "Free Medical Camp Schedule — September 2024",
      titleUr: "مفت میڈیکل کیمپ شیڈول — ستمبر 2024",
      category: "medical-camps",
      language: "both",
      status: "active",
      contentEn:
        "Upcoming Free Medical Camps:\n\n📅 5 Sep 2024 — Al Khidmat Complex, Rawalpindi (8AM-4PM)\n📅 12 Sep 2024 — Community Hall, Lahore Township (9AM-3PM)\n📅 20 Sep 2024 — Al Khidmat Center, Karachi North Nazimabad (8AM-4PM)\n\nServices: Free checkup, blood test, eye test, medicine distribution\nRegistration: Bring CNIC",
      contentUr:
        "آنے والے مفت میڈیکل کیمپ:\n\n📅 5 ستمبر 2024 — الخدمت کمپلیکس، راولپنڈی (8AM-4PM)\n📅 12 ستمبر 2024 — کمیونٹی ہال، لاہور ٹاؤن شپ (9AM-3PM)\n📅 20 ستمبر 2024 — الخدمت سینٹر، کراچی نارتھ ناظم آباد (8AM-4PM)\n\nسروسز: مفت چیک اپ، بلڈ ٹیسٹ، آنکھ کا ٹیسٹ، ادویات کی تقسیم\nرجسٹریشن: CNIC لے کر آئیں",
    },
    {
      title: "Flood Relief Program",
      titleUr: "سیلاب ریلیف پروگرام",
      category: "programs",
      language: "both",
      status: "active",
      contentEn:
        "Al Khidmat Flood Relief provides:\n\n• Emergency shelter & tents\n• Clean drinking water\n• Food packages\n• Medical aid\n• Reconstruction support\n\nAffected families can register at any Al Khidmat center.",
      contentUr:
        "الخدمت سیلاب ریلیف فراہم کرتا ہے:\n\n• ایمرجنسی پناہ گاہ اور خیمے\n• صاف پینے کا پانی\n• کھانے کے پیکج\n• طبی امداد\n• تعمیر نو کی مدد\n\nمتاثرہ خاندان کسی بھی الخدمت سینٹر میں رجسٹر کر سکتے ہیں۔",
    },
    {
      title: "How to Register for Free Treatment",
      titleUr: "مفت علاج کے لیے رجسٹریشن کیسے کریں",
      category: "faqs",
      language: "both",
      status: "active",
      contentEn:
        "Steps to register for free treatment:\n\n1. Visit nearest Al Khidmat hospital/center\n2. Bring your CNIC (original + copy)\n3. Fill the registration form\n4. Get your patient card\n5. Start receiving free treatment\n\nNote: All services are 100% free. No payment required.",
      contentUr:
        "مفت علاج کے لیے رجسٹریشن کے مراحل:\n\n1. قریبی الخدمت ہسپتال/سینٹر جائیں\n2. اپنا CNIC لائیں (اصل + کاپی)\n3. رجسٹریشن فارم پُر کریں\n4. اپنا مریض کارڈ حاصل کریں\n5. مفت علاج شروع کریں\n\nنوٹ: تمام سروسز 100% مفت ہیں۔ کوئی ادائیگی نہیں۔",
    },
    {
      title: "Contact Information",
      titleUr: "رابطہ کی معلومات",
      category: "faqs",
      language: "both",
      status: "active",
      contentEn:
        "Al Khidmat Foundation Contact:\n\nHead Office: Islamabad\nHelpline: 111-254-342\nEmail: info@alkhidmat.org\nWebsite: alkhidmat.org\n\nOffice Hours: Mon-Sat, 9AM-5PM",
      contentUr:
        "الخدمت فاؤنڈیشن رابطہ:\n\nمرکزی دفتر: اسلام آباد\nہیلپ لائن: 111-254-342\nای میل: info@alkhidmat.org\nویب سائٹ: alkhidmat.org\n\nاوقات: پیر سے ہفتہ، صبح 9 سے شام 5",
    },
  ];

  for (const entry of kbEntries) {
    await prisma.knowledgeBaseEntry.create({ data: entry });
  }
  console.log(`✅ Created ${kbEntries.length} knowledge base entries`);

  // ── Conversations ───────────────────────────────────────
  const conversations = [
    {
      sessionId: "TR-8924-A",
      language: "ur",
      status: "active",
      messages: [
        { role: "user", content: "السلام علیکم! راولپنڈی میں الخدمت کا ہسپتال کہاں ہے؟" },
        { role: "bot", content: "وعلیکم السلام! الخدمت فاؤنڈیشن کے راولپنڈی میں 4 مفت ہسپتال ہیں:\n\n1. الخدمت شفا ہسپتال — سیٹلائٹ ٹاؤن\n2. الخدمت ہسپتال — مرری روڈ\n3. الخدمت طبی مرکز — جی ٹی روڈ\n4. الخدمت فلاحی ہسپتال — راولپنڈی" },
        { role: "user", content: "وہاں کون سی مفت سروسز ملتی ہیں؟" },
        { role: "bot", content: "مفت سروسز:\n• مفت چیک اپ\n• مفت ادویات\n• مفت سرجری\n• مفت دل کا علاج\n• مفت لیبارٹری ٹیسٹ" },
        { role: "user", content: "بہت شکریہ!" },
        { role: "bot", content: "آپ کا شکریہ! اگر کوئی اور مدد چاہیے تو میں حاضر ہوں۔ اللہ حافظ!" },
      ],
    },
    {
      sessionId: "TR-8843-B",
      language: "en",
      status: "active",
      messages: [
        { role: "user", content: "Where are the free hospitals in Rawalpindi?" },
        { role: "bot", content: "Al Khidmat Foundation operates 4 free hospitals in Rawalpindi:\n\n1. Al Khidmat Shifa Hospital — Satellite Town\n2. Al Khidmat Hospital — Murree Road\n3. Al Khidmat Medical Center — GT Road\n4. Al Khidmat Welfare Hospital — Rawalpindi" },
        { role: "user", content: "What free services do they offer?" },
        { role: "bot", content: "Free services include:\n• Free checkup\n• Free medicine\n• Free surgery\n• Free cardiac treatment\n• Free lab tests" },
        { role: "user", content: "Thank you!" },
        { role: "bot", content: "You're welcome! If you need any more help, I'm here. Allah Hafiz!" },
      ],
    },
    {
      sessionId: "TR-8721-C",
      language: "ur",
      status: "active",
      messages: [
        { role: "user", content: "یتیم بچوں کی اسپانسرشپ کے لیے اپلائی کیسے کریں؟" },
        { role: "bot", content: "الخدمت یتیم پروگرام میں اپلائی کرنے کے لیے:\n\n1. قریبی الخدمت سینٹر جائیں\n2. اپنا CNIC اور بچے کا B-Form لے کر جائیں\n3. رجسٹریشن فارم پُر کریں\n\nاسکے بعد بچے کو:\n• تعلیمی مدد (فیس، کتابیں، یونیفارم)\n• ماہانہ وظیفہ\n• صحت کی سہولت\n• اخلاقی و روحانی تربیت\nملے گی۔" },
        { role: "user", content: "شکریہ، بہت اچھا پروگرام ہے۔" },
        { role: "bot", content: "جی بالکل! الخدمت فاؤنڈیشن یتیم بچوں کی مکمل دیکھ بھال کرتی ہے۔ اگر کوئی اور سوال ہو تو پوچھیں۔ اللہ حافظ!" },
      ],
    },
    {
      sessionId: "TR-8655-D",
      language: "en",
      status: "active",
      messages: [
        { role: "user", content: "I want to donate Zakat for flood relief. How can I do that?" },
        { role: "bot", content: "You can donate Zakat to Al Khidmat Foundation for flood relief:\n\nBank: United Bank Limited\nAccount: Al Khidmat Foundation\nAccount No: 0123-4567-8901\n\nOnline: alkhidmat.org/donate\n\nYour Zakat will be distributed to: Food, Education, Healthcare, Orphan Care, and Flood Relief programs." },
        { role: "user", content: "Can I also donate online?" },
        { role: "bot", content: "Yes! You can donate online at alkhidmat.org/donate. They accept Zakat, Sadaqah, and general donations through bank transfer, credit/debit card, and mobile wallets." },
        { role: "user", content: "JazakAllah!" },
        { role: "bot", content: "Wa iyyakum! May Allah reward your generosity. If you need anything else, I'm here. Allah Hafiz!" },
      ],
    },
  ];

  for (const conv of conversations) {
    await prisma.conversation.create({
      data: {
        sessionId: conv.sessionId,
        language: conv.language,
        status: conv.status,
        messages: {
          create: conv.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      },
    });
  }
  console.log(`✅ Created ${conversations.length} conversations`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
