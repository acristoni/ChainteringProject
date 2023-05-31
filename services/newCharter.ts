import { BodyPostNewCharter } from "@/interfaces/BodyPostNewCharter.interface";
import { Parties } from "@/interfaces/Parties.interface";

export default async function newCharter(contractParties: Parties, addressNewCharterContract: string) {
    const body: BodyPostNewCharter = {
        contractAddress: addressNewCharterContract,
        shipwonerAddress: contractParties.shipOwner.toLowerCase(),
        chartererAddress: contractParties.charterer.toLowerCase(),
        arbitersAddresses: [
            contractParties.arbiter_1.toLowerCase(),
            contractParties.arbiter_2.toLowerCase(),
            contractParties.arbiter_3.toLowerCase()
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
