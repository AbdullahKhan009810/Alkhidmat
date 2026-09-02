import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up old knowledge base data...");

  const deleteResult = await prisma.knowledgeBaseEntry.deleteMany({});
  console.log(`🗑️  Deleted ${deleteResult.count} old entries`);

  console.log("\n Adding data for 3 use cases (2 English + 2 Urdu each)...\n");

  // ============================================
  // USE CASE 1: Facility & Medical Camp Finder
  // ============================================

  // Entry 1: English
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Al Khidmat Shifa Hospital - Satellite Town",
      titleUr: "الخدمت شفا ہسپتال - سیٹلائٹ ٹاؤن",
      category: "facility-finder",
      language: "both",
      status: "active",
      contentEn: "Al Khidmat Shifa Hospital - Satellite Town, Rawalpindi\n\n📍 Address: Main Road, Satellite Town, Rawalpindi\n📞 Phone: 051-4853951\n⏰ Timings: 24/7\n\n🏥 Departments:\n• Cardiology (Heart)\n• Pediatrics (Children)\n• General Surgery\n• Gynecology & Obstetrics\n• Orthopedics (Bones)\n• Dermatology (Skin)\n• ENT (Ear, Nose, Throat)\n• Dental\n\n🆓 Free Services:\n• Emergency Care (24/7)\n• OPD for underprivileged (9 AM - 1 PM, 5 PM - 9 PM)\n• Free medicines for eligible patients\n• Free diagnostic tests (X-Ray, Lab)\n• Free surgery for eligible patients\n\n🚑 Ambulance: Available 24/7\n️ Parking: Available\n♿ Wheelchair Access: Yes",
      contentUr: "الخدمت شفا ہسپتال - سیٹلائٹ ٹاؤن، راولپنڈی\n\n📍 پتہ: مین روڈ، سیٹلائٹ ٹاؤن، راولپنڈی\n📞 فون: ۰۵۱-۴۸۵۳۹۵۱\n⏰ اوقات: ۲۴/۷\n\n🏥 شعبہ جات:\n• کارڈیولوجی (دل)\n• پیڈیاٹرکس (بچوں)\n• جنرل سرجری\n• گائنی کولوجی اور اوسٹیٹرکس\n• آرٹھوپیڈکس (ہڈیوں)\n• ڈرمیٹولوجی (جلد)\n• ای این ٹی (کان، ناک، گلا)\n• ڈینٹل\n\n🆓 مفت سروسز:\n• ایمرجنسی کیئر (۲۴/۷)\n• غریب مریضوں کے لیے او پی ڈی (صبح ۹ - ۱، شام ۵ - ۹)\n• اہل مریضوں کے لیے مفت ادویات\n• مفت تشخیصی ٹیسٹ (ایکس رے، لیب)\n• اہل مریضوں کے لیے مفت سرجری\n\n🚑 ایمبولینس: ۲۴/۷ دستیاب\n🅿️ پارکنگ: دستیاب\n♿ وہیل چیئر رسائی: ہاں",
    },
  });
  console.log("✅ [EN] Al Khidmat Shifa Hospital - Satellite Town");

  // Entry 2: English
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Al Khidmat Hospital - Murree Road",
      titleUr: "الخدمت ہسپتال - مرری روڈ",
      category: "facility-finder",
      language: "both",
      status: "active",
      contentEn: "Al Khidmat Hospital - Murree Road, Rawalpindi\n\n📍 Address: Murree Road, Near Committee Chowk, Rawalpindi\n📞 Phone: 051-4853952\n⏰ Timings: 24/7\n\n🏥 Departments:\n• General Medicine\n• Internal Medicine\n• Cardiology\n• Nephrology (Kidney)\n• Urology\n• General Surgery\n• Pediatrics\n• Gynecology\n\n🆓 Free Services:\n• Free OPD (Monday - Saturday)\n• Free dialysis for eligible patients\n• Free medicines\n• Free lab tests\n• Free surgery for eligible patients\n• Free medical camps every weekend\n\n✨ Special Features:\n• Dialysis Center (20 machines)\n• Cardiac Care Unit\n• ICU & NICU\n• Pharmacy with subsidized rates\n\n🚑 Ambulance: Available\n🅿️ Parking: Available",
      contentUr: "الخدمت ہسپتال - مرری روڈ، راولپنڈی\n\n📍 پتہ: مرری روڈ، کمیٹی چوک کے قریب، راولپنڈی\n📞 فون: ۰۵۱-۴۸۵۳۹۵۲\n⏰ اوقات: ۲۴/۷\n\n🏥 شعبہ جات:\n• جنرل میڈیسن\n• انٹرنل میڈیسن\n• کارڈیولوجی\n• نیفرولوجی (گردے)\n• یورولوجی\n• جنرل سرجری\n• پیڈیاٹرکس\n• گائنی کولوجی\n\n🆓 مفت سروسز:\n• مفت او پی ڈی (پیر - ہفتہ)\n• اہل مریضوں کے لیے مفت ڈائیلاسز\n• مفت ادویات\n• مفت لیب ٹیسٹ\n• اہل مریضوں کے لیے مفت سرجری\n• ہر ہفتے مفت میڈیکل کیمپس\n\n✨ خصوصی سہولیات:\n• ڈائیلاسز سینٹر (۲۰ مشینیں)\n• کارڈیک کیئر یونٹ\n• آئی سی یو اور این آئی سی یو\n• سبسڈی یافتہ نرخوں پر فارمیسی\n\n🚑 ایمبولینس: دستیاب\n🅿️ پارکنگ: دستیاب",
    },
  });
  console.log("✅ [EN] Al Khidmat Hospital - Murree Road");

  // Entry 3: Urdu
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "",
      titleUr: "الخدمت طبی مرکز - جی ٹی روڈ",
      category: "facility-finder",
      language: "ur",
      status: "active",
      contentEn: "",
      contentUr: "الخدمت طبی مرکز - جی ٹی روڈ، راولپنڈی\n\n📍 پتہ: جی ٹی روڈ، بس اڈے کے قریب، راولپنڈی\n📞 فون: ۰۱-۴۸۵۳۹۵۳\n⏰ اوقات: صبح ۸ - رات ۱۰\n\n🏥 سروسز:\n• بنیادی صحت کی دیکھ بھال\n• ماں اور بچے کی صحت\n• خاندانی منصوبہ بندی\n• ویکسینیشن پروگرام\n• غذائی مشاورت\n• صحت کی تعلیم\n• بنیادی لیبارٹری ٹیسٹ\n• فارمیسی\n\n🆓 مفت سروسز:\n• مفت مشاورت\n• بچوں کے لیے مفت ویکسینیشن\n• مفت پرنیٹل کیئر\n• حاملہ خواتین کے لیے مفت غذائی سپلیمنٹس\n• مفت بنیادی لیب ٹیسٹ\n• اہل مریضوں کے لیے مفت ادویات\n\n🎯 خصوصی پروگرام:\n• لیڈی ہیلتھ ورکر پروگرام\n• امیونائزیشن مہمات\n• ماں کی صحت پروگرام\n• بچے کی غذائیت پروگرام\n\n ایمرجنسی: مرکزی ہسپتالوں میں بھیجا جاتا ہے\n️ پارکنگ: محدود",
    },
  });
  console.log("✅ [UR] الخدمت طبی مرکز - جی ٹی روڈ");

  // Entry 4: Urdu
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "",
      titleUr: "ہفتہ وار مفت میڈیکل کیمپس کا شیڈول",
      category: "facility-finder",
      language: "ur",
      status: "active",
      contentEn: "",
      contentUr: "الخدمت فاؤنڈیشن - ہفتہ وار مفت میڈیکل کیمپس\n\n📅 شیڈول:\n\nہفتہ:\n مقام: سیٹلائٹ ٹاؤن کمیونٹی سینٹر\n⏰ وقت: صبح ۱۰ - شام ۴\n🏥 سروسز: جنرل چیک اپ، BP، ذیابیطس اسکریننگ، مفت ادویات\n\nاتوار:\n📍 مقام: مرری روڈ، کمیٹی چوک کے قریب\n⏰ وقت: صبح ۹ - دوپہر ۳\n🏥 سروسز: آنکھوں کا چیک اپ، ڈینٹل، جنرل میڈیسن، مفت ادویات\n\nپیر:\n📍 مقام: جی ٹی روڈ، بس اڈے کے قریب\n⏰ وقت: صبح ۱۰ - شام ۴\n سروسز: خواتین کی صحت، بچوں کی ویکسینیشن، غذائی مشاورت\n\nمنگل:\n مقام: اڈیالہ روڈ\n وقت: صبح ۱۰ - دوپہر ۳\n🏥 سروسز: جنرل چیک اپ، لیب ٹیسٹ، مفت ادویات\n\nبدھ:\n📍 مقام: ویسٹریج\n⏰ وقت: صبح ۱ - شام ۴\n🏥 سروسز: کارڈیک اسکریننگ، BP، ذیابیطس، مفت مشاورت\n\nجمعرات:\n📍 مقام: بحریہ ٹاؤن فیز ۴\n وقت: صبح ۱۰ - دوپہر ۳\n🏥 سروسز: جنرل میڈیسن، پیڈیاٹرک کیئر، مفت ادویات\n\nجمعہ:\n📍 مقام: چاکلہ\n⏰ وقت: صبح ۱۰ - شام ۴\n🏥 سروسز: جنرل چیک اپ، ڈینٹل، آنکھوں کی دیکھ بھال، مفت ادویات\n\n ساتھ لائیں:\n• CNIC\n• پچھلے طبی ریکارڈز (اگر کوئی ہوں)\n• موجودہ ادویات کی فہرست\n\n✅ تمام سروسز مفت ہیں",
    },
  });
  console.log("✅ [UR] ہفتہ وار مفت میڈیکل کیمپس کا شیڈول");

  // ============================================
  // USE CASE 2: Free-Service Eligibility Check
  // ============================================

  // Entry 1: English
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Eligibility Criteria for Free Medical Services",
      titleUr: "",
      category: "eligibility-check",
      language: "en",
      status: "active",
      contentEn: "Eligibility Criteria for Free Medical Services at Al Khidmat Foundation\n\n💰 Income Requirements:\n• Monthly household income below PKR 30,000\n• Must provide income certificate from Union Council\n• BISP/Benazir Income Support beneficiaries are automatically eligible\n\n📋 Required Documents:\n1. Valid CNIC (Computerized National Identity Card)\n2. B-Form for children (under 18 years)\n3. Income certificate from Union Council\n4. Utility bills (electricity/gas) - last 3 months\n5. Rent agreement or proof of residence\n6. Medical reports (if applicable)\n7. BISP card (if applicable)\n\n🎯 Priority Categories:\n1. Widows and orphans\n2. Persons with disabilities\n3. Senior citizens (60+ years)\n4. Chronic disease patients (diabetes, heart disease, cancer)\n5. BISP beneficiaries\n6. Daily wage workers\n7. Unemployed persons\n\n📝 Application Process:\n1. Visit nearest Al Khidmat center\n2. Fill out the application form\n3. Submit required documents\n4. Verification takes 3-5 working days\n5. Approved patients receive free treatment card\n6. Card is valid for 1 year (renewable)\n\n✅ Benefits:\n• Free consultation\n• Free medicines\n• Free lab tests\n• Free surgery (if eligible)\n• Free hospital stay (if required)",
      contentUr: "",
    },
  });
  console.log("✅ [EN] Eligibility Criteria for Free Medical Services");

  // Entry 2: English
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "How to Apply for Free Treatment - Step by Step Guide",
      titleUr: "",
      category: "eligibility-check",
      language: "en",
      status: "active",
      contentEn: "Step-by-Step Guide to Apply for Free Treatment at Al Khidmat Foundation\n\n📍 Step 1: Visit Nearest Center\nLocations:\n• Al Khidmat Shifa Hospital - Satellite Town\n• Al Khidmat Hospital - Murree Road\n• Al Khidmat Medical Center - GT Road\n\n Timing: Monday - Saturday, 9 AM - 3 PM\n\n📝 Step 2: Fill Application Form\n• Get form from reception\n• Fill in personal details\n• Provide family information\n• Declare monthly income\n• Sign the form\n\n📋 Step 3: Submit Documents\nRequired:\n• CNIC (original + copy)\n• B-Form for children\n• Income certificate\n• Utility bills (3 months)\n• Rent agreement/residence proof\n• Medical reports (if any)\n\n🔍 Step 4: Verification Process\n• Documents verified by social worker\n• Home visit may be conducted\n• Income verification from Union Council\n• Process takes 3-5 working days\n\n✅ Step 5: Approval & Card Issuance\n• Receive SMS notification\n• Collect free treatment card\n• Card valid for 1 year\n• Renewable after expiry\n\n🏥 Step 6: Start Treatment\n• Show card at reception\n• Get token for OPD\n• Consult doctor\n• Get free medicines from pharmacy\n• Free lab tests if required\n\n📞 Helpline: 051-4853951\n💬 WhatsApp: 0300-1234567",
      contentUr: "",
    },
  });
  console.log("✅ [EN] How to Apply for Free Treatment");

  // Entry 3: Urdu
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "",
      titleUr: "مفت سرجری پروگرام - اہلیت اور عمل",
      category: "eligibility-check",
      language: "ur",
      status: "active",
      contentEn: "",
      contentUr: "الخدمت فاؤنڈیشن - مفت سرجری پروگرام\n\n🏥 دستیاب سرجریز (مفت):\n• دل کی سرجری (بائی پاس، والو ریپلیسمنٹ)\n• گردہ پیوند\n• جگر پیوند\n• کینسر سرجری\n• آنکھوں کی سرجری (موتیا، لیزک)\n• آرتھوپیڈک سرجری (جوڑوں کی تبدیلی، فریکچر)\n• جنرل سرجری (اپینڈکس، ہرنیا، گال بلیڈر)\n• نیورو سرجری (دماغی ٹیومر، ریڑھ کی ہڈی)\n• پلاسٹک سرجری (جلنے کے مریض، کلیفٹ لپ)\n• یورولوجی سرجری (گردے کی پتھری، پروسٹیٹ)\n\n💰 اہلیت:\n• ماہانہ آمدنی ۳۰,۰۰ روپے سے کم\n• مفت علاج کارڈ ہونا ضروری ہے\n• ڈاکٹر کی تصدیق شدہ طبی ضرورت\n• کوئی اور مالی مدد دستیاب نہیں\n\n📋 مطلوبہ دستاویزات:\n۱. مفت علاج کارڈ\n۲. CNIC\n۳. آمدنی سرٹیفکیٹ\n۴. طبی رپورٹس اور تشخیص\n۵. سرجری کے لیے ڈاکٹر کی سفارش\n. ہسپتال سے تخمینہ لاگت (اگر نجی)\n\n درخواست کا عمل:\n۱. الخدمت ڈاکٹر سے ریفرل لیں\n۲. دستاویزات کے ساتھ درخواست جمع کرائیں\n۳. میڈیکل بورڈ کیس کا جائزہ لیتا ہے\n۴. ۷-۱۰ کام کے دنوں میں فیصلہ\n۵. اگر منظور، سرجری شیڈول\n۶. پری سرجری ٹیسٹ (مفت)\n۷. سرجری کی جاتی ہے\n۸. پوسٹ سرجری کیئر (مفت)\n\n⏰ انتظار کا وقت:\n• ایمرجنسی کیسز: فوری\n• نازک کیسز: ۱-۲ ہفتے\n• غیر نازک کیسز: ۱- ماہ\n\n📞 رابطہ: ۰۵۱-۴۸۵۳۹۵۱ (ایکسٹینشن ۳)",
    },
  });
  console.log("✅ [UR] مفت سرجری پروگرام");

  // Entry 4: Urdu
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "",
      titleUr: "مفت ڈائیلاسس پروگرام - تفصیلات اور رجسٹریشن",
      category: "eligibility-check",
      language: "ur",
      status: "active",
      contentEn: "",
      contentUr: "الخدمت فاؤنڈیشن - مفت ڈائیلاسس پروگرام\n\n🏥 مقام:\nالخدمت ہسپتال - مرری روڈ، راولپنڈی\nڈائیلاسس سینٹر (۲۰ مشینیں)\n\n⏰ اوقات:\n• صبح کی شفٹ: صبح ۶ - دوپہر ۱۲\n• شام کی شفٹ: دوپہر  - رات ۸\n• رات کی شفٹ: رات ۱۰ - صبح ۶ (صرف ایمرجنسی)\n• ہفتے کے ۷ دن\n\n💰 اہلیت:\n• ماہانہ آمدنی ۳۰,۰۰ روپے سے کم\n• دائمی گردے کی بیماری (CKD) کا مریض\n• مفت علاج کارڈ ہونا ضروری ہے\n• نیفرولوجسٹ کی سفارش ضروری ہے\n\n📋 مطلوبہ دستاویزات:\n۱. مفت علاج کارڈ\n۲. CNIC\n۳. آمدنی سرٹیفکیٹ\n۴. طبی رپورٹس (گردے کے فنکشن ٹیسٹ)\n۵. ڈائیلاسس کے لیے نیفرولوجسٹ کا نسخہ\n۶. پچھلے ڈائیلاسس ریکارڈز (اگر کوئی ہوں)\n\n رجسٹریشن کا عمل:\n۱. نیفرولوجی ڈیپارٹمنٹ جائیں\n۲. نیفرولوجسٹ سے مشورہ کریں\n۳. دستاویزات جمع کرائیں\n۴.  دنوں میں رجسٹریشن منظور\n۵. ڈائیلاسس شیڈول تفویض\n۶. باقاعدہ سیشنز شروع\n\n🔄 سیشن کی تفصیلات:\n• دورانیہ: فی سیشن ۴- گھنٹے\n• فریکوئنسی: ہفتے میں ۲-۳ بار\n• کل سیشنز: جاری (طبی ضرورت کے مطابق)\n• تمام ادویات مفت فراہم کی جاتی ہیں\n• اہل مریضوں کے لیے ٹرانسپورٹیشن سپورٹ دستیاب\n\n🚑 ایمرجنسی ڈائیلاسس:\n• ۲۴/۷ دستیاب\n• اپائنٹمنٹ کی ضرورت نہیں\n• CNIC اور طبی ریکارڈز لائیں\n\n📞 رابطہ: ۰۵۱-۴۸۵۳۵۲ (ایکسٹینشن ۲)",
    },
  });
  console.log("✅ [UR] مفت ڈائیلاسس پروگرام");

  // ============================================
  // USE CASE 3: Transport & Ambulance Guidance
  // ============================================

  // Entry 1: English
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Emergency Ambulance Service (1122)",
      titleUr: "",
      category: "transport-guidance",
      language: "en",
      status: "active",
      contentEn: "Al Khidmat Foundation - Emergency Ambulance Service\n\n🚨 Emergency Number: 1122\n📞 Alternative: 051-4853951\n Available: 24/7, 365 days\n\n🚑 Ambulance Features:\n• Advanced Life Support (ALS) equipped\n• Cardiac monitor & defibrillator\n• Oxygen supply\n• Emergency medicines\n• Trained paramedics\n• GPS tracking\n• Air conditioning\n• Wheelchair accessible\n\n Response Time:\n• City areas (Rawalpindi/Islamabad): 10-15 minutes\n• Suburban areas: 15-25 minutes\n• Highway/remote areas: 25-40 minutes\n\n📍 Service Areas:\n• Rawalpindi: Full coverage\n• Islamabad: Full coverage\n• Murree: Limited coverage\n• Taxila: Limited coverage\n• Wah Cantt: Limited coverage\n\n🆓 Cost: FREE for all emergency cases\n\n📋 What to Provide When Calling:\n1. Your exact location (address/landmark)\n2. Patient's condition (conscious/unconscious, breathing, bleeding)\n3. Number of patients\n4. Your contact number\n5. Nearest landmark\n\n✅ While Waiting for Ambulance:\n• Keep patient calm and still\n• If unconscious, place in recovery position\n• If bleeding, apply pressure with clean cloth\n• If cardiac arrest, start CPR if trained\n• Keep patient's CNIC ready\n• Have someone wait at main road to guide ambulance\n• Keep phone line open\n\n🏥 Destination Hospitals:\n• Al Khidmat Shifa Hospital (Satellite Town)\n• Al Khidmat Hospital (Murree Road)\n• Government hospitals (if closer)\n• Patient's choice (if stable)",
      contentUr: "",
    },
  });
  console.log("✅ [EN] Emergency Ambulance Service (1122)");

  // Entry 2: English
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Non-Emergency Patient Transport Service",
      titleUr: "",
      category: "transport-guidance",
      language: "en",
      status: "active",
      contentEn: "Al Khidmat Foundation - Non-Emergency Patient Transport\n\n📞 Booking Number: 051-4853951\n🕗 Booking Hours: 8 AM - 8 PM (7 days)\n Service Hours: 24/7 (with advance booking)\n\n🚐 Vehicle Types:\n1. Basic Ambulance\n   • For stable patients\n   • Wheelchair accessible\n   • Basic medical equipment\n   • 1 attendant allowed\n\n2. ICU Ambulance\n   • For critical patients\n   • Full life support\n   • Ventilator available\n   • Doctor/nurse accompaniment\n   • 1 family member allowed\n\n3. Neonatal Ambulance\n   • For newborns/premature babies\n   • Incubator equipped\n   • Neonatal nurse\n   • Parent can accompany\n\n4. Bariatric Ambulance\n   • For obese patients\n   • Heavy-duty stretcher\n   • Specialized equipment\n\n💰 Charges (Nominal):\n• Within Rawalpindi/Islamabad: PKR 500-1000\n• Inter-city (per km): PKR 50/km\n• ICU Ambulance: PKR 100/km\n• Free for eligible patients (with free treatment card)\n\n📋 Booking Information Required:\n1. Patient name & age\n2. Pickup location (exact address)\n3. Drop-off location (hospital/clinic)\n4. Patient condition (stable/critical)\n5. Special requirements (oxygen, ventilator, etc.)\n6. Contact number\n7. Preferred date & time\n\n⏰ Advance Booking:\n• Routine transfers: 24 hours notice\n• Hospital discharge: Same day (subject to availability)\n• Inter-city: 48 hours notice\n\n✅ Included Services:\n• Trained driver & paramedic\n• Basic medical equipment\n• Oxygen (if required)\n• Wheelchair (if required)\n• Assistance with patient transfer\n\n📱 WhatsApp Booking: 0300-1234567",
      contentUr: "",
    },
  });
  console.log("✅ [EN] Non-Emergency Patient Transport Service");

  // Entry 3: Urdu
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "",
      titleUr: "ایمبولینس سروس علاقے اور کوریج نقشہ",
      category: "transport-guidance",
      language: "ur",
      status: "active",
      contentEn: "",
      contentUr: "الخدمت ایمبولینس سروس - کوریج علاقے\n\n🟢 مکمل کوریج (ردعمل کا وقت: ۱۰-۱۵ منٹ):\n\nراولپنڈی:\n• سیٹلائٹ ٹاؤن\n• مرری روڈ\n• جی ٹی روڈ\n• صدر\n• کمیٹی چوک\n• اڈیالہ روڈ\n• ویسٹریج\n• بحریہ ٹاؤن فیز ۱-۸\n• ڈی ایچ اے فیز ۱-۲\n• چاکلہ\n• پشاور روڈ\n• ۶ٹھ روڈ\n• کالج روڈ\n\nاسلام آباد:\n• سیکٹر G-6 سے G-17\n• سیکٹر F-6 سے F-11\n• سیکٹر I-8 سے I-10\n• بلیو ایریا\n• سپر مارکیٹ\n• آبپارہ\n• کوہسار مارکیٹ\n• فیصل ایونیو\n• سرینگر ہائی وے\n• اسلام آباد ہائی وے\n\n🟡 محدود کوریج (ردعمل کا وقت: ۲۰-۳۰ منٹ):\n\nراولپنڈی:\n• بحریہ ٹاؤن فیز ۹ (انکلیو)\n• ڈی ایچ اے فیز ۳-۵\n• گلریز ہاؤسنگ اسکیم\n• ٹاپ سٹی\n• ایئرپورٹ ہاؤسنگ سوسائٹی\n\nاسلام آباد:\n• سیکٹر B-12\n• سیکٹر C-1 سے C-18\n• سیکٹر D-12\n• سیکٹر E-11\n• سیکٹر H-1 سے H-18\n• سیکٹر I-11 سے I-18\n\n کوئی کوریج نہیں (دوسری سروسز بھیجیں):\n• مری (سوائے مین روڈ کے)\n• ٹیکسلا (محدود)\n• واہ کینٹ (محدود)\n• کہوٹہ\n• کلر سیداں\n• روات\n\n📞 محدود/کوئی کوریج والے علاقوں کے لیے:\n• ۱۱۲۲ پر کال کریں (حکومتی ایمبولینس)\n• رہنمائی کے لیے ۰۱-۴۸۵۳۹۵۱ پر کال کریں\n• ہم مقامی سروسز کے ساتھ ہم آہنگ کر سکتے ہیں\n\n🗺️ کوریج نقشہ: www.alkhidmat.org/ambulance پر دستیاب",
    },
  });
  console.log("✅ [UR] ایمبولینس سروس علاقے اور کوریج نقشہ");

  // Entry 4: Urdu
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "",
      titleUr: "خصوصی ٹرانسپورٹ سروسز - ICU، نیونیٹل اور وہیل چیئر",
      category: "transport-guidance",
      language: "ur",
      status: "active",
      contentEn: "",
      contentUr: "الخدمت فاؤنڈیشن - خصوصی ٹرانسپورٹ سروسز\n\n ICU ایمبولینس سروس:\n\nنازک مریضوں کے لیے:\n• دل کے دورے کے مریض\n• فالج کے مریض\n• شدید صدمے/حادثے کے شکار\n• پوسٹ سرجری مریض\n• وینٹی لیٹر پر مریض\n• کثیر العضو ناکامی کے مریض\n\nآلات:\n• مکمل لائف سپورٹ سسٹم\n• کارڈیک مانیٹر اور ڈیفیبری لیٹر\n• وینٹی لیٹر\n• سرنج پمپس\n• آکسیجن سلنڈر (بڑا)\n• سکشن مشین\n• ایمرجنسی ادویات\n• IV فلوئڈز\n\nعملہ:\n• تربیت یافتہ پیرا میڈک\n• نرس (درخواست پر)\n• ڈاکٹر (درخواست پر، اضافی چارجز)\n\nگنجائش: ۱ مریض + ۱ خاندان کا فرد\n\n👶 نیونیٹل ایمبولینس سروس:\n\nنومولود اور قبل از وقت بچوں کے لیے:\n• قبل از وقت بچے (<۳۷ ہفتے)\n• کم وزن والے بچے\n• انکیوبیٹر کی ضرورت والے بچے\n• سانس کی تکلیف\n• پیدائش کی پیچیدگیاں\n• NICU میں منتقلی\n\nآلات:\n• پورٹیبل انکیوبیٹر\n• نیونیٹل وینٹی لیٹر\n• آکسیجن سپلائی\n• فوٹوتھراپی یونٹ (اگر ضروری ہو)\n• نیونیٹل مانیٹرنگ\n• وارمرز\n\nعملہ:\n• نیونیٹل نرس\n• تربیت یافتہ ڈرائیور\n\nگنجائش: ۱ بچہ + ۱ والدین\n\n♿ وہیل چیئر قابل رسائی ٹرانسپورٹ:\n\nموبیلٹی سے محروم مریضوں کے لیے:\n• بزرگ مریض\n• معذور مریض\n• پوسٹ سرجری مریض\n• دائمی بیماری کے مریض\n• ایئرپورٹ/ہسپتال ٹرانسفر\n\nگاڑیاں:\n• وہیل چیئر رامپ/لفٹ\n• محفوظ وہیل چیئر لاکس\n• آرام دہ بیٹھک\n• ایئر کنڈیشنگ\n• بورڈنگ میں مدد\n\nعملہ:\n• تربیت یافتہ ڈرائیور\n• اسسٹنٹ (درخواست پر)\n\nگنجائش: ۱ وہیل چیئر مریض + ۲ ساتھی\n\n📞 بکنگ: ۰۵۱-۴۸۵۳۹۵۱\n📱 واٹس ایپ: ۰۳۰۰-۱۲۳۴۵۶۷",
    },
  });
  console.log("✅ [UR] خصوصی ٹرانسپورٹ سروسز");

  console.log("\n✨ Data added successfully!");
  console.log("\n📊 Final Summary:");
  console.log("   Facility & Medical Camp Finder: 2 EN + 2 UR = 4 entries");
  console.log("   Free-Service Eligibility Check: 2 EN + 2 UR = 4 entries");
  console.log("   Transport & Ambulance Guidance: 2 EN + 2 UR = 4 entries");
  console.log("   ─────────────────────────────────────");
  console.log("   Total: 12 entries (6 English + 6 Urdu)");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
