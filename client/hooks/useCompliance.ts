import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface MessageEvaluation {
  id: string;
  message_id: string;
  tenant_id: string;
  sop_adherence_score: number;
  policy_violations: string[];
  tone_pass: boolean;
  hallucination_flag: boolean;
  created_at: string;
}

export interface AggregateStats {
  tenant_id: string;
  total_evaluations: number;
  average_sop_adherence: number;
  total_policy_violations: number;
  total_tone_failures: number;
  total_hallucinations: number;
}

export function useCompliance(tenantId: string, messageId?: string) {
  const { session } = useAuth();

  const aggregateQuery = useQuery<AggregateStats>({
    queryKey: ["compliance_aggregate", tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/evaluations/${tenantId}/aggregate`, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch aggregate stats");
      return res.json();
    },
    enabled: !!tenantId,
    refetchInterval: 10000, // refresh every 10s
  });

  const messageQuery = useQuery<MessageEvaluation>({
    queryKey: ["compliance_message", messageId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${messageId}/evaluation`, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch message evaluation");
      return res.json();
    },
    enabled: !!messageId,
    retry: 2,
  });

  return {
    aggregate: aggregateQuery.data,
    isLoadingAggregate: aggregateQuery.isLoading,
    messageEval: messageQuery.data,
    isLoadingMessageEval: messageQuery.isLoading,
    isMessageEvalError: messageQuery.isError,
  };
}
