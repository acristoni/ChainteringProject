import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';

interface ResponseCheckSetUp {
  isSetUp: boolean;
  IMOnumber: number;
}

export default async function checkContractSetUp (contractAddress: string): Promise<ResponseCheckSetUp> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

    const vesselData = await charterContract.vesselData();
    if (vesselData && vesselData.length) {
      const vesselIMOnumber = vesselData[0];
      if (vesselIMOnumber) {
        return {
          isSetUp: true, 
          IMOnumber: vesselIMOnumber
        }
      } else {
        return {
          isSetUp: false, 
          IMOnumber: 0
        }
      }
    } else {
      return {
        isSetUp: false, 
        IMOnumber: 0
      }
    }
  } else {
    console.error('Metamask is not installed or not connected.')
    return {
      isSetUp: false, 
      IMOnumber: 0
    }
  }
}