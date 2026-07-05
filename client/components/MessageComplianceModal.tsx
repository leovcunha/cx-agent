import { X, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useCompliance } from "@/hooks/useCompliance";

interface MessageComplianceModalProps {
  tenantId: string;
  messageId: string;
  onClose: () => void;
}

export default function MessageComplianceModal({
  tenantId,
  messageId,
  onClose,
}: MessageComplianceModalProps) {
  const { messageEval, isLoadingMessageEval, isMessageEvalError } = useCompliance(tenantId, messageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900 text-sm">Message Compliance</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {isLoadingMessageEval ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">Evaluating message compliance...</p>
            </div>
          ) : isMessageEvalError || !messageEval ? (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm text-amber-800 font-semibold">Evaluation Pending or Not Sampled</p>
              <p className="text-xs text-amber-600">
                The compliance evaluator processes messages asynchronously. Please try again in a few moments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score ring */}
              <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-3xl font-extrabold text-gray-900">
                  {messageEval.sop_adherence_score}%
                </span>
                <span className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                  SOP Adherence Score
                </span>
              </div>

              {/* Status checklist */}
              <div className="space-y-2.5">
                {/* Hallucinations */}
                <div
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-colors ${
                    messageEval.hallucination_flag
                      ? "bg-red-50 border-red-100 text-red-900"
                      : "bg-green-50/50 border-green-100/50"
                  }`}
                >
                  {messageEval.hallucination_flag ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Hallucination Check
                    </span>
                    <span className="text-xs text-gray-500">
                      {messageEval.hallucination_flag
                        ? "Fact fabrication/invented policy claims detected."
                        : "Pass. No fabricated facts detected."}
                    </span>
                  </div>
                </div>

                {/* Tone */}
                <div
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-colors ${
                    !messageEval.tone_pass
                      ? "bg-red-50 border-red-100 text-red-900"
                      : "bg-green-50/50 border-green-100/50"
                  }`}
                >
                  {!messageEval.tone_pass ? (
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Tone & Brand Voice
                    </span>
                    <span className="text-xs text-gray-500">
                      {!messageEval.tone_pass
                        ? "Failed standard professionalism or brand guidelines."
                        : "Pass. Friendly, concise, and professional tone."}
                    </span>
                  </div>
                </div>

                {/* Policy Violations */}
                <div
                  className={`p-3.5 rounded-xl border transition-colors ${
                    messageEval.policy_violations.length > 0
                      ? "bg-red-50 border-red-100"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {messageEval.policy_violations.length > 0 ? (
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-gray-900">
                      Policy Rule Compliance
                    </span>
                  </div>
                  {messageEval.policy_violations.length > 0 ? (
                    <ul className="list-disc list-inside text-xs text-red-700 mt-2 space-y-1 pl-1">
                      {messageEval.policy_violations.map((v, i) => (
                        <li key={i} className="leading-relaxed">
                          {v}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-500 block mt-1 ml-6">
                      All steps followed correctly. No infractions.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
