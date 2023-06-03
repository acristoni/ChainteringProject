export interface OpenDispute {
    startTime: number;
    endTime: number;
    reason: string //"Not bad weather, as reported"
    value: number; //10000
    partie: number // 0 - shipowner; 1 - charterer
}