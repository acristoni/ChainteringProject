import { ResponseCheckStatus } from "./ResponseCheckStatus.interface";

export interface ContractStatus extends ResponseCheckStatus {
    roleUser: string;
}