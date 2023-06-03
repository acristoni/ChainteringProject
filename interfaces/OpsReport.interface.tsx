import { BigNumber } from "ethers";

export interface OpsReport {
    dateDeparture: number;
    dateArrival: number;
    latitudeDeparture: number;
    longitudeDerparture: number;
    latitudeArrival: number;
    longitudeArrival: number;
    oilConsuption: number;
    operationCode: number;
}