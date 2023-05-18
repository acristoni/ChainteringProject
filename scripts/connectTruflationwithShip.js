async function main() {
    const Contract = await ethers.getContractFactory("Truflation");
    const contract = await Contract.attach("0x86f2EE57305CD7322D3f117b99420e225cd1EE68");
  
    const tx = await contract.conectToShipChartering("0xecA1FBcDcD910c90DB462b315E968D26F7cAC8E4");
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});