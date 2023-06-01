export default async function getUserRole(walletAddress: string) {
    try {
        const response = await fetch(`/api/user/${walletAddress}`,{
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