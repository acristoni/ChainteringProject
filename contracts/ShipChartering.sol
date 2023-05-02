// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ShipTimeCharteringGeneric is Initializable {
    using SafeMath for uint256;

    Parties public parties;
    ContractTimes public contractTimes;
    VesselData public vesselData;
    ContractValues public contractValues;
    
    //chater data
    Dispute[] public allDisputes;

    // //ShipOwnerReport
    mapping(uint256 day => uint16 oilTonsQuantity) public oilSupply;
    mapping(uint256 day => VesselReport vesselReport) public vesselDailyReport;
    
    //contract types
    struct ContractValues {
        uint32 charterPerHour;
        uint8 chainteringServicePayPerHour;
        uint256 earlyCancellationPenaltyPerHour;
    }
    struct VesselData {
        uint32 vesselIMOnumber; 
        uint8 averageCruisingSpeed;
        uint8 averageOilConsumptionTonsPerHour;
    }
    struct Dispute {
        uint256 startTime;
        uint256 endTime;
        string reason;
        address[] arbitersVoted;
        mapping(address => bool) votes;
        bool isClose;
        uint32 value;
        Party partyOpenDispute;
    }
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
    enum Party {
        ShipOwner,
        Charterer
    }
    struct Parties {
        address payable shipOwner;
        address payable charterer;
        address payable arbiter_1;
        address payable arbiter_2;
        address payable arbiter_3;
        address payable chainteringService;
    }
    struct ContractTimes {
        uint256 startDateTime;
        uint256 endDateTime;
        uint256 monthlyPayday;
    }
    struct VesselReport {
        OperationStatus operationStatus;
        Location veeselPosition;
        uint16 dailyOilConsuption;
    }

    
    event CharterStarted(address indexed shipOwner, address indexed charterer, uint256 price, uint256 start, uint256 end);
    event CharterClosed(address indexed shipOwner, address indexed charterer);
    
    constructor(
        address payable _shipOwner,
        address payable _charterer,
        address payable _arbiter_1,
        address payable _arbiter_2,
        address payable _arbiter_3,
        address payable _chainteringService
    ) {
        parties.shipOwner = _shipOwner;
        parties.charterer = _charterer;
        parties.arbiter_1 = _arbiter_1;
        parties.arbiter_2 = _arbiter_2;
        parties.arbiter_3 = _arbiter_3;
        parties.chainteringService = _chainteringService;
    }

    function setUpContract(
        uint256 _monthlyPayday,
        uint32 _charterPerHour, 
        uint8 _chainteringServicePayPerHour,
        uint8 _averageCruisingSpeed,
        uint32 _vesselIMOnumber,
        uint8 _averageOilConsumptionTonsPerHour, 
        uint256 _earlyCancellationPenaltyPerHour
    ) external {
        contractTimes.monthlyPayday = _monthlyPayday;
        contractValues.charterPerHour = _charterPerHour;
        contractValues.chainteringServicePayPerHour = _chainteringServicePayPerHour;
        contractValues.earlyCancellationPenaltyPerHour = _earlyCancellationPenaltyPerHour;    
        vesselData.averageCruisingSpeed = _averageCruisingSpeed;
        vesselData.vesselIMOnumber = _vesselIMOnumber;
        vesselData.averageOilConsumptionTonsPerHour = _averageOilConsumptionTonsPerHour;
    }
    
    function startCharter(uint8 chartersTimeMonths) public payable {
        require(msg.sender == parties.charterer, "Only charterer can start the charter ship");
        contractTimes.startDateTime = block.timestamp;
        contractTimes.endDateTime = block.timestamp.add(chartersTimeMonths * 30 days);
        
        emit CharterStarted(parties.shipOwner, parties.charterer, contractValues.charterPerHour, contractTimes.startDateTime, contractTimes.endDateTime);
    }

    function earlyCancellationPenalty() public view returns ( uint _amountDueShipOwner ){
        if (block.timestamp < contractTimes.endDateTime) {
            uint256 diferenceBetweenDatesInHours = (contractTimes.endDateTime - block.timestamp) / 3600;
            uint256 amountDueShipOwner = contractValues.earlyCancellationPenaltyPerHour * diferenceBetweenDatesInHours;

            return amountDueShipOwner;
        } else {
            return 0;
        }
    }
    
    function closeCharter() payable public {
        require(msg.sender == parties.charterer, "Only the charterer can close the charter");
        require(contractTimes.startDateTime < block.timestamp, "Charter cannot be closed if it not started");

        bool isSomeOpenDispute;

        if (allDisputes.length > 0) {
            for(uint i = 0; i < allDisputes.length; i++) {
                if (allDisputes[i].isClose == false) {
                    isSomeOpenDispute = true;
                }
            }
        }

        require(isSomeOpenDispute == false, "Charter cannot be closed if there's some dispute opened");

        uint256 amountDue = earlyCancellationPenalty();
        if (amountDue > 0) {
            require(msg.value == amountDue, "To deposit early cancellation penalty");
            (bool sentShipOwner, ) = parties.shipOwner.call{value: amountDue}("");
            require(sentShipOwner, "Failed to send ether");
        }
        
        emit CharterClosed(parties.shipOwner, parties.charterer);
    }
}
