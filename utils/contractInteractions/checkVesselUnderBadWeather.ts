import { ethers } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';

export default async function checkVesselUnderBadWeather( contractAddress: string ): Promise<boolean> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const signer = provider.getSigner();
      const charterContract = new ethers.Contract(contractAddress, contractABI, signer);
  
      const vesselData = await charterContract.vesselData();
      const isInBadWeatherConditionsShipOwnerInfo = vesselData.isInBadWeatherConditionsShipOwnerInfo;
  
      return isInBadWeatherConditionsShipOwnerInfo
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected.')
    return false
  }
}