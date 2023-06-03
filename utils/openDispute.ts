import { ethers } from 'ethers';
import contractArtifact from '../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import { OpenDispute } from '@/interfaces/OpenDispute.interface';

export default async function openDispute(
  contractAddress: string, 
  disputeData: OpenDispute ): Promise<ethers.providers.TransactionResponse> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

    const transaction = await charterContract.createDispute(
      disputeData.startTime,
      disputeData.endTime,
      disputeData.reason,
      disputeData.value,
      disputeData.partie
    );

    const transactionReceipt = await transaction.wait();
    console.log('tx dist: ', transactionReceipt);

    return transaction;
  } else {
    throw new Error('Metamask is not installed or not connected.');
  }
}