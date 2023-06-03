import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import { OpsReport } from '@/interfaces/OpsReport.interface';

export default async function newOperationReport(
  contractAddress: string, 
  operationData: OpsReport ): Promise<ethers.providers.TransactionResponse> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

    const transaction =  charterContract.newOperationReport(
      operationData.dateDeparture,
      operationData.dateArrival,
      ethers.utils.parseUnits(String(operationData.latitudeDeparture), 18),
      ethers.utils.parseUnits(String(operationData.longitudeDerparture), 18),
      ethers.utils.parseUnits(String(operationData.latitudeArrival), 18),
      ethers.utils.parseUnits(String(operationData.longitudeArrival), 18),
      operationData.oilConsuption,
      operationData.operationCode
    );

    const transactionReceipt = await transaction.wait();
    console.log('tx send report: ', transactionReceipt);

    return transaction;
  } else {
    throw new Error('Metamask is not installed or not connected.');
  }
}