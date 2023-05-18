// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Truflation.sol";

contract MockTruflation is Truflation {
    uint public mockInflation;

    function requestCrudeOilPrice() public override returns (bytes32 requestId) {
        contractShipChartering.saveCrudeOilPrice(int(75410000000000000000 + mockInflation));
        mockInflation += 2000000000000000000;
    }
}