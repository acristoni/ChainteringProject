import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import { SetUpCharterData } from '@/interfaces/SetUpCharterData.interface';

export default async function setUpCharter(
  contratoAddress: string, 
  setUpCharterData: SetUpCharterData): Promise<ethers.providers.TransactionResponse> {
  const contratABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContrat = new ethers.Contract(contratoAddress, contratABI, signer);

    return charterContrat.setUpContract(
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