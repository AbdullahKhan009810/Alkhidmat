import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, MapPin } from "lucide-react";

/* ── Social icon SVGs ─────────────────────────────────── */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", icon: FacebookIcon, href: "https://www.facebook.com/aridiantechnologies", color: "text-[#1877F2]", bg: "bg-[#1877F2]/10" },
  { label: "LinkedIn", icon: LinkedinIcon, href: "https://www.linkedin.com/company/aridiantechnologies", color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10" },
  { label: "Instagram", icon: InstagramIcon, href: "https://www.instagram.com/aridiantechnologies/", color: "text-[#E4405F]", bg: "bg-[#E4405F]/10" },
  { label: "Email", icon: Mail, href: "mailto:info@aridiantechnologies.com", color: "text-[#0F5CC3]", bg: "bg-[#0F5CC3]/10" },
];

export default function ContactSupport() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
          <p className="mt-2 text-sm text-gray-500">
            We&apos;re here to help. Reach out to us through any of the channels below.
          </p>

          <div className="mt-8 space-y-6">
            {/* ── Social Icons ────────────────────────────── */}
            <div className="rounded-2xl bg-[#EEF1F8] p-6">
              <h2 className="text-xl font-semibold text-gray-900">Connect With Us</h2>
              <p className="mt-2 text-sm text-gray-500">Follow us on social media or reach out via email.</p>
              <div className="mt-5 flex items-center gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${social.bg} transition-transform hover:scale-110`}
                    title={social.label}
                  >
                    <social.icon className={`h-6 w-6 ${social.color}`} />
                  </a>
                ))}
              </div>
            </div>

            {/* ── About Section ───────────────────────────── */}
            <div className="rounded-2xl bg-[#EEF1F8] p-6">
              <h2 className="text-xl font-semibold text-gray-900">About Muawin</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Muawin is a voice-powered welfare assistance platform built by{" "}
                <strong>Aridian Technologies</strong> for{" "}
                <strong>Al Khidmat Foundation</strong>, Pakistan. It helps citizens access information about free medical care, ambulance services, and welfare programs through a simple voice conversation in English or Urdu.
              </p>
              <p className="mt-3 text-gray-700 leading-relaxed">
                For technical issues with the Muawin platform, email us at{" "}
                <a href="mailto:info@aridiantechnologies.com" className="text-[#0F5CC3] underline">
                  info@aridiantechnologies.com
                </a>. For welfare service inquiries, call the Al Khidmat helpline at{" "}
                <strong>051-4853951</strong>.
              </p>
            </div>

            {/* ── Location ────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F5CC3]/10">
                  <MapPin className="h-5 w-5 text-[#0F5CC3]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Aridian Technologies</p>
                  <p className="mt-1 text-gray-700">
                    Rawalpindi, Pakistan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
