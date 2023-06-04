import { ethers } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import { OpsReport } from '@/interfaces/OpsReport.interface';

export default async function newOperationReport(
  contractAddress: string, 
  operationData: OpsReport ): Promise<ethers.providers.TransactionResponse | boolean> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const signer = provider.getSigner();
      const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

      const transaction = await charterContract.newOperationReport(
        operationData.dateDeparture,
        operationData.dateArrival,
        ethers.utils.parseUnits(String(operationData.latitudeDeparture), 18),
        ethers.utils.parseUnits(String(operationData.longitudeDerparture), 18),
        ethers.utils.parseUnits(String(operationData.latitudeArrival), 18),
        ethers.utils.parseUnits(String(operationData.longitudeArrival), 18),
        operationData.oilConsuption,
        operationData.operationCode
      )
  
      const transactionReceipt = await transaction.wait();
      console.log('tx send report: ', transactionReceipt);
  
      return transaction;
    } catch (error) {
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected.');
    return false
  }
}