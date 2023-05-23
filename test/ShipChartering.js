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
  let newChainteringOwner;
  let truflationContract;
  let maticPriceContract;
  let truflationAddress;
  let priceMaticAddress;

  beforeEach(async () => {
    //Deploy mock Truflation contract, (a contract where it's using ChainLink and Truflation to get real world data)
    const Truflation = await ethers.getContractFactory("MockTruflation");
    truflationContract = await Truflation.deploy();
    const deployedTruflation = await truflationContract.deployed();
    truflationAddress = deployedTruflation.address;

    // Deploy contract to get price matic usd contract from Chainlink oracle
    const PriceMaticUSD = await ethers.getContractFactory("MockPriceMaticUSD");
    maticPriceContract = await PriceMaticUSD.deploy();
    const deployedPriceMatic = await maticPriceContract.deployed();
    priceMaticAddress = deployedPriceMatic.address;

    // Deploy the contract before each test
    [shipOwner, charterer, arbiter_1, arbiter_2, arbiter_3, chainteringService, newChainteringOwner] = await ethers.getSigners();  

    const ShipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    shipTimeChartering = await ShipTimeChartering.deploy(
      shipOwner.address,
      charterer.address,
      arbiter_1.address,
      arbiter_2.address,
      arbiter_3.address,
      chainteringService.address,
      truflationAddress,
      priceMaticAddress
    );
    await shipTimeChartering.deployed();
    const shipTimeCharteringAddress = shipTimeChartering.address;

    //function call after deploy to finish the contract variable set up, due the 'Stack too deep' it can't be done in constructor.
    await shipTimeChartering.setUpContract(
      1000, // charterPerHour
      3, // chainteringServicePayPerHour
      12, // minimumCruisingSpeed
      9751779, // vesselIMOnumber
      20, // penaltyPerHour
      5, // consuptionstandBy
      25, // consuptionAtOperation
      20, // consuptionUnderWay
    );
    
    await truflationContract.conectToShipChartering(shipTimeCharteringAddress);
    await maticPriceContract.conectToShipChartering(shipTimeCharteringAddress);

    //Start 3 month contract
    await shipTimeChartering.connect(charterer).startCharter(3);
  });

  describe("Deploy new Contract", async() => {
    it("Should deploy and set variables on constructor correctly", async () => {
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
  
    it("Should set contract variables on setUp function correctly", async () => {  
      const contractValues = await shipTimeChartering.contractValues();
      const charterPerHour = contractValues[0];
      const chainteringServicePayPerHour = contractValues[1];
      const earlyCancellationPenaltyPerHour = parseInt(contractValues[2]);
  
      const vesselData = await shipTimeChartering.vesselData();
      const vesselIMOnumber = vesselData[0];
      const minimumCruisingSpeed = vesselData[1];
  
      expect(charterPerHour.price).to.equal(1000);
      expect(chainteringServicePayPerHour).to.equal(3);
      expect(earlyCancellationPenaltyPerHour).to.equal(20);
      expect(vesselIMOnumber).to.equal(9751779);
      expect(minimumCruisingSpeed).to.equal(12);
    });

    it("Should oil consuption by ship operation set up", async () => {
      const oilConsuptionStandBy = await shipTimeChartering.contractConsuptionByOperationalType(0);
      const oilConsuptionAtOperation = await shipTimeChartering.contractConsuptionByOperationalType(1);
      const oilConsuptionUnderWay = await shipTimeChartering.contractConsuptionByOperationalType(2);
      const oilConsuptionWaitingOrders = await shipTimeChartering.contractConsuptionByOperationalType(3);
      const oilConsuptionOffHire = await shipTimeChartering.contractConsuptionByOperationalType(4);
      const oilConsuptionAtAnchor = await shipTimeChartering.contractConsuptionByOperationalType(5);
      const oilConsuptionSuppling = await shipTimeChartering.contractConsuptionByOperationalType(6);
      
      expect(oilConsuptionStandBy).to.equal(5);
      expect(oilConsuptionAtOperation).to.equal(25);
      expect(oilConsuptionUnderWay).to.equal(20);
      expect(oilConsuptionWaitingOrders).to.equal(5);
      expect(oilConsuptionOffHire).to.equal(0);
      expect(oilConsuptionAtAnchor).to.equal(5);
      expect(oilConsuptionSuppling).to.equal(5);
    })
  })

  describe("Start ship chartering", async() => {
    it("Should start the charter ship", async () => {  
      // Check the start date time and end date time
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const endDateTime = parseInt(contractTimes[1]);
      expect(endDateTime).to.equal(startDateTime + 3 * 30 * 24 * 60 * 60); // 3 months in seconds
      
      const vesselDataBeforeReport = await shipTimeChartering.vesselData()
      const totalOilConsuption = vesselDataBeforeReport[2]
      expect(totalOilConsuption).to.equal(0);
  
      // Check the emitted event
      const filter = shipTimeChartering.filters.CharterStarted();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.shipOwner).to.equal(shipOwner.address);
      expect(events[0].args.charterer).to.equal(charterer.address);
      expect(events[0].args.price).to.equal(1000);
      expect(events[0].args.start).to.equal(startDateTime);
      expect(events[0].args.end).to.equal(endDateTime);
    });

    it("Shouldn't start if other than carterer part try to start contract", async() => {
      await expect(
        shipTimeChartering.connect(shipOwner).startCharter(3)
      ).to.be.revertedWith("Only charterer can start the charter ship");
    })

    it("Shouldn't start if contract isn't set up", async() => {
      const ShipTimeCharteringWithoutSetUp = await ethers.getContractFactory("ShipTimeCharteringGeneric");
      const shipTimeCharteringWithoutSetUp = await ShipTimeCharteringWithoutSetUp.deploy(
        shipOwner.address,
        charterer.address,
        arbiter_1.address,
        arbiter_2.address,
        arbiter_3.address,
        chainteringService.address,
        truflationAddress,
        priceMaticAddress
      );
      await shipTimeCharteringWithoutSetUp.deployed(); 

      await expect(
        shipTimeCharteringWithoutSetUp.connect(charterer).startCharter(3)
      ).to.be.revertedWith("Contract must be set up, before start");
    })
  })

  describe("Close contract", async() => {
    it("Should close contract by charter, in the end of charter time and without open dispute", async function () {
      const contractTimes = await shipTimeChartering.contractTimes();
      const endDateTime = parseInt(contractTimes[1]);
      await ethers.provider.send("evm_mine", [endDateTime]);
      
      await shipTimeChartering.connect(charterer).closeCharter()

      // Check the emitted event
      const filter = shipTimeChartering.filters.CharterClosed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.shipOwner).to.equal(shipOwner.address);
      expect(events[0].args.charterer).to.equal(charterer.address);
    });

    it("Should not allow a non-charterer to close the charter", async () => {
      await expect(
        shipTimeChartering.connect(shipOwner).closeCharter()
      ).to.be.revertedWith("Only the charterer can close the charter");
    });

    it("Should calculate early cancellation penalty", async() => {
      const returnCalculation = await shipTimeChartering.earlyCancellationPenalty();
      const charterTime = 90 * 24 //3 month in hours
      const earlyCancellationPenaltyPerHour = 20 // setUpContract function parameter

      expect(parseInt(returnCalculation)).to.equal(charterTime * earlyCancellationPenaltyPerHour);
    })

    it("Should calculate early cancellation penalty return zero, if charter period finish", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const endDateTime = parseInt(contractTimes[1]);
      await ethers.provider.send("evm_mine", [endDateTime]);

      const returnCalculation = await shipTimeChartering.earlyCancellationPenalty();

      expect(parseInt(returnCalculation)).to.equal(0);
    })

    it("Should not allow to close if charterer not pay early cancellation penalty", async () => {
      await expect(
        shipTimeChartering.connect(charterer).closeCharter()
      ).to.be.revertedWith("Deposit early cancellation penalty");
    });

    it("Should close if charterer pay early cancellation penalty", async () => {
      const returnCalculation = await shipTimeChartering.earlyCancellationPenalty();
      const depositValue = parseInt(returnCalculation);

      await shipTimeChartering
              .connect(charterer)
              .closeCharter({ value: depositValue })
      
      // Check the emitted event
      const filter = shipTimeChartering.filters.CharterClosed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.shipOwner).to.equal(shipOwner.address);
      expect(events[0].args.charterer).to.equal(charterer.address);
    });
  
    it("Should not allow to close the charter if it has not started yet", async function () {
      [shipOwner, charterer, arbiter_1, arbiter_2, arbiter_3, chainteringService] = await ethers.getSigners();
      const shipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
      const contractDeployWithoutStart = await shipTimeChartering.deploy(
        shipOwner.address,
        charterer.address,
        arbiter_1.address,
        arbiter_2.address,
        arbiter_3.address,
        chainteringService.address,   
        truflationAddress,
        priceMaticAddress
      );
      await contractDeployWithoutStart.deployed();
      await expect(
        contractDeployWithoutStart.connect(charterer).closeCharter()
      ).to.be.revertedWith("Charter cannot be closed if it not started");
    });

    it("Should revert if charterer try to close contract with open disputes", async() => {      
      const contractTimes = await shipTimeChartering.contractTimes();

      const startTime = parseInt(contractTimes[0]);
      const endTime = startTime + (10 * 3600); //10 hours voyage

      await shipTimeChartering.createDispute(
        startTime,
        endTime,
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      const endDateTime = parseInt(contractTimes[1]);
      await ethers.provider.send("evm_mine", [endDateTime]);
      
      await expect(
        shipTimeChartering
          .connect(charterer)
          .closeCharter()
      ).to.be.revertedWith("Charter cannot be closed if there's some dispute opened") 
    })
  })

  describe("Disputes", async() => {
    it("Should dispute be open by charterer or ship owner, informing period, reason and value", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);
      const endTime = startTime + (10 * 3600); //10 hours voyage

      await shipTimeChartering.createDispute(
        startTime,
        endTime,
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute()

      expect(isSomeOpenDispute).to.equal(true);
    })

    it("Should inform if there is no open dispute", async() => {
      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute();
      expect(isSomeOpenDispute).to.equal(false);
    })

    it("Should be able to create as disputes as need", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //second open dispute
      await shipTimeChartering.createDispute(
        startTime + (2 * 3600), //2 hours after contract start
        startTime + (4 * 3600), //2 hours voyage
        "Is bad weather, despiting oracle data", //reason
        2000, //value
        0 // ship owner open this dispute
      );

      //third open dispute
      await shipTimeChartering.createDispute(
        startTime + (4 * 3600), //2 hours after contract start
        startTime + (12 * 3600), //8 hours voyage
        "Not off hire, crew member sick", //reason
        8000, //value
        0 // ship owner open this dispute
      );

      const totalDisputes = await shipTimeChartering.totalDisputes();

      expect(totalDisputes).to.equal(3);
    })

    it("Should only contract arbiter can judge", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      await expect(
        shipTimeChartering
          .connect(charterer)
          .judgeDispute(
            1, //dispute id
            true //is reasonable
          )
      ).to.be.revertedWith("Only contract arbiters can judge");
    })

    it("Should emit ArbiterVote event", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //judge dispute
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      // Check the emitted event
      const filter = shipTimeChartering.filters.ArbiterVote();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.disputeId).to.equal(1);
      expect(events[0].args.isReasonable).to.equal(true);
      expect(events[0].args.arbiter).to.equal(arbiter_1.address);
    })

    it("It should revert if arbiter already voted", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //judge dispute
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      await expect(
        shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )
        ).to.be.revertedWith("Arbiter already voted")
    })
    
    it("Should be closed after all three arbiters judge", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

       //third vote
       await shipTimeChartering
              .connect(arbiter_3)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute();
      expect(isSomeOpenDispute).to.equal(false);
    })
    
    it("Should emit ResJudicata event, for close dispute", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //third vote
      await shipTimeChartering
            .connect(arbiter_3)
            .judgeDispute(
              1, //dispute id
              true //is reasonable
            )
      
      // Check the emitted event
      const filter = shipTimeChartering.filters.ResJudicata();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.disputeId).to.equal(1);
      expect(events[0].args.winningPart).to.equal(1);
    })

    it("Should increase dispute value on amount due, if ship owner wins", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not off hire, crew member sick", //reason
        10000, //value
        0 // ship owner open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //third vote
      await shipTimeChartering
            .connect(arbiter_3)
            .judgeDispute(
              1, //dispute id
              true //is reasonable
            )
      
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      expect(amountDueAfter - amountDueBefore).to.equal(10000)
    })

    it("Should decrease dispute value on amount due, if charterer wins", async() => {
      await shipTimeChartering.addDueAmount(10000);
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      
      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        2000, //value
        1 // charterer open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //third vote
      await shipTimeChartering
            .connect(arbiter_3)
            .judgeDispute(
              1, //dispute id
              true //is reasonable
            )
      
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      expect(amountDueAfter).to.equal(8000)
    })

    it("Should close a dispute open by ship owner and it's not reasonable", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Crew member sick, not off hire", //reason
        10000, //value
        0 // ship owner open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                false //is not reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                false //is not reasonable
              )

       //third vote
       await shipTimeChartering
              .connect(arbiter_3)
              .judgeDispute(
                1, //dispute id
                false //is not reasonable
              )

      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute();
      expect(isSomeOpenDispute).to.equal(false);
    })

    it("Should close a dispute open by charterer and it's not reasonable", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "It's not bad weather", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                false //is not reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                false //is not reasonable
              )

       //third vote
       await shipTimeChartering
              .connect(arbiter_3)
              .judgeDispute(
                1, //dispute id
                false //is not reasonable
              )

      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute();
      expect(isSomeOpenDispute).to.equal(false);
    })
  })

  describe("Report vessel operations by ship owner", async() => {
    it("Should save date departure, date arrival, position departure, position arrive, oil consuption and operational status", async() => {
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');

      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );
      
      const reportDataSaved = await shipTimeChartering.getOperationReport(dateDeparture);
        expect(reportDataSaved.startDate).to.equal(dateDeparture);
        expect(reportDataSaved.endDate).to.equal(dateArrival);
        expect(reportDataSaved.latitudeDeparture).to.equal(ethers.utils.parseUnits(String(latitudeDeparture), 18));
        expect(reportDataSaved.longitudeDerparture).to.equal(ethers.utils.parseUnits(String(longitudeDerparture), 18));
        expect(reportDataSaved.latitudeArrival).to.equal(ethers.utils.parseUnits(String(latitudeArrival), 18));
        expect(reportDataSaved.longitudeArrival).to.equal(ethers.utils.parseUnits(String(longitudeArrival), 18));
        expect(reportDataSaved.isBadWeatherDuringOps).to.equal(false);
        expect(reportDataSaved.opsOilConsuption).to.equal(4000);
        expect(reportDataSaved.operationStatus).to.equal(2);
    })

    it("Should emit Operation Report event", async() => {
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );

      // Check the emitted event
      const filter = shipTimeChartering.filters.ReportOperation();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.dateDeparture).to.equal(dateDeparture);
      expect(events[0].args.operationCode).to.equal(2);
    })

    it("Should sum oil consuption during operation to total oil consuption in contract storage", async() => {
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles
      
      const vesselDataBeforeReport = await shipTimeChartering.vesselData()
      const totalOilConsuptionBeforeReport = vesselDataBeforeReport[2]

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );

      const vesselDataAfterReport = await shipTimeChartering.vesselData()
      const totalOilConsuptionAfterReport = vesselDataAfterReport[2]

      expect(totalOilConsuptionAfterReport - totalOilConsuptionBeforeReport).to.equal(4000)
    })

    it("Should calculate avarage speed", async() => {
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');

      const avarageSpeed = await shipTimeChartering.avarageSpeed(
        210 // operation time duration in hours
      );

      expect(avarageSpeed).to.equal(12)
    })

    it("Should reverted calculate avarage speed, if not request Haversine distance before", async() => {
      await expect(
        shipTimeChartering
          .avarageSpeed(210)
        ).to.be.revertedWith("Should calculate a distance first, call requestHaversineDistance()");
    })

    it("Should emit a BelowContractualSpeed event if contract minimum speed was NOT reached", async() => {
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (300 * 3600); //300 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );
      
      // Check the emitted event
      const filter = shipTimeChartering.filters.BelowContractualSpeed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.avarageSpeed).to.equal(8);
      expect(events[0].args.minimumCruisingSpeed).to.equal(12);
    })

    it("Should check if contract minimum speed was reached, only if vessel was under way", async() => {
      await shipTimeChartering.requestHaversineDistance('18', '18', '18', '18');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (10 * 3600); //10 hours - AVARAGE SPEED 0 "stand by"
      const latitude = -23.90320425631785;
      const longitude = -46.07624389163475; //same for start end end operation

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitude), 18),
          ethers.utils.parseUnits(String(longitude), 18),
          ethers.utils.parseUnits(String(latitude), 18),
          ethers.utils.parseUnits(String(longitude), 18),
          50, // oil consuption per operation, 
          0 // operation code for stand by
        );

      // Check the emitted event
      const filter = shipTimeChartering.filters.BelowContractualSpeed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(0);
    })

    it("Should be able to report bad weather conditions, by ShipOwner", async() => {
      await shipTimeChartering.connect(shipOwner).informBadWeather('10','10');

      const vesselData = await shipTimeChartering.vesselData();
      const isInBadWeatherConditionsShipOwnerInfo = vesselData.isInBadWeatherConditionsShipOwnerInfo;

      expect(isInBadWeatherConditionsShipOwnerInfo).to.equal(true);

      // Check the emitted event
      const filter = shipTimeChartering.filters.BadWeather();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.latitude).to.equal('10');
      expect(events[0].args.longitude).to.equal('10');
    })


    it("Should revert if other party, than ship owner, try to inform bad weather condition", async() => {
      await expect(
        shipTimeChartering
          .connect(charterer)
          .informBadWeather('10','10')
        ).to.be.revertedWith("Only ship owner can inform vessel under bad weather conditions");
    })

    it("Should check broadcast data if ship owner report bad weather condition", async() => {
      await shipTimeChartering.connect(shipOwner).informBadWeather('10','10');

      const vesselData = await shipTimeChartering.vesselData();
      const isInBadWeatherConditionsOracleInfo = vesselData.isInBadWeatherConditionsOracleInfo;

      const oracleData = await shipTimeChartering.oracleData();
      const lastWindSpeed = oracleData.lastWindSpeed;

      expect(isInBadWeatherConditionsOracleInfo).to.equal(false);
      expect(lastWindSpeed).to.equal(60);
    })

    it("Should open a dispute if ship owner report bad weather and broadcast contest", async() => {
      await shipTimeChartering.connect(shipOwner).informBadWeather('10','10');

      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (300 * 3600); //300 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );

      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute()
      expect(isSomeOpenDispute).to.equal(true);
    })

    it("Should allow avarage speed less than contract minimum speed, if bad weather", async() => {
      //Deploy mock Truflation contract, (a contract where it's using ChainLink and Truflation to get real world data)
      const Truflation = await ethers.getContractFactory("MockTruflationBadWeather");
      const truflationContract = await Truflation.deploy();
      const deployedTruflation = await truflationContract.deployed();
      const truflationAddress = deployedTruflation.address;

      const ShipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
      const shipTimeCharteringBadWeather = await ShipTimeChartering.deploy(
        shipOwner.address,
        charterer.address,
        arbiter_1.address,
        arbiter_2.address,
        arbiter_3.address,
        chainteringService.address,
        truflationAddress,
        priceMaticAddress
      );
      await shipTimeCharteringBadWeather.deployed();
      const shipTimeCharteringAddress = shipTimeCharteringBadWeather.address;

      //function call after deploy to finish the contract variable set up, due the 'Stack too deep' it can't be done in constructor.
      await shipTimeCharteringBadWeather.setUpContract(
        1000, // charterPerHour
        75, // chainteringServicePayPerHour
        12, // minimumCruisingSpeed
        9751779, // vesselIMOnumber
        20, // penaltyPerHour
        5, // consuptionstandBy
        25, // consuptionAtOperation
        20, // consuptionUnderWay
      );
    
      await truflationContract.conectToShipChartering(shipTimeCharteringAddress);
      await maticPriceContract.conectToShipChartering(shipTimeCharteringAddress);

      //Start 3 month contract
      await shipTimeCharteringBadWeather.connect(charterer).startCharter(3);

      const amountDueBefore = await shipTimeCharteringBadWeather.checkMonthlyAmountDue(0);

      await shipTimeCharteringBadWeather.connect(shipOwner).informBadWeather('10','10');

      await shipTimeCharteringBadWeather.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeCharteringBadWeather.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (300 * 3600); //300 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeCharteringBadWeather
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );

        const amountDueAfter = await shipTimeCharteringBadWeather.checkMonthlyAmountDue(0);
        expect(amountDueAfter - amountDueBefore).to.equal(300000);
    })

    it("Should allow oil consuption superior, if bad weather", async() => {
      //Deploy mock Truflation contract, (a contract where it's using ChainLink and Truflation to get real world data)
      const Truflation = await ethers.getContractFactory("MockTruflationBadWeather");
      const truflationContract = await Truflation.deploy();
      const deployedTruflation = await truflationContract.deployed();
      const truflationAddress = deployedTruflation.address;

      const ShipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
      const shipTimeCharteringBadWeather = await ShipTimeChartering.deploy(
        shipOwner.address,
        charterer.address,
        arbiter_1.address,
        arbiter_2.address,
        arbiter_3.address,
        chainteringService.address,
        truflationAddress,
        priceMaticAddress
      );
      await shipTimeCharteringBadWeather.deployed();
      const shipTimeCharteringAddress = shipTimeCharteringBadWeather.address;

      //function call after deploy to finish the contract variable set up, due the 'Stack too deep' it can't be done in constructor.
      await shipTimeCharteringBadWeather.setUpContract(
        1000, // charterPerHour
        75, // chainteringServicePayPerHour
        12, // minimumCruisingSpeed
        9751779, // vesselIMOnumber
        20, // penaltyPerHour
        5, // consuptionstandBy
        25, // consuptionAtOperation
        20, // consuptionUnderWay
      );
    
      await truflationContract.conectToShipChartering(shipTimeCharteringAddress);
      await maticPriceContract.conectToShipChartering(shipTimeCharteringAddress);

      //Start 3 month contract
      await shipTimeCharteringBadWeather.connect(charterer).startCharter(3);

      const amountDueBefore = await shipTimeCharteringBadWeather.checkMonthlyAmountDue(0);

      await shipTimeCharteringBadWeather.connect(shipOwner).informBadWeather('10','10');

      await shipTimeCharteringBadWeather.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeCharteringBadWeather.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeCharteringBadWeather
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          5000, // oil consuption per operation, 
          2 // operation code for under way
        );
      
        const amountDueAfter = await shipTimeCharteringBadWeather.checkMonthlyAmountDue(0);
        expect(amountDueAfter - amountDueBefore).to.equal(210000);
    })

    it("Should calculate penalty, if speed not reached", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (300 * 3600); //300 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );

        const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
        expect(amountDueAfter - amountDueBefore).to.equal(306000);
    })

    it("Should calculate penalty, if oil consuption above agreement", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          5000, // oil consuption per operation, 
          2 // operation code for under way
        );

        const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
        expect(amountDueAfter - amountDueBefore).to.equal(214200);
    })

    it("Should emit event consumption above agreed", async() => {
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          5000, // oil consuption per operation, 
          2 // operation code for under way
        );

      // Check the emitted event
      const filter = shipTimeChartering.filters.ConsumptionAboveAgreed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.consuptionAgreed).to.equal(20);
      expect(events[0].args.consuptionReported).to.equal(23);
    })

    it("Should add amount due ship owner for operation time", async() => {
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');

      const contractTimes = await shipTimeChartering.contractTimes();

      //write new ship operation report
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles
      
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          4000, // oil consuption per operation, 
          2 // operation code for under way
        );

      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);

      expect(amountDueAfter - amountDueBefore).to.equal(210000);
    })

    it("Should revert add amount due ship owner for operation time, if didn't request crude oil price before", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const firstMonthTime = parseInt(contractTimes[0]) + 45 * 24 * 60 * 60 ;
      await ethers.provider.send("evm_mine", [firstMonthTime]);
      
      //write new ship operation report
      const dateDeparture = firstMonthTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles
      
      await ethers.provider.send("evm_mine", [dateArrival]);
      await shipTimeChartering.requestHaversineDistance('10', '10', '-20', '-20');

      await expect(
        shipTimeChartering
          .connect(shipOwner)
          .newOperationReport(
            dateDeparture,
            dateArrival,
            ethers.utils.parseUnits(String(latitudeDeparture), 18),
            ethers.utils.parseUnits(String(longitudeDerparture), 18),
            ethers.utils.parseUnits(String(latitudeArrival), 18),
            ethers.utils.parseUnits(String(longitudeArrival), 18),
            4000, // oil consuption per operation, 
            2 // operation code for under way
          )
        ).to.be.revertedWith("Crude oil price must be updated, maximum 24 hours before payment, call requestCrudeOilPrice()");
    })

    it("Should revert if ship owner not calculate distance using requestHaversineDistance method", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const twoDaysAfterStart = parseInt(contractTimes[0]) + 2 * 24 * 60 * 60 * 1000 ;
      await ethers.provider.send("evm_mine", [twoDaysAfterStart]);

      //write new ship operation report
      const startDateTime = parseInt(twoDaysAfterStart);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (10 * 3600); //10 hours voyage
      const latitudeDeparture = -23.90320425631785;
      const longitudeDerparture = -46.07624389163475;
      const latitudeArrival = -25.248573511757215;
      const longitudeArrival = -44.76222770000078; //about 120 nautical miles

        await expect(
          shipTimeChartering
            .connect(shipOwner)
            .newOperationReport(
              dateDeparture,
              dateArrival,
              ethers.utils.parseUnits(String(latitudeDeparture), 18),
              ethers.utils.parseUnits(String(longitudeDerparture), 18),
              ethers.utils.parseUnits(String(latitudeArrival), 18),
              ethers.utils.parseUnits(String(longitudeArrival), 18),
              4000, // oil consuption per operation, 
              2 // operation code for under way
            )
          ).to.be.revertedWith("Distance must be calculated, maximum 15 minutes before report, call requestHaversineDistance()");
    })

    it("Should revert if other person, than ship owner try to send a operation report", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const twoDaysAfterStart = parseInt(contractTimes[0]) + 2 * 24 * 60 * 60 * 1000 ;
      await ethers.provider.send("evm_mine", [twoDaysAfterStart]);

      //write new ship operation report
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (210 * 3600); //210 hours voyage
      const latitudeDeparture = 10;
      const longitudeDerparture = 10;
      const latitudeArrival = -20;
      const longitudeArrival = -20; //about 2530 nautical miles

        await expect(
          shipTimeChartering
            .connect(charterer)
            .newOperationReport(
              dateDeparture,
              dateArrival,
              ethers.utils.parseUnits(String(latitudeDeparture), 18),
              ethers.utils.parseUnits(String(longitudeDerparture), 18),
              ethers.utils.parseUnits(String(latitudeArrival), 18),
              ethers.utils.parseUnits(String(longitudeArrival), 18),
              200, // oil consuption per operation, 
              2 // operation code for under way
            )
          ).to.be.revertedWith("Only ship owner can report vessel operation");
    })
  })
  
  describe("Payment charter", async() => {
    it("Should be able to check current contract month", async() => {
      const currentMonth = await shipTimeChartering.checkCurrentContractMonth()
      expect(currentMonth).to.equal(0)
    })

    it("Should be able to check current contract month, mocking anothers months", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const firstMonthTime = parseInt(contractTimes[0]) + 45 * 24 * 60 * 60 ;
      await ethers.provider.send("evm_mine", [firstMonthTime]);
      const firstMonth = await shipTimeChartering.checkCurrentContractMonth()

      expect(firstMonth).to.equal(1)

      const secondMonthTime = parseInt(contractTimes[0]) + 60 * 24 * 60 * 61 ;
      await ethers.provider.send("evm_mine", [secondMonthTime]);
      const secondMonth = await shipTimeChartering.checkCurrentContractMonth()

      expect(secondMonth).to.equal(2)
    })

    it("Should be able to add some amount due", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      await shipTimeChartering.addDueAmount(10000);
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      const amountDiference = amountDueAfter - amountDueBefore;
      expect(amountDiference).to.equal(10000);
    })

    it("Should be emit AddDueAmount event", async() => {
      await shipTimeChartering.addDueAmount(10000);

      // Check the emitted event
      const filter = shipTimeChartering.filters.AddDueAmount();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.amount).to.equal(10000);
      expect(events[0].args.currentContractMonth).to.equal(0);
    })

    it("Should be able to subtract some amount due", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      await shipTimeChartering.addDueAmount(10000);
      await shipTimeChartering.subtractDueAmount(1000);
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      const amountDiference = amountDueAfter - amountDueBefore;
      expect(amountDiference).to.equal(9000);
    })

    it("Should be emit SubtractDueAmount event", async() => {
      await shipTimeChartering.addDueAmount(10000);
      await shipTimeChartering.subtractDueAmount(2000);

      // Check the emitted event
      const filter = shipTimeChartering.filters.SubtractDueAmount();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.amount).to.equal(2000);
      expect(events[0].args.currentContractMonth).to.equal(0);
    })

    it("Should emit NotEnoughFounds event if amount due this month is less then value subtraction", async() => {
      await shipTimeChartering.subtractDueAmount(1000);

      // Check the emitted event
      const filter = shipTimeChartering.filters.NotEnoughFounds();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.value).to.equal(1000);
      expect(events[0].args.currentContractMonth).to.equal(0);
    })    

    it("Should totalAmountDueToPay function check current total amount due, with penalties", async() => {
      //Add 10000 amount due first month, in time, so without penalty
      await shipTimeChartering.addDueAmount(10000);
      
      const contractTimes = await shipTimeChartering.contractTimes();
      //Add 10000 amount due second month, delayed, so he'll pay US$ 200,00 penalty
      const firstMonthTime = parseInt(contractTimes[0]) + 30 * 24 * 60 * 61 * 1000 ;
      await ethers.provider.send("evm_mine", [firstMonthTime]);
      await shipTimeChartering.addDueAmount(10000);

      //Add 10000 amount due third month, delayed, so he'll pay US$ 200,00 penalty
      const secondMonthTime = parseInt(contractTimes[0]) + 60 * 24 * 60 * 61 * 1000 ;
      await ethers.provider.send("evm_mine", [secondMonthTime]);
      await shipTimeChartering.addDueAmount(10000);

      //Charterer didn't pay nothing until now, so he'll pay for delay penalties
      const totalAmount = await shipTimeChartering.totalAmountDueToPay()
      
      expect(totalAmount).to.equal(30400)
    })

    it("Should convert amount due value to Matic", async() => {
      //Add 10000 amount due first month, in time, so without penalty
      await shipTimeChartering.addDueAmount(10000);      
      await shipTimeChartering.requestLatestMaticPrice();
      const convertedAmountValue = await shipTimeChartering.convertAmountDueToMatic();
      expect(convertedAmountValue).to.equal(8799);
    })
    
    it("Should pay Ship Owner service when deposit amount", async() => {
      await shipTimeChartering.addDueAmount(10000);      
      await shipTimeChartering.requestLatestMaticPrice();
      
      const contractBalanceBefore = await ethers.provider.getBalance(shipOwner.address)
      
      await shipTimeChartering.connect(charterer).payAmountDue({ value: 8799 });
      
      const contractBalanceAfter = await ethers.provider.getBalance(shipOwner.address)

      const balanceDiference = BigInt(contractBalanceAfter) - BigInt(contractBalanceBefore)
      
      expect(balanceDiference).to.equal(8773);
    })

    it("Calculate value to chaintering service", async() => {
      const valueToChaintering = await shipTimeChartering.calculateValueToChainteringService(1000);
      expect(valueToChaintering).to.equal(3);
    })

    it("Should pay Chaintering service when deposit amount", async() => {
      await shipTimeChartering.addDueAmount(10000);      
      await shipTimeChartering.requestLatestMaticPrice();
      
      const contractBalanceBefore = await ethers.provider.getBalance(chainteringService.address)
      
      await shipTimeChartering.connect(charterer).payAmountDue({ value: 8799 });
      
      const contractBalanceAfter = await ethers.provider.getBalance(chainteringService.address)

      const balanceDiference = BigInt(contractBalanceAfter) - BigInt(contractBalanceBefore)
      
      expect(balanceDiference).to.equal(26);
    })

    it("Should emit Payment event when deposit amount", async() => {
      await shipTimeChartering.addDueAmount(10000);      
      await shipTimeChartering.requestLatestMaticPrice();

      await shipTimeChartering.connect(charterer).payAmountDue({ value: 8799 });

      const filter = shipTimeChartering.filters.Payment();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.valueToShipOwner).to.equal(8773);
      expect(events[0].args.valueToChaintering).to.equal(26);
    })

    it("Should revert payment, if message value is less than amount due", async() => {
      await shipTimeChartering.addDueAmount(10000);      
      await shipTimeChartering.requestLatestMaticPrice();

      await expect(
        shipTimeChartering
          .connect(charterer)
          .payAmountDue({ value: 8798 })
        ).to.be.revertedWith("Deposit amount due value");
      

    })
  })

  describe("Fuel supply", async() => {
    it("Should ship owner inform oil's quantity and date of supply", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      await shipTimeChartering.connect(shipOwner).oilSupplyReport(
        startDateTime, //date  of supply
        250 //quantity of oil supplied, in tons
      )

      const oilQuantityReported = await shipTimeChartering.consultOilSupplyReport(startDateTime)

      expect(oilQuantityReported).to.equal(250);
    })

    it("Should only ship owner can report fuel supply", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);

      await expect(
        shipTimeChartering
          .connect(charterer)
          .oilSupplyReport(
            startDateTime, //date  of supply
            250 //quantity of oil supplied, in tons
          )
      ).to.be.revertedWith("Only ship owner can report oil supply");
    })

    it("Should emit a fuel supply event", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      await shipTimeChartering.connect(shipOwner).oilSupplyReport(
        startDateTime, //date  of supply
        250 //quantity of oil supplied, in tons
      )

      const filter = shipTimeChartering.filters.SupplyReport();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.day).to.equal(startDateTime);
      expect(events[0].args.oilTonsQuantity).to.equal(250);
    })
  })

  describe("Change service owner", async () => {
    it("Should Chaintering service can be changed", async() => { 
      await shipTimeChartering
        .connect(chainteringService)
        .transferChainteringService(newChainteringOwner.address);

        const parties = await shipTimeChartering.parties();
        const chainteringServiceFromGetter = parties[5];

        expect(chainteringServiceFromGetter).to.equal(newChainteringOwner.address);
    })

    it("Should only actual owner change to new owner", async() => {
      await expect(
        shipTimeChartering
          .connect(newChainteringOwner)
          .transferChainteringService(newChainteringOwner.address)
      ).to.be.revertedWith("Only the current Chaintering owner can do this action");
    })
  })

  describe("Oracle service", async() => {
    it("Should get crude oil price", async() => {
      await shipTimeChartering.requestCrudeOilPrice()

      const oracleData = await shipTimeChartering.oracleData();

      const firstCrudeOilPrice = oracleData.firstCrudeOilPrice;
      const lastCrudeOilPrice = oracleData.lastCrudeOilPrice;

      expect(firstCrudeOilPrice).to.equal(75410000000000000000n);
      expect(lastCrudeOilPrice).to.equal(77410000000000000000n);
    })

    it("Should calculate crude oil inflaction between payments", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const oneMonth = parseInt(contractTimes[0]) + 30 * 24 * 60 * 60 * 1000 ;
      await ethers.provider.send("evm_mine", [oneMonth]);

      await shipTimeChartering.requestCrudeOilPrice()

      const oracleData = await shipTimeChartering.oracleData();

      const firstCrudeOilPrice = oracleData.firstCrudeOilPrice;
      const lastCrudeOilPrice = oracleData.lastCrudeOilPrice;

      expect(firstCrudeOilPrice).to.equal(75410000000000000000n);
      expect(lastCrudeOilPrice).to.equal(77410000000000000000n);

      const contractValues = await shipTimeChartering.contractValues();
      const charterPerHour = parseInt(contractValues.charterPerHour.price);

      expect(charterPerHour).to.equal(1025);
    })

    it("Should convert any value in Dolar to Matic", async() => {
      await shipTimeChartering.requestLatestMaticPrice();

      const valueConverted = await shipTimeChartering.convertDolarToMatic(1000);

      expect(valueConverted).to.equal(879);
    })

    it("Should revert, if try to convert value, without get the updated Matic price", async() => {
      await expect(
        shipTimeChartering.convertDolarToMatic(1000)
      ).to.be.revertedWith("Matic price must be requested, maximum 15 minutes before convert, call requestLatestMaticPrice()");
    })

    it("Should get wind speed by latitude and longitute", async() => {
      await shipTimeChartering.requestWindSpeed('10','10');

      const oracleData = await shipTimeChartering.oracleData();
      const lastWindSpeed = oracleData.lastWindSpeed;

      const vesselData = await shipTimeChartering.vesselData();
      const isInBadWeatherConditions = vesselData.isInBadWeatherConditionsOracleInfo;

      expect(lastWindSpeed).to.equal(60);
      expect(isInBadWeatherConditions).to.equal(false);
    })

    it("Should be bad weather condition if wind speed more than 20 nautical knots", async() => {
      //Deploy mock Truflation contract, (a contract where it's using ChainLink and Truflation to get real world data)
      const Truflation = await ethers.getContractFactory("MockTruflationBadWeather");
      const truflationContract = await Truflation.deploy();
      const deployedTruflation = await truflationContract.deployed();
      const truflationAddress = deployedTruflation.address;

      const ShipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
      const shipTimeCharteringBadWeather = await ShipTimeChartering.deploy(
        shipOwner.address,
        charterer.address,
        arbiter_1.address,
        arbiter_2.address,
        arbiter_3.address,
        chainteringService.address,
        truflationAddress,
        priceMaticAddress
      );
      await shipTimeCharteringBadWeather.deployed();
      const shipTimeCharteringAddress = shipTimeCharteringBadWeather.address;

      //function call after deploy to finish the contract variable set up, due the 'Stack too deep' it can't be done in constructor.
      await shipTimeCharteringBadWeather.setUpContract(
        1000, // charterPerHour
        75, // chainteringServicePayPerHour
        12, // minimumCruisingSpeed
        9751779, // vesselIMOnumber
        20, // penaltyPerHour
        5, // consuptionstandBy
        25, // consuptionAtOperation
        20, // consuptionUnderWay
      );
    
      await truflationContract.conectToShipChartering(shipTimeCharteringAddress);
      await maticPriceContract.conectToShipChartering(shipTimeCharteringAddress);

      //Start 3 month contract
      await shipTimeCharteringBadWeather.connect(charterer).startCharter(3);

      await shipTimeCharteringBadWeather.requestWindSpeed('10','10');

      const oracleData = await shipTimeCharteringBadWeather.oracleData();
      const lastWindSpeed = oracleData.lastWindSpeed;

      const vesselData = await shipTimeCharteringBadWeather.vesselData();
      const isInBadWeatherConditions = vesselData.isInBadWeatherConditionsOracleInfo;

      expect(lastWindSpeed).to.equal(220);
      expect(isInBadWeatherConditions).to.equal(true);
    })

    it("Should calculate distance, using Haversine formula, given two positions (latitude, longitude)", async() => {
      await shipTimeChartering.requestHaversineDistance('10','10', '-20', '-20');

      const oracleData = await shipTimeChartering.oracleData();
      const lastDistanceCalculation = oracleData.lastDistanceCalculation.value;

      expect(lastDistanceCalculation).to.equal(49670305761772860n);
    })
  })
});
