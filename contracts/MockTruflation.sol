// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Truflation.sol";

contract MockTruflation is Truflation {
    function requestCrudeOilPrice() public override returns (bytes32 requestId) {
        contractShipChartering.saveCrudeOilPrice(75410000000000000000);
    }
}