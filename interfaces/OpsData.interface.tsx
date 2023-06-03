import { BigNumber } from "ethers";

export interface OpsData {
    dateDeparture: number;
    dateArrival: number;
    latitudeDeparture: BigNumber;
    longitudeDerparture: BigNumber;
    latitudeArrival: BigNumber;
    longitudeArrival: BigNumber;
    oilConsuption: number;
    operationCode: number;
}