import { ethers } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';

export default async function startCharter(
  contractAddress: string, 
  chartersTimeMonths: number ): Promise<ethers.providers.TransactionResponse | boolean> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const signer = provider.getSigner();
      const charterContract = new ethers.Contract(contractAddress, contractABI, signer);
  
      return charterContract.startCharter(chartersTimeMonths);
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected.');
    return false
  }
}