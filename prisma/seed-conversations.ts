import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up old conversations...");

  // Delete all existing messages first (due to foreign key constraint)
  const deleteMessages = await prisma.message.deleteMany({});
  console.log(`🗑️  Deleted ${deleteMessages.count} old messages`);

  // Delete all existing conversations
  const deleteConversations = await prisma.conversation.deleteMany({});
  console.log(`️  Deleted ${deleteConversations.count} old conversations`);

  console.log("\n Adding sample conversations for 3 use cases...\n");

  // Conversation 1: Facility & Medical Camp Finder
  const conv1 = await prisma.conversation.create({
    data: {
      sessionId: "TR-FACILITY01",
      language: "en",
      status: "active",
      messages: {
        create: [
          {
            role: "bot",
            content: "Assalam o Alaikum! I'm Al Khidmat Foundation's voice assistant. How can I help you today?",
            timestamp: new Date("2026-08-28T10:00:00"),
          },
          {
            role: "user",
            content: "I need to find a hospital near Satellite Town",
            timestamp: new Date("2026-08-28T10:00:15"),
          },
          {
            role: "bot",
            content: "Al Khidmat Shifa Hospital is located in Satellite Town, Rawalpindi. It offers:\n\n• 24/7 Emergency Services\n• Free OPD for underprivileged patients\n• Specialized departments: Cardiology, Pediatrics, Surgery\n\nWould you like directions or more information about their services?",
            timestamp: new Date("2026-08-28T10:00:30"),
          },
          {
            role: "user",
            content: "What are the OPD timings?",
            timestamp: new Date("2026-08-28T10:01:00"),
          },
          {
            role: "bot",
            content: "OPD Timings at Al Khidmat Shifa Hospital:\n\n• Morning OPD: 9:00 AM - 1:00 PM\n• Evening OPD: 5:00 PM - 9:00 PM\n• Emergency: 24/7\n\nFor free OPD, please bring your CNIC and income certificate. Would you like to know about eligibility criteria?",
            timestamp: new Date("2026-08-28T10:01:20"),
          },
        ],
      },
    },
  });
  console.log("✅ Added: Facility & Medical Camp Finder conversation");

  // Conversation 2: Free-Service Eligibility Check
  const conv2 = await prisma.conversation.create({
    data: {
      sessionId: "TR-ELIGIBILITY01",
      language: "ur",
      status: "active",
      messages: {
        create: [
          {
            role: "bot",
            content: "السلام علیکم! میں الخدمت فاؤنڈیشن کا ووئس اسسٹنٹ ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟",
            timestamp: new Date("2026-08-28T11:00:00"),
          },
          {
            role: "user",
            content: "میں مفت علاج کے لیے اپلائی کرنا چاہتا ہوں",
            timestamp: new Date("2026-08-28T11:00:20"),
          },
          {
            role: "bot",
            content: "مفت طبی سروسز کے لیے اہلیت کے معیار:\n\n۱. ماہانہ گھریلو آمدنی ۳۰,۰۰ روپے سے کم ہونی چاہیے\n۲. یونین کونسل سے آمدنی سرٹیفکیٹ درکار ہے\n۳. درست CNIC اور B-Form (بچوں کے لیے)\n\nکیا آپ کے پاس یہ دستاویزات موجود ہیں؟",
            timestamp: new Date("2026-08-28T11:00:45"),
          },
          {
            role: "user",
            content: "جی ہاں، میرے پاس سب کچھ ہے۔ میں کہاں جاؤں؟",
            timestamp: new Date("2026-08-28T11:01:30"),
          },
          {
            role: "bot",
            content: "بہترین! آپ قریبی الخدمت سینٹر جا سکتے ہیں:\n\n📍 الخدمت شفا ہسپتال - سیٹلائٹ ٹاؤن\n الخدمت ہسپتال - مرری روڈ\n📍 الخدمت طبی مرکز - جی ٹی روڈ\n\nدرخواست فارم پُر کریں اور دستاویزات جمع کرائیں۔ تصدیق ۳-۵ کام کے دنوں میں ہوگی۔",
            timestamp: new Date("2026-08-28T11:02:00"),
          },
        ],
      },
    },
  });
  console.log("✅ Added: Free-Service Eligibility Check conversation");

  // Conversation 3: Transport & Ambulance Guidance
  const conv3 = await prisma.conversation.create({
    data: {
      sessionId: "TR-TRANSPORT01",
      language: "en",
      status: "active",
      messages: {
        create: [
          {
            role: "bot",
            content: "Assalam o Alaikum! I'm Al Khidmat Foundation's voice assistant. How can I help you today?",
            timestamp: new Date("2026-08-28T12:00:00"),
          },
          {
            role: "user",
            content: "I need an ambulance for my father, he's having chest pain",
            timestamp: new Date("2026-08-28T12:00:10"),
          },
          {
            role: "bot",
            content: "🚨 EMERGENCY ALERT \n\nFor immediate emergency ambulance:\n📞 Call 1122 (Available 24/7)\n\nOur ambulance is equipped with:\n• Advanced life support\n• Cardiac care equipment\n• Trained paramedics\n\nResponse time: 10-15 minutes in city areas\n\nPlease call 1122 NOW and provide:\n1. Your exact location\n2. Patient's condition\n3. Nearest landmark",
            timestamp: new Date("2026-08-28T12:00:25"),
          },
          {
            role: "user",
            content: "We're near Saddar Rawalpindi, near Imperial Market",
            timestamp: new Date("2026-08-28T12:01:00"),
          },
          {
            role: "bot",
            content: "✅ Ambulance dispatched to your location!\n\n Location: Saddar Rawalpindi, near Imperial Market\n🚑 Estimated arrival: 10-12 minutes\n\nWhile waiting:\n• Keep your father calm and seated\n• If he has prescribed medication (like nitroglycerin), help him take it\n• Keep his CNIC ready\n• Have someone wait at the main road to guide the ambulance\n\n Emergency contact: 1122\n📞 Al Khidmat helpline: 051-4853951\n\nMay Allah give him shifa! ",
            timestamp: new Date("2026-08-28T12:01:30"),
          },
        ],
      },
    },
  });
  console.log("✅ Added: Transport & Ambulance Guidance conversation");

  console.log("\n✨ Sample conversations added successfully!");
  console.log("\n📊 Summary:");
  console.log("   - Facility & Medical Camp Finder: 1 conversation (4 messages)");
  console.log("   - Free-Service Eligibility Check: 1 conversation (4 messages)");
  console.log("   - Transport & Ambulance Guidance: 1 conversation (4 messages)");
  console.log("   - Total: 3 conversations, 12 messages");
}

main()
  .catch((e) => {
    console.error(" Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
