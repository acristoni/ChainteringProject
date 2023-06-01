import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';  
import { ResponseCheckStatus } from '@/interfaces/ResponseCheckStatus.interface';

export default async function checkContractStatus (contractAddress: string): Promise<ResponseCheckStatus> {
  const contractABI: any[] = contractArtifact.abi;
  let checkSetUp: { isSetUp: boolean, IMOnumber: number } = {
    isSetUp: false,
    IMOnumber: 0
  };
  let isStated = false;

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

    const vesselData = await charterContract.vesselData();
    if (vesselData && vesselData.length) {
      const vesselIMOnumber = vesselData[0];
      if (vesselIMOnumber) {
        checkSetUp = {
          isSetUp: true,
          IMOnumber: vesselIMOnumber
        }
      } 
    } 

    const contractTimes = await charterContract.contractTimes();
    if (contractTimes && contractTimes.length) {
      const startDateTime = parseInt(contractTimes[0]);
      if (startDateTime) {
        isStated = true
      }
    }

    const truflationContract = await charterContract.contractTruflation()
    const maticContract = await charterContract.contractPriceMaticUSD()
    const totalAmountDueToPay = await charterContract.totalAmountDueToPay()

    return {
      ...checkSetUp,
      isStated,
      truflationContract,
      maticContract,
      totalAmountDueToPay
    }
  } else {
    console.error('Metamask is not installed or not connected.')
    return {
      isSetUp: false, 
      IMOnumber: 0,
      isStated: false,
      truflationContract: "",
      maticContract: "",
      totalAmountDueToPay: 0
    }
  }
}