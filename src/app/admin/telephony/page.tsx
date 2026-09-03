import AdminShell from "@/components/AdminShell";

export default function TelephonyPage() {
  return (
    <AdminShell
      pageTitle="Telephony Management"
      pageSubtitle="Configure voice channels and call routing"
    >
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
        <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
        <p className="mt-3 max-w-md text-center text-sm text-gray-500">
          Manage voice channels, configure call routing rules, set up IVR menus, and monitor real-time call analytics — all from one place.
        </p>
      </div>
    </AdminShell>
  );
}
