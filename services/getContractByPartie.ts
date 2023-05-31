export default async function getContractByPartie(role: string, walletAddress: string) {
    console.log("🚀 ~ file: getContractByPartie.ts:2 ~ getContractByPartie ~ walletAddress:", walletAddress)
    console.log("🚀 ~ file: getContractByPartie.ts:2 ~ getContractByPartie ~ role:", role)
    try {
        const response = await fetch(`/api/contractparties/${role}?address=${walletAddress}`,{
            method: "GET",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
        });

        const dataResponse = await response.json();
        return dataResponse
    } catch (err: any) {
        throw new Error(err)
    }
}