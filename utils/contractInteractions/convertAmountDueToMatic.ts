import { ethers } from 'ethers';
import contractArtifact from '../../artifacts/contracts/ShipChartering.sol/ShipTimeCharteringGeneric.json';
import convertHexToInt from '../convertFunctions/convertHexToInt';

async function convertAmountDueToMatic(contractAddress: string): Promise<number | boolean> {
    const contractABI: any[] = contractArtifact.abi

    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.enable();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            const signer = provider.getSigner();
            const charterContract = new ethers.Contract(contractAddress, contractABI, signer);

            const amountConvertedIObject = await charterContract.convertAmountDueToMatic()
            const amountConverted = convertHexToInt(amountConvertedIObject._hex)

            return amountConverted;
        } catch (error) {
            console.error(error)
            return false
        }
    } else {
        console.error('Metamask is not installed or not connected.')
        return false;
    }
}

export default convertAmountDueToMatic;