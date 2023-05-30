import { BodyPostNewCharter } from "@/interfaces/BodyPostNewCharter.interface";
import { Parties } from "@/interfaces/Parties.interface";

export default async function newCharter(contractParties: Parties, addressNewCharterContract: string) {
    const body: BodyPostNewCharter = {
        contractAddress: addressNewCharterContract,
        shipwonerAddress: contractParties.shipOwner,
        chartererAddress: contractParties.charterer,
        arbitersAddresses: [
            contractParties.arbiter_1,
            contractParties.arbiter_2,
            contractParties.arbiter_3
        ]
    }

    try {
        const response = await fetch('/api/contractparties/',{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify(body)
        });

        const dataResponse = await response.json();
        return dataResponse
    } catch (err: any) {
        throw new Error(err)
    }
}
