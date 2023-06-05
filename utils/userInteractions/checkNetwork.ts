import { ethers } from 'ethers';

async function checkNetwork(): Promise<boolean> {
  if (typeof window.ethereum === 'undefined') {
    alert("MetaMask is not installed or not available.")
    throw new Error('MetaMask is not installed or not available.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.name === 'maticmum') {
    return true;
  } else {
    alert('The wallet is not connected to the Mumbai Testnet network of Polygon. You need to be connected to this network to proceed with the wallet connection.');
    return false;
  }
}

export default checkNetwork;
