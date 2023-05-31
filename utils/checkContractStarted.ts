import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';

export default async function checkContractStarted (contractAddress: string): Promise<boolean> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

    const contractTimes = await charterContract.contractTimes();
    if (contractTimes && contractTimes.length) {
      const startDateTime = parseInt(contractTimes[0]);
      if (startDateTime) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected.')
    return false
  }
}