import { ethers } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import { SetUpCharterData } from '@/interfaces/SetUpCharterData.interface';

export default async function setUpCharter(
  contractAddress: string, 
  setUpCharterData: SetUpCharterData): Promise<ethers.providers.TransactionResponse | boolean> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const signer = provider.getSigner();
      const charterContract = new ethers.Contract(contractAddress, contractABI, signer);
  
      return charterContract.setUpContract(
        setUpCharterData.charterPerHour,
        setUpCharterData.chainteringServicePayPerHour,
        setUpCharterData.minimumCruisingSpeed,
        setUpCharterData.vesselIMOnumber,
        setUpCharterData.penaltyPerHour,
        setUpCharterData.consuptionstandBy,
        setUpCharterData.consuptionAtOperation,
        setUpCharterData.consuptionUnderWay
      );
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected.');
    return false
  }
}