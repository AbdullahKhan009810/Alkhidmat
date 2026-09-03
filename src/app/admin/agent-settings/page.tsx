import AdminShell from "@/components/AdminShell";

export default function AgentSettingsPage() {
  return (
    <AdminShell
      pageTitle="Agent Settings"
      pageSubtitle="Configure AI voice agent behavior"
    >
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
        <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
        <p className="mt-3 max-w-md text-center text-sm text-gray-500">
          Customize the AI agent&apos;s voice, personality, response behavior, language preferences, and conversation flow to match your organization&apos;s needs.
        </p>
      </div>
    </AdminShell>
  );
}
