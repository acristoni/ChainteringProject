export default async function getUserAddress() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const mainAccount = accounts[0];
        return mainAccount;
    }  else {
        alert('No wallets detected')
    }
}