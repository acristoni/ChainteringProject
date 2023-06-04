import { ethers } from 'ethers';

export default async function connectToShipChartering(
  infoContractAddress: string, 
  charterContract: string,
  contractABI: any[] ): Promise<ethers.providers.TransactionResponse | boolean> {

  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const signer = provider.getSigner();
      const infoContract = new ethers.Contract(infoContractAddress, contractABI, signer);
  
      return infoContract.connectToShipChartering(charterContract);
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected.')
    return false
  }
}