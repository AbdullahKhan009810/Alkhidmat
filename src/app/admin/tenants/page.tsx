import AdminShell from "@/components/AdminShell";

export default function TenantsPage() {
  return (
    <AdminShell
      pageTitle="Tenant Management"
      pageSubtitle="Manage organizations and access control"
    >
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
        <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
        <p className="mt-3 max-w-md text-center text-sm text-gray-500">
          Create and manage tenant organizations, assign roles and permissions, configure branding, and control access to the platform across multiple entities.
        </p>
      </div>
    </AdminShell>
  );
}
