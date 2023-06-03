import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';

export default async function checkVesselUnderBadWeather( contractAddress: string ): Promise<boolean> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

    const vesselData = await charterContract.vesselData();
    const isInBadWeatherConditionsShipOwnerInfo = vesselData.isInBadWeatherConditionsShipOwnerInfo;

    return isInBadWeatherConditionsShipOwnerInfo
  } else {
    throw new Error('Metamask is not installed or not connected.');
  }
}