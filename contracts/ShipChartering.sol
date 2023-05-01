// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ShipTimeCharteringGeneric is Initializable {
    address payable public shipOwner;
    address payable public charterer;
    address payable public arbiter_1;
    address payable public arbiter_2;
    address payable public arbiter_3;
    address payable public chainteringService;
    uint32 public charterDolarDailyRate;
    uint256 public startDateTime;
    uint256 public endDateTime;
    bool public isChartered;
    uint32 public vesselIMOnumber; 
    uint32 public vesselMMSInumber; 
    uint256 public monthlyPayday;
    uint8 public averageCruisingSpeed;
    uint8 public averageOilConsumptionTonsPerHour;
    mapping(uint256 day => uint16 oilTonsQuantity) public oilSupply;
    mapping(uint256 day => VesselData vesselReport) public vesselDailyReport;
    struct Location {
        int32 latitude; // degrees * 10^7
        int32 longitude; // degrees * 10^7
    }
    enum OperationStatus {
        StandBy,
        atOperation,
        underWay,
        waintingOrders,
        offHire,
        suppling    
    }
    struct VesselData {
        OperationStatus operationStatus;
        Location veeselPosition;
    }
    enum NavStatus {
        UnderwayUsingEngine,
        AtAnchor,
        NotUnderCommand,
        RestrictedManeuverability,
        ConstrainedByDraught,
        Moored,
        Aground,
        EngagedInFishing,
        UnderwaySailing,
        AIS_SART,
        Reserved1,
        Reserved2,
        Reserved3,
        Reserved4,
        Undefined
    }

    
    event CharterAgreed(address indexed shipOwner, address indexed charterer, uint256 price, uint256 start, uint256 end);
    event CharterCancelled(address indexed shipOwner, address indexed charterer);
    
    constructor(
        address payable _shipOwner,
        address payable _charterer,
        address payable _arbiter_1,
        address payable _arbiter_2,
        address payable _arbiter_3,
        address payable _chainteringService,
        uint32 _charterDolarDailyRate, 
        uint32 _vesselIMOnumber,
        uint32 _vesselMMSInumber,
        uint256 _monthlyPayday,
        uint8 _averageCruisingSpeed,
        uint8 _averageOilConsumptionTonsPerHour,
        uint256 _startDateTime, 
        uint256 _endDateTime) {
        shipOwner = _shipOwner;
        charterer = _charterer;
        arbiter_1 = _arbiter_1;
        arbiter_2 = _arbiter_2;
        arbiter_3 = _arbiter_3;
        chainteringService = _chainteringService;
        charterDolarDailyRate = _charterDolarDailyRate;
        vesselIMOnumber = _vesselIMOnumber;
        vesselMMSInumber = _vesselMMSInumber;
        monthlyPayday = _monthlyPayday;
        averageCruisingSpeed = _averageCruisingSpeed;
        averageOilConsumptionTonsPerHour = _averageOilConsumptionTonsPerHour;
        startDateTime = _startDateTime;
        endDateTime = _endDateTime;       
    }
    
    function agreeCharter() public payable {
        require(msg.sender != shipOwner, "Ship owner cannot charter their own ship");
        require(msg.value == charterDolarDailyRate, "Charter price must be paid in full");
        require(block.timestamp < startDateTime, "Charter cannot start in the past");
        require(!isChartered, "Ship is already chartered");
        
        charterer = payable(msg.sender);
        isChartered = true;
        
        emit CharterAgreed(shipOwner, charterer, charterDolarDailyRate, startDateTime, endDateTime);
    }
    
    function cancelCharter() public {
        require(msg.sender == charterer, "Only the charterer can cancel the charter");
        require(block.timestamp < startDateTime, "Charter cannot be cancelled after it has started");
        
        isChartered = false;
        charterer.transfer(charterDolarDailyRate);
        
        emit CharterCancelled(shipOwner, charterer);
    }
    
    function withdrawFunds() public {
        require(msg.sender == shipOwner, "Only the ship owner can withdraw funds");
        require(block.timestamp > endDateTime, "Charter must be completed before funds can be withdrawn");
        
        shipOwner.transfer(address(this).balance);
    }
}
