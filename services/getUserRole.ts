export default async function getUserRole(walletAddress: string) {
    console.log("🚀 ~ file: getUserRole.ts:2 ~ getUserRole ~ walletAddress:", walletAddress)
    try {
        const response = await fetch(`/api/user/${walletAddress}`,{
            method: "GET",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
        });

        const dataResponse = await response.json();
        console.log("🚀 ~ file: getUserRole.ts:10 ~ getUserRole ~ dataResponse:", dataResponse)
        return dataResponse
    } catch (err: any) {
        throw new Error(err)
    }
}