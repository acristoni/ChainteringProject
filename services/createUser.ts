export default async function getUserRole(role: string, mainAccount: string) {

    try {
        const response = await fetch('/api/user/',{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({
                walletAddress: mainAccount,
                role: role                  
            })
        });

        const dataResponse = await response.json();
        console.log("🚀 ~ file: getUserRole.ts:10 ~ getUserRole ~ dataResponse:", dataResponse)
        return dataResponse
    } catch (err: any) {
        throw new Error(err)
    }
}
