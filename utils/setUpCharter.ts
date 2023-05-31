import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import { SetUpCharterData } from '@/interfaces/SetUpCharterData.interface';

export default async function setUpCharter(
  contractAddress: string, 
  setUpCharterData: SetUpCharterData): Promise<ethers.providers.TransactionResponse> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
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
  } else {
    throw new Error('Metamask is not installed or not connected.');
  }
}