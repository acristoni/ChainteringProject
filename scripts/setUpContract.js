async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x81BB05A286b77007Aa5350c6FC1A5F0366ddd086");
  
    const tx = await contract.setUpContract(
        1000, // charterPerHour
        75, // chainteringServicePayPerHour
        12, // minimumCruisingSpeed
        9751779, // vesselIMOnumber
        1, // earlyCancellationPenaltyPerHour
        5, // consuptionstandBy
        25, // consuptionAtOperation
        20, // consuptionUnderWay
    );
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});