async function main() {
  // First, get the contract to deploy
  const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
  const contract = await Contract.deploy(
    '0xc1fAe37E0bDe6810Fc813fd16f38e760D841505b',// address payable _shipOwner,
    '0xCA86EFAC274BD968212f9822F1C728fE79994913',// address payable _charterer,
    '0xfCdAd14413cEEFb902C9F2e935b1A66f8B0157f0',// address payable _arbiter_1,
    '0x9321Cd247f2895Caf408D79c6938ff305C8d6421',// address payable _arbiter_2,
    '0xFd934b31164FEB646eDd7f2D6a839b4dD74dF0f7',// address payable _arbiter_3,
    '0x34Fa067B75A0d16aab9855E3cD360c95afaE3eC4', // address payable _chainteringService
    '0x86f2EE57305CD7322D3f117b99420e225cd1EE68', // Truflation contract address
    '0xA304A265005295Ce23a3B0Eb4FB99Ef8F51ff69E' // price matic from chainlink contract address
  );

  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});