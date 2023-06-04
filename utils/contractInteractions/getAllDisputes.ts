import { ethers } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import { Dispute } from '@/interfaces/Dispute.interface';
import { DisputeParties } from '@/enum/DisputeParties.enum';
import convertHexTimestampToISO from '../convertFunctions/convertHexTimestampToISO';
import convertHexToInt from '../convertFunctions/convertHexToInt';

export default async function getAllDisputes( contractAddress: string ): Promise<Dispute[] | boolean>  {
  const contractABI: any[] = contractArtifact.abi

  if (typeof window.ethereum !== 'undefined') {
    try {

      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const allDisputes: Dispute[] = []
      
      const signer = provider.getSigner();
      const charterContract = new ethers.Contract(contractAddress, contractABI, signer);
  
      const totalDisputes = await charterContract.totalDisputes()
      if (totalDisputes) {
        for (let i = 1; i <= totalDisputes; i++) {
          const disputeFromContract = await charterContract.allDisputes(i)
                  
          const startTimeFromContract = disputeFromContract.startTime._hex
          const startTime = convertHexTimestampToISO(startTimeFromContract)
          
          const endTimeFromContract = disputeFromContract.endTime._hex
          const endTime = convertHexTimestampToISO(endTimeFromContract)
  
          const valueFromContract = disputeFromContract.value._hex
          const value = convertHexToInt(valueFromContract)
  
          let partOpenDispute = DisputeParties.shipOwner
          let winningPart = DisputeParties.shipOwner
  
          if (disputeFromContract.partOpenDispute) {
            partOpenDispute = DisputeParties.charterer
          }
  
          if (disputeFromContract.winningPart) {
            winningPart = DisputeParties.charterer
          }
  
          const dispute: Dispute = {
            id: i,
            startTime: startTime,
            endTime: endTime,
            reason: disputeFromContract.reason,
            isClose: disputeFromContract.isClose,
            value: value,
            partOpenDispute: partOpenDispute,
            winningPart: winningPart
          }
  
          allDisputes.push(dispute)
        }
      }
  
      return allDisputes
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected.')
    return false
  }
}