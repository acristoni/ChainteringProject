import { ethers } from 'ethers';

export default async function connectToShipChartering(
  infoContractAddress: string, 
  charterContract: string,
  contractABI: any[] ): Promise<ethers.providers.TransactionResponse> {

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const infoContract = new ethers.Contract(infoContractAddress, contractABI, signer);

    return infoContract.connectToShipChartering(charterContract);
  } else {
    throw new Error('Metamask is not installed or not connected.');
  }
}