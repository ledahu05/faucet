// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./Owned.sol";
import "./Logger.sol";
import "./IFaucet.sol";

contract Faucet is Owned, Logger, IFaucet {
    uint256 public numOfFounters;

    mapping(address => bool) private funders;
    mapping(uint256 => address) private lutfunders;

    function emitLog() public pure override returns (bytes32) {
        return "Hello world";
    }

    receive() external payable {}

    function addFunds() external payable override {
        address funder = msg.sender;
        if (!funders[funder]) {
            lutfunders[numOfFounters] = funder;
            numOfFounters++;
            funders[funder] = true;
        }
    }

    modifier limitWithdraw(uint256 withdrawAmount) {
        require(
            withdrawAmount <= 100000000000000000,
            "Cannot withdraw more than 0.1 ether"
        );
        _;
    }

    function withdraw(uint256 withdrawAmount)
        external
        override
        limitWithdraw(withdrawAmount)
    {
        payable(msg.sender).transfer(withdrawAmount);
    }

    function test1() external onlyOwner {
        // some managing stuff that only admin should have access to
    }

    function test2() external onlyOwner {
        // some managing stuff that only admin should have access to
    }

    function getAllFunders() external view returns (address[] memory) {
        address[] memory _funders = new address[](numOfFounters);
        for (uint256 i = 0; i < numOfFounters; i++) {
            _funders[i] = lutfunders[i];
        }
        return _funders;
    }

    function getFunderAtIndex(uint8 index) external view returns (address) {
        return lutfunders[index];
    }
}
