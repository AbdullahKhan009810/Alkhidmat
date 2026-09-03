import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: September 3, 2026</p>

          <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
              <p className="mt-3">
                This Privacy Policy explains how <strong>Muawin</strong>, built by <strong>Aridian Technologies</strong> for <strong>Al Khidmat Foundation</strong>, collects, uses, and protects your information when you use our voice-powered welfare assistance platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
              <p className="mt-3">We collect the following types of information:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Voice Data:</strong> Audio recordings of your voice interactions with the assistant, processed in real-time for speech recognition.</li>
                <li><strong>Conversation Transcripts:</strong> Text transcriptions of your conversations, stored with session IDs for service improvement.</li>
                <li><strong>Language Preference:</strong> Whether you use the service in English or Urdu.</li>
                <li><strong>Usage Data:</strong> Basic analytics such as session duration and feature usage.</li>
              </ul>
              <p className="mt-3">
                We do <strong>not</strong> collect personally identifiable information such as your name, CNIC, phone number, or address unless you voluntarily provide it during a conversation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
              <p className="mt-3">We use collected information to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Provide and improve the voice assistant service.</li>
                <li>Train and improve speech recognition and AI response accuracy.</li>
                <li>Monitor service performance and fix technical issues.</li>
                <li>Generate anonymized reports on service usage for Al Khidmat Foundation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">4. Data Storage & Security</h2>
              <p className="mt-3">
                Conversation data is stored securely in our database (PostgreSQL via Supabase) with access restricted to authorized Al Khidmat Foundation administrators. We implement industry-standard security measures to protect your data from unauthorized access, alteration, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">5. Third-Party Services</h2>
              <p className="mt-3">We use the following third-party services to operate Muawin:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Qwen (DashScope):</strong> For language understanding and AI responses.</li>
                <li><strong>Uplift AI:</strong> For Urdu text-to-speech synthesis.</li>
                <li><strong>ElevenLabs:</strong> For English text-to-speech synthesis.</li>
                <li><strong>Supabase:</strong> For database and authentication.</li>
                <li><strong>Vercel:</strong> For hosting and deployment.</li>
              </ul>
              <p className="mt-3">
                These providers have their own privacy policies and may process data according to their terms. We only share the minimum data necessary for each service to function.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">6. Data Retention</h2>
              <p className="mt-3">
                Conversation transcripts are retained for as long as necessary to provide and improve the service. You may request deletion of your conversation data by contacting us at{" "}
                <a href="mailto:info@aridiantechnologies.com" className="text-[#0F5CC3] underline">info@aridiantechnologies.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">7. Your Rights</h2>
              <p className="mt-3">You have the right to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Request access to your conversation data.</li>
                <li>Request deletion of your conversation data.</li>
                <li>Opt out of data collection by not using the service.</li>
                <li>Contact us with any privacy concerns or questions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">8. Children&apos;s Privacy</h2>
              <p className="mt-3">
                The service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">9. Changes to This Policy</h2>
              <p className="mt-3">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">10. Contact Us</h2>
              <p className="mt-3">
                For privacy-related questions or concerns, contact us at{" "}
                <a href="mailto:info@aridiantechnologies.com" className="text-[#0F5CC3] underline">info@aridiantechnologies.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
