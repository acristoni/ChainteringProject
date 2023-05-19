// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Truflation.sol";

contract MockTruflationBadWeather is Truflation {
    uint public mockInflation;

    function requestCrudeOilPrice() public override returns (bytes32 requestId) {
        contractShipChartering.saveCrudeOilPrice(int(75410000000000000000 + mockInflation));
        mockInflation += 2000000000000000000;
    }
    
    function requestWindSpeed(string calldata lat, string calldata long) public override returns (bytes32 requestId) {
        contractShipChartering.saveWindSpeed(220); //22 knots, bad weather
    }

    function requestHaversineDistance (
        string calldata lat1, 
        string calldata lon1, 
        string calldata lat2, 
        string calldata lon2 ) public override returns (bytes32 requestId) {
         contractShipChartering.saveHaversineDistance(49670305761772860);
    }
}