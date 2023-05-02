const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShipTimeCharteringGeneric", () => {
  let shipTimeChartering;
  let shipOwner;
  let charterer;
  let arbiter_1;
  let arbiter_2;
  let arbiter_3;
  let chainteringService;

  beforeEach(async () => {
    // Deploy the contract before each test
    [shipOwner, charterer, arbiter_1, arbiter_2, arbiter_3, chainteringService] = await ethers.getSigners();
    const ShipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    shipTimeChartering = await ShipTimeChartering.deploy(
      shipOwner.address,
      charterer.address,
      arbiter_1.address,
      arbiter_2.address,
      arbiter_3.address,
      chainteringService.address   
    );
    await shipTimeChartering.deployed();

    //function call after deploy to finish the contract variable set up, due the 'Stack too deep' it can't be done in constructor.
    await shipTimeChartering.setUpContract(
      5, // monthlyPayday
      30000, // charterPerHour
      75, // chainteringServicePayPerHour
      12, // averageCruisingSpeed
      9751779, // vesselIMOnumber
      10, // averageOilConsumptionTonsPerHour
      10000, // earlyCancellationPenaltyPerHour
    );
  });

  describe("Deploy new Contract", async() => {
    it("should deploy and set variables on constructor correctly", async () => {
      // Check that variables were set correctly during deployment
      const parties = await shipTimeChartering.parties();
      const shipOwnerFromGetter = parties[0];
      const chartererFromGetter = parties[1];
      const arbiter_1FromGetter = parties[2];
      const arbiter_2FromGetter = parties[3];
      const arbiter_3FromGetter = parties[4];
      const chainteringServiceFromGetter = parties[5];
  
      expect(shipOwnerFromGetter).to.equal(shipOwner.address);
      expect(chartererFromGetter).to.equal(charterer.address);
      expect(arbiter_1FromGetter).to.equal(arbiter_1.address);
      expect(arbiter_2FromGetter).to.equal(arbiter_2.address);
      expect(arbiter_3FromGetter).to.equal(arbiter_3.address);
      expect(chainteringServiceFromGetter).to.equal(chainteringService.address);
    });
  
    it("should set contract variables on setUp function correctly", async () => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const monthlyPayday = parseInt(contractTimes[2]);
  
      const contractValues = await shipTimeChartering.contractValues();
      const charterPerHour = contractValues[0];
      const chainteringServicePayPerHour = contractValues[1];
      const earlyCancellationPenaltyPerHour = parseInt(contractValues[2]);
  
      const vesselData = await shipTimeChartering.vesselData();
      const vesselIMOnumber = vesselData[0];
      const averageCruisingSpeed = vesselData[1];
      const averageOilConsumptionTonsPerHour = vesselData[2];
  
      expect(monthlyPayday).to.equal(5);
      expect(charterPerHour).to.equal(30000);
      expect(chainteringServicePayPerHour).to.equal(75);
      expect(earlyCancellationPenaltyPerHour).to.equal(10000);
      expect(vesselIMOnumber).to.equal(9751779);
      expect(averageCruisingSpeed).to.equal(12);
      expect(averageOilConsumptionTonsPerHour).to.equal(10);
    });
  })

  describe("Start ship chartering", async() => {
    it("should start the charter ship", async function () {
      // Start the charter
      await shipTimeChartering.connect(charterer).startCharter(3);
  
      // Check the start date time and end date time
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const endDateTime = parseInt(contractTimes[1]);
      expect(endDateTime).to.equal(startDateTime + 3 * 30 * 24 * 60 * 60); // 3 months in seconds
  
      // Check the emitted event
      const filter = shipTimeChartering.filters.CharterStarted();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.shipOwner).to.equal(shipOwner.address);
      expect(events[0].args.charterer).to.equal(charterer.address);
      expect(events[0].args.price).to.equal(30000);
      expect(events[0].args.start).to.equal(startDateTime);
      expect(events[0].args.end).to.equal(endDateTime);
    });

    it("shouldn't start if other than carterer party try to start contract", async() => {
      await expect(
        shipTimeChartering.connect(shipOwner).startCharter(3)
      ).to.be.revertedWith("Only charterer can start the charter ship");
    })
  })

});