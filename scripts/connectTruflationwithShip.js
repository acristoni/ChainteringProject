async function main() {
    const Contract = await ethers.getContractFactory("Truflation");
    const contract = await Contract.attach("0x99C38930C0A425FfD64fEc1b3D8515148800CbD3");
  
    const tx = await contract.conectToShipChartering("0x81BB05A286b77007Aa5350c6FC1A5F0366ddd086");
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});