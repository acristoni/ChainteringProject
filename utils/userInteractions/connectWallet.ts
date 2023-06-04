import getUserRole from '../../services/getUserRole'
import getUserAddress from './getUserAddress';

const requestAccounts = async () => {  
  try {
    const mainAccount = await getUserAddress();
    const response = await getUserRole(mainAccount);
    if (response.success && response.data) {
      const role: string = response.data.role
      const walletAddress: string = response.data.walletAddress
      sessionStorage.setItem("@ROLE", role)
      sessionStorage.setItem("@WALLET", walletAddress)
      return 'registeredUser'
    } else
    if (response.success) {
      return 'choseRole'
    } else {
      alert("We encountered an issue while trying to retrieve the information from your wallet. Please try again later or contact us for assistance.")
    }            
  } catch (error) {
    console.error(error)
  }
}

const connectWallet = async() => {
  if (typeof window.ethereum !== 'undefined') {
    const response = await requestAccounts()
    return response;
  }
}

export default connectWallet;
