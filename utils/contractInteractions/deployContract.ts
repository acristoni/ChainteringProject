import { ethers } from 'ethers';

async function deployContract(
    contractBytecode: string, 
    contractAbi: any, 
    constructorArguments?: any[]): Promise<string> {
    const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = ethereumProvider.getSigner();
    const contractFactory = new ethers.ContractFactory(contractAbi, contractBytecode, signer);

    try {
        if (constructorArguments) {
            const contract = await contractFactory.deploy(...constructorArguments);
            await contract.deployed();
    
            console.log('Contract deployed at address:', contract.address);
            return contract.address;
        } else {
            const contract = await contractFactory.deploy();
            await contract.deployed();
    
            console.log('Contract deployed at address:', contract.address);
            return contract.address;
        }
    } catch (error) {
        console.error('Error deploying contract:', error);
        throw error;
    }
}

export default deployContract;