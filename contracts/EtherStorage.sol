pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";


/// @title Storage for ether
contract EtherStorage is Ownable, SafeMath {

  struct Investment {
    uint amount;
    uint diffDate;
  }

  address public crowdsale;
  uint public amountRaised;
  uint public investmentGoal;
  uint public investmentSample;

  Investment[] public investments;

  constructor(address _crowdsaleAddress, uint _investmentGoal, uint _investmentSample) public {
    crowdsale = _crowdsaleAddress;
    investmentGoal = _investmentGoal;
    investmentSample = _investmentSample;
    owner = msg.sender;
    amountRaised = 0;
  }

  /// @notice Public interface for investment
  function() public payable {
    amountRaised += msg.value;

    if (isInvestmentFallen() || amountRaised >= investmentGoal) {
      withdrawEtherToOwner(amountRaised);
    } else {
      saveLatestInvestment();
    }
  }

  function isInvestmentFallen() internal returns (bool success) {
    if (investments.length < investmentSample || calculateCommonProfitCoefficient() <= calculateLatestProfitCoefficient()) {
      return false;
    } else {
      return true;
    }
  }

  function calculateLatestProfitCoefficient() internal returns (uint coeficient) {
    return safeDiv(msg.value, safeSub(now, investments[investments.length - 1].diffDate));
  }

  function calculateCommonProfitCoefficient() internal returns (uint coeficient) {
    uint sumEther = 0;
    uint sumTime = 0;
    for (uint i = 0; i < investments.length - 1; i++) {
      sumEther += investments[i].amount;
      sumTime += safeSub(investments[i + 1].diffDate, investments[i].diffDate);
    }
    sumEther += investments[investments.length - 1].amount;

    return safeDiv(sumEther, safeDiv(sumTime, investments.length - 1));
  }

  function saveLatestInvestment() internal returns (bool success) {
    if (investments.length >= investmentSample) {
      removeFromInvestments(0);
    }

    investments.push(Investment(msg.value, now));
    return true;
  }

  function removeFromInvestments(uint index) internal returns (bool success) {
    if (index >= investments.length) return false;

    for (uint i = index; i < investments.length - 1; i++) {
      investments[i] = investments[i + 1];
    }
    delete investments[investments.length-1];
    investments.length--;
    return true;
  }

  /// @notice Withdraws some tokens to owner
  /// @param _amount Amount of tokens
  /// @return Whether the withdraw operation was successful or not
  function withdrawEtherToOwner(uint _amount) internal returns (bool success) {
    amountRaised -= _amount;
    owner.transfer(_amount);
    return true;
  }

  /// @notice Withdraws some tokens to passed address
  /// @param _to Address for withdraw
  /// @param _amount Amount of tokens
  /// @return Whether the withdraw operation was successful or not
  function withdrawEtherToUser(address _to, uint _amount) external returns (bool success) {
    require(_to != address(0));
    require(msg.sender == crowdsale);
    require(_amount <= amountRaised);
    amountRaised -= _amount;
    _to.transfer(_amount);
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
  function setInvestmentGoal(uint _investmentGoal) public onlyOwner returns (bool success) {
    require(_investmentGoal > 0);
    investmentGoal = _investmentGoal;
    return true;
  }
}
