// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant minimumUsd = 20 * 1e18;

    address[] private s_funds;

    mapping(address => uint256) private s_addressToAmountFund;

    address private immutable i_owner;

    event Fund(address sender, uint256 amount, uint256 usd);

    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        // require(msg.sender == owner, "You are not owner");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= minimumUsd,
            "You need to spend more ETH!"
        );
        s_funds.push(msg.sender);
        s_addressToAmountFund[msg.sender] += msg.value;
        emit Fund(
            msg.sender,
            msg.value,
            msg.value.getConversionRate(s_priceFeed)
        );
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funds.length;
            funderIndex++
        ) {
            address funder = s_funds[funderIndex];
            s_addressToAmountFund[funder] = 0;
        }
        s_funds = new address[](0);
        (bool callSuccessed, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccessed, "call fail");
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funds[index];
    }

    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFund[fundingAddress];
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
