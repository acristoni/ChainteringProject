import { ethers } from 'ethers';
import tokenABI from "../../token/linkabi.json"

async function getLinkTokenBalance(contractAddress: string): Promise<string | boolean> {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.enable();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            const signer = provider.getSigner();
            const tokenContract = new ethers.Contract('0x326C977E6efc84E512bB9C30f76E30c160eD06FB', tokenABI, signer);
            const balance = await tokenContract.balanceOf(contractAddress);
            const balanceFormatted = ethers.utils.formatUnits(balance, 18);
    
            return balanceFormatted;
        } catch (error) {
            console.error(error)
            return false
        }
    } else {
        console.error('Metamask is not installed or not connected.')
        return false;
    }
}

export default getLinkTokenBalance;