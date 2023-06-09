import { ethers } from 'ethers';
import tokenABI from "../../token/linkabi.json"

async function depositLinkToken(contractAddress: string, contractABI: any[]): Promise<ethers.providers.TransactionResponse | boolean> {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.enable(); 
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract('0x326C977E6efc84E512bB9C30f76E30c160eD06FB', tokenABI, signer);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
      const tokenTransfer = await tokenContract.transfer(contract.address, ethers.utils.parseUnits('1', 'ether'));
      await tokenTransfer.wait();
  
      return tokenTransfer;

    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error('Metamask is not installed or not connected')
    return false
  }
}

export default depositLinkToken;