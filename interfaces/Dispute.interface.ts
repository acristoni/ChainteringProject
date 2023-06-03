import { DisputeParties } from "@/enum/DisputeParties.enum";

export interface Dispute {
    id: number;
    startTime: string;
    endTime: string;
    reason: string;
    isClose: boolean;
    value: number;
    partOpenDispute: DisputeParties;
    winningPart: DisputeParties;
}
