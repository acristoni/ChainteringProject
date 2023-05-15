async function main() {
  // First, get the contract to deploy
  const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
  const contract = await Contract.deploy();

  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});