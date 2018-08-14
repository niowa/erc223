pragma solidity 0.4.24;

import "./Ownable.sol";


/// @title Storage for ether
contract EtherStorage is Ownable {
  address public crowdsale;
  uint public amountRaised;
  uint public investmentGoal;
  address public test;

  constructor(address _crowdsaleAddress, uint _investmentGoal) public {
    crowdsale = _crowdsaleAddress;
    investmentGoal = _investmentGoal;
    owner = msg.sender;
    amountRaised = 0;
  }

  /// @notice Public interface for investment
  function() public payable {
    amountRaised += msg.value;
    if (amountRaised >= investmentGoal) {
      withdrawEtherToOwner(investmentGoal);
    }
  }

  /// @notice Withdraws some tokens to passed address
  /// @param _to Address for withdraw
  /// @param _amount Amount of tokens
  /// @return Whether the withdraw operation was successful or not
  function withdrawEtherToUser(address _to, uint _amount) internal returns (bool success) {
    test = msg.sender;
    require(_to != address(0));
    require(_amount <= amountRaised);
    amountRaised -= _amount;
    _to.transfer(_amount);
    return true;
  }

  /// @notice Withdraws some tokens to owner
  /// @param _amount Amount of tokens
  /// @return Whether the withdraw operation was successful or not
  function withdrawEtherToOwner(uint _amount) internal returns (bool success) {
    test = msg.sender;
    require(msg.sender != address(0));
    require(_amount <= amountRaised);
    amountRaised -= _amount;
    owner.transfer(_amount);
    return true;
  }

  /// @notice Set new crowdsale address
  /// @param _crowdsale New address
  /// @return Whether the withdraw operation was successful or not
  function setCrowdsale(address _crowdsale) public onlyOwner returns (bool success) {
    require(_crowdsale != address(0));
    crowdsale = _crowdsale;
    return true;
  }

  /// @notice Set new investment goal
  /// @param _investmentGoal New investment target
  /// @return Whether the set investment goal operation was successful or not
  function setInvestmentGoal(uint _investmentGoal) private returns (bool success) {
    require(_investmentGoal > 0);
    investmentGoal = _investmentGoal;
    return true;
  }
}
