import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up old knowledge base data...");

  // Delete all existing entries
  const deleteResult = await prisma.knowledgeBaseEntry.deleteMany({});
  console.log(`️  Deleted ${deleteResult.count} old entries`);

  console.log("\n Adding sample data for 3 use cases...\n");

  // Sample data for Facility & Medical Camp Finder
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Al Khidmat Hospitals in Rawalpindi",
      titleUr: "راولپنڈی میں الخدمت ہسپتال",
      category: "facility-finder",
      language: "both",
      status: "active",
      contentEn: "Al Khidmat Foundation operates the following hospitals in Rawalpindi:\n\n1. Al Khidmat Shifa Hospital - Satellite Town\n   - 24/7 Emergency Services\n   - Free OPD for underprivileged\n   - Specialized departments: Cardiology, Pediatrics, Surgery\n\n2. Al Khidmat Hospital - Murree Road\n   - General Medicine\n   - Free medical camps every weekend\n   - Pharmacy with subsidized medicines\n\n3. Al Khidmat Medical Center - GT Road\n   - Primary healthcare\n   - Maternal and child health services\n   - Vaccination programs",
      contentUr: "الخدمت فاؤنڈیشن راولپنڈی میں درج ذیل ہسپتال چلاتی ہے:\n\n۱. الخدمت شفا ہسپتال - سیٹلائٹ ٹاؤن\n   - ۲۴ گھنٹے ایمرجنسی سروسز\n   - مستحقین کے لیے مفت OPD\n   - مخصوص شعبے: کارڈیالوجی، پیڈیاٹرکس، سرجری\n\n۲. الخدمت ہسپتال - مرری روڈ\n   - جنرل میڈیسن\n   - ہر ہفتے مفت میڈیکل کیمپ\n   - سستی ادویات کے ساتھ فارمیسی\n\n. الخدمت طبی مرکز - جی ٹی روڈ\n   - بنیادی صحت کی دیکھ بھال\n   - ماں اور بچے کی صحت کی سروسز\n   - ویکسینیشن پروگرام",
    },
  });
  console.log("✅ Added: Al Khidmat Hospitals in Rawalpindi");

  // Sample data for Free-Service Eligibility Check
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Free Medical Services Eligibility Criteria",
      titleUr: "مفت طبی سروسز کی اہلیت کے معیار",
      category: "eligibility-check",
      language: "both",
      status: "active",
      contentEn: "Eligibility Criteria for Free Medical Services:\n\n1. Income Requirements:\n   - Monthly household income below PKR 30,000\n   - Must provide income certificate from union council\n\n2. Required Documents:\n   - Valid CNIC (Computerized National Identity Card)\n   - B-Form for children (under 18)\n   - Income certificate / Utility bills\n   - Medical reports (if applicable)\n\n3. Priority Categories:\n   - Widows and orphans\n   - Persons with disabilities\n   - Senior citizens (60+ years)\n   - Chronic disease patients\n\n4. Application Process:\n   - Visit nearest Al Khidmat center\n   - Fill out the application form\n   - Submit required documents\n   - Verification takes 3-5 working days\n   - Approved patients receive free treatment card",
      contentUr: "مفت طبی سروسز کے لیے اہلیت کے معیار:\n\n۱. آمدنی کی ضروریات:\n   - ماہانہ گھریلو آمدنی ۳۰,۰۰ روپے سے کم\n   - یونین کونسل سے آمدنی سرٹیفکیٹ فراہم کرنا ضروری ہے\n\n۲. مطلوبہ دستاویزات:\n   - درست CNIC (کمپیوٹرائزڈ قومی شناختی کارڈ)\n   - بچوں کے لیے B-Form (۱۸ سال سے کم)\n   - آمدنی سرٹیفکیٹ / یوٹیلیٹی بلز\n   - طبی رپورٹس (اگر لاگو ہو)\n\n۳. ترجیحی زمرے:\n   - بیوگان اور یتیم\n   - معذور افراد\n   - سینئر شہری (۶۰+ سال)\n   - دائمی امراض کے مریض\n\n. درخواست کا عمل:\n   - قریبی الخدمت سینٹر جائیں\n   - درخواست فارم پُر کریں\n   - مطلوبہ دستاویزات جمع کرائیں\n   - تصدیق میں ۳-۵ کام کے دن لگتے ہیں\n   - منظور شدہ مریضوں کو مفت علاج کارڈ ملتا ہے",
    },
  });
  console.log("✅ Added: Free Medical Services Eligibility Criteria");

  // Sample data for Transport & Ambulance Guidance
  await prisma.knowledgeBaseEntry.create({
    data: {
      title: "Ambulance and Transport Services Guide",
      titleUr: "ایمبولینس اور ٹرانسپورٹ سروسز گائیڈ",
      category: "transport-guidance",
      language: "both",
      status: "active",
      contentEn: "Al Khidmat Ambulance Services:\n\n1. Emergency Ambulance (1122):\n   - Available 24/7\n   - Free service for emergencies\n   - Advanced life support equipped\n   - Response time: 10-15 minutes in city areas\n\n2. Patient Transport Service:\n   - Non-emergency patient transfer\n   - Hospital to home transport\n   - Inter-city transport available\n   - Nominal charges apply\n\n3. How to Request:\n   - Call 1122 for emergencies\n   - Call 051-4853951 for non-emergency transport\n   - Provide: Location, patient condition, destination\n   - Keep CNIC ready for verification\n\n4. Service Areas:\n   - Rawalpindi: Full coverage\n   - Islamabad: Full coverage\n   - Surrounding areas: Limited coverage\n\n5. Special Services:\n   - ICU Ambulance for critical patients\n   - Neonatal transport for newborns\n   - Wheelchair accessible vehicles\n   - Oxygen support available",
      contentUr: "الخدمت ایمبولینس سروسز:\n\n۱. ایمرجنسی ایمبولینس (۱۱۲):\n   - ۲۴/۷ دستیاب\n   - ایمرجنسی کے لیے مفت سروس\n   - ایڈوانسڈ لائف سپورٹ سے لیس\n   - ردعمل کا وقت: شہری علاقوں میں ۱۰-۱۵ منٹ\n\n۲. مریض ٹرانسپورٹ سروس:\n   - غیر ایمرجنسی مریض کی منتقلی\n   - ہسپتال سے گھر ٹرانسپورٹ\n   - بین الشہر ٹرانسپورٹ دستیاب\n   - معمولی چارجز لاگو ہوتے ہیں\n\n۳. درخواست کا طریقہ:\n   - ایمرجنسی کے لیے ۱۱۲۲ پر کال کریں\n   - غیر ایمرجنسی ٹرانسپورٹ کے لیے ۰۵۱-۴۸۵۳۵۱ پر کال کریں\n   - فراہم کریں: مقام، مریض کی حالت، منزل\n   - تصدیق کے لیے CNIC تیار رکھیں\n\n۴. سروس علاقے:\n   - راولپنڈی: مکمل کوریج\n   - اسلام آباد: مکمل کوریج\n   - ارد گرد کے علاقے: محدود کوریج\n\n۵. خصوصی سروسز:\n   - نازک مریضوں کے لیے ICU ایمبولینس\n   - نومولودوں کے لیے نیونیٹل ٹرانسپورٹ\n   - وہیل چیئر قابل رسائی گاڑیاں\n   - آکسیجن سپورٹ دستیاب",
    },
  });
  console.log("✅ Added: Ambulance and Transport Services Guide");

  console.log("\n✨ Sample data added successfully!");
  console.log("\n📊 Summary:");
  console.log("   - Facility & Medical Camp Finder: 1 entry");
  console.log("   - Free-Service Eligibility Check: 1 entry");
  console.log("   - Transport & Ambulance Guidance: 1 entry");
  console.log("   - Total: 3 entries");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
