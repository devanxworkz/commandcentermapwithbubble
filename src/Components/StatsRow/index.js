import { CreditCard, User, Phone } from "lucide-react";

function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="bg-gradient-to-br from-[#1a1f3c] via-[#202b5c] to-[#0d0f24] 
                    rounded-2xl shadow-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <h2 className="text-xl font-bold text-white">{value}</h2>
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.startsWith("-") ? "text-red-400" : "text-green-400"
            }`}
          >
            {trend}
          </p>
        )}
      </div>
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600">
        <Icon className="text-white w-5 h-5" />
      </div>
    </div>
  );
}

export default function StatsRow({ details, vin }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="VIN-Number"
        value={details?.vinnumber || details?.vinNumber || vin || "N/A"}
        icon={CreditCard}
      />
      <StatCard
        label="Model"
        value={details?.model || "N/A"}
        icon={User}
      />
      <StatCard
        label="Owner"
        value={details?.ownerName || details?.ownername || "N/A"}
        icon={User}
      />
      <StatCard
        label="Phone"
        value={details?.phoneNumber || details?.phonenumber || "N/A"}
        icon={Phone}
      />
    </div>
  );
}
