import { ethers } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';

export default async function sendVote(
  contractAddress: string, 
  disputeId: number,
  isReasonable: boolean ): Promise<ethers.providers.TransactionResponse> {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const signer = provider.getSigner();
    const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

    const transaction = await charterContract.judgeDispute(
        disputeId,
        isReasonable
    );

    const transactionReceipt = await transaction.wait();
    console.log('tx vote: ', transactionReceipt);

    return transaction;
  } else {
    throw new Error('Metamask is not installed or not connected.');
  }
}