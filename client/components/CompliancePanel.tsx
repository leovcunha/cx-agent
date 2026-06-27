import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { useCompliance } from "@/hooks/useCompliance";

interface CompliancePanelProps {
  tenantId: string;
  messageId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompliancePanel({ tenantId, messageId }: CompliancePanelProps) {
  const { aggregate, isLoadingAggregate, messageEval, isLoadingMessageEval, isMessageEvalError } = useCompliance(tenantId, messageId);

  return (
    <div className="w-full bg-white flex flex-col shrink-0 h-full overflow-hidden font-sans">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900 text-sm">Compliance Dashboard</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Aggregate Stats Section */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Historical Aggregates</h3>
          {isLoadingAggregate ? (
            <div className="animate-pulse space-y-2">
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-10 bg-gray-100 rounded-xl"></div>
            </div>
          ) : aggregate ? (
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{aggregate.average_sop_adherence}%</span>
                <span className="text-xs text-gray-500 font-medium mt-1">Avg SOP Adherence</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex flex-col items-center">
                  <span className="text-lg font-bold text-red-600">{aggregate.total_policy_violations}</span>
                  <span className="text-[10px] text-red-600 font-semibold uppercase text-center">Violations</span>
                </div>
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex flex-col items-center">
                  <span className="text-lg font-bold text-orange-600">{aggregate.total_hallucinations}</span>
                  <span className="text-[10px] text-orange-600 font-semibold uppercase text-center">Hallucinations</span>
                </div>
              </div>
              <div className="text-xs text-center text-gray-400 font-medium">
                Based on {aggregate.total_evaluations} evaluated messages
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No historical data available.</div>
          )}
        </section>

        <div className="h-px bg-gray-100 w-full"></div>

        {/* Selected Message Stats Section */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Selected Message</h3>
          
          {!messageId ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center flex flex-col items-center">
              <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">Click on an AI message in the chat to view its compliance report.</p>
            </div>
          ) : isLoadingMessageEval ? (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center animate-pulse">
              <p className="text-xs text-blue-600 font-medium">Evaluating message...</p>
            </div>
          ) : isMessageEvalError || !messageEval ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-500">Evaluation pending or not sampled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${messageEval.sop_adherence_score >= 80 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <span className="text-xs font-bold text-gray-700">SOP Adherence</span>
                <span className={`text-sm font-bold ${messageEval.sop_adherence_score >= 80 ? 'text-green-700' : 'text-red-700'}`}>
                  {messageEval.sop_adherence_score}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className={`p-3 rounded-xl border flex items-start space-x-2 ${messageEval.hallucination_flag ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                  {messageEval.hallucination_flag ? <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" /> : <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />}
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Hallucination Check</span>
                    <span className="text-xs text-gray-500">{messageEval.hallucination_flag ? 'Invented policies detected' : 'Pass'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start space-x-2 ${!messageEval.tone_pass ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                  {!messageEval.tone_pass ? <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" /> : <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />}
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Tone & Brand Voice</span>
                    <span className="text-xs text-gray-500">{!messageEval.tone_pass ? 'Failed tone guidelines' : 'Pass'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${messageEval.policy_violations.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {messageEval.policy_violations.length > 0 ? <ShieldAlert className="w-4 h-4 text-red-600" /> : <ShieldCheck className="w-4 h-4 text-green-500" />}
                    <span className="text-xs font-bold text-gray-900">Policy Violations</span>
                  </div>
                  {messageEval.policy_violations.length > 0 ? (
                    <ul className="list-disc list-inside text-xs text-red-700 mt-2 space-y-1">
                      {messageEval.policy_violations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-500 ml-6">No violations found</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
