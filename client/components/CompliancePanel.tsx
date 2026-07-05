import { Shield, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";
import { useCompliance } from "@/hooks/useCompliance";

interface CompliancePanelProps {
  tenantId: string;
}

export default function CompliancePanel({ tenantId }: CompliancePanelProps) {
  const { aggregate, isLoadingAggregate } = useCompliance(tenantId);

  // Circular gauge math variables
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const averageSopAdherence = aggregate?.average_sop_adherence ?? 0;
  const strokeDashoffset = circumference - (averageSopAdherence / 100) * circumference;

  // Determine progress color class
  const getProgressColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-500 text-emerald-600";
    if (score >= 50) return "stroke-amber-500 text-amber-600";
    return "stroke-rose-500 text-rose-600";
  };

  const getProgressBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  // Helper stats
  const totalEvals = aggregate?.total_evaluations ?? 0;
  const totalViolations = aggregate?.total_policy_violations ?? 0;
  const totalHallucinations = aggregate?.total_hallucinations ?? 0;

  const violationPercentage = totalEvals > 0 ? Math.min(100, (totalViolations / totalEvals) * 100) : 0;
  const hallucinationPercentage = totalEvals > 0 ? Math.min(100, (totalHallucinations / totalEvals) * 100) : 0;

  return (
    <div className="w-full bg-white flex flex-col shrink-0 h-full overflow-hidden font-sans">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600 animate-pulse" />
          <h2 className="font-bold text-gray-900 text-sm">SOP Compliance Dashboard</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {isLoadingAggregate ? (
          <div className="space-y-6 animate-pulse">
            <div className="flex flex-col items-center justify-center p-6 h-48 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="w-28 h-28 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-100 rounded-lg w-1/3"></div>
              <div className="h-12 bg-gray-50 rounded-xl"></div>
              <div className="h-12 bg-gray-50 rounded-xl"></div>
            </div>
          </div>
        ) : aggregate && totalEvals > 0 ? (
          <div className="space-y-6">
            {/* Visual Circular Gauge */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center shadow-sm">
              <div className="relative flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-gray-100 fill-none"
                    strokeWidth={strokeWidth}
                  />
                  {/* Foreground filled circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className={`fill-none transition-all duration-1000 ease-out ${getProgressColor(averageSopAdherence)}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-3xl font-extrabold text-gray-900 leading-none">
                    {averageSopAdherence}%
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                    Adherence
                  </span>
                </div>
              </div>

              <div className={`mt-5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${getProgressBg(averageSopAdherence)}`}>
                {averageSopAdherence >= 80 ? "Healthy Compliance" : averageSopAdherence >= 50 ? "Needs Review" : "Critical Action Required"}
              </div>
            </div>

            {/* Historical Metrics Charts */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Aggregated Infraction Rates
                </h3>
                <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  <span>{totalEvals} total audits</span>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Policy Violations Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-gray-800">Policy Violations Rate</span>
                    </div>
                    <span className="text-xs font-bold text-rose-600">
                      {totalViolations} ({violationPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${violationPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1.5">
                    Evaluations flagged for skipping steps or breaching limits.
                  </p>
                </div>

                {/* Hallucinations Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-gray-800">Hallucination Rate</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">
                      {totalHallucinations} ({hallucinationPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${hallucinationPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1.5">
                    Evaluations flagged for fabricating facts or policy claims.
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center space-y-2">
            <Shield className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-800">No Historical Data Yet</p>
            <p className="text-xs text-gray-500">
              Evaluations will populate here as the AI response compliance auditor processes agent turns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
