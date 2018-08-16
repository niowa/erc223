pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";


/// @title Storage for ether
contract EtherStorage is Ownable, SafeMath {

  struct Investment {
    uint amount;
    uint investmentDate;
  }

  address public crowdsale;
  uint public amountRaised;
  uint public investmentGoal;
  uint public investmentSample;
  uint public amountLuckyInvestments;
  uint public investmentsCounter;

  Investment[] public investments;

  constructor(
    address _crowdsaleAddress,
    uint _investmentGoal,
    uint _investmentSample,
    uint _amountLuckyInvestments
  ) public {
    crowdsale = _crowdsaleAddress;
    investmentGoal = _investmentGoal;
    investmentSample = _investmentSample;
    amountLuckyInvestments = _amountLuckyInvestments;
    owner = msg.sender;
    amountRaised = 0;
    investmentsCounter = 0;
  }

  /// @notice Public interface for investment
  function() public payable {
    amountRaised += msg.value;

    if (amountRaised >= investmentGoal || isInvestmentFallen()) {
      withdrawEtherToOwner(amountRaised);
    } else {
      saveLatestInvestment();
    }
  }

  /// @notice Check if users send less ether
  /// @return Whether investment fallen was successful or not
  function isInvestmentFallen() internal returns (bool success) {
    if (
      investments.length == investmentSample &&
      ++investmentsCounter % (amountLuckyInvestments + 1) == 0  &&
      calculateCommonProfitCoefficient() > calculateLatestProfitCoefficient()
    ) {
      return true;
    } else {
      return false;
    }
  }

  /// @notice Calculate coefficient for current and latest investments
  /// @return Calculated coefficient
  function calculateLatestProfitCoefficient() internal returns (uint coefficient) {
    return safeDiv(msg.value, safeSub(now, investments[investments.length - 1].investmentDate));
  }

  /// @notice Calculate coefficient for array of investments
  /// @return Calculated coefficient
  function calculateCommonProfitCoefficient() internal returns (uint coefficient) {
    uint sumEther = 0;
    uint sumTime = 0;
    for (uint i = 0; i < investments.length - 1; i++) {
      sumEther += investments[i].amount;
      sumTime += safeSub(investments[i + 1].investmentDate, investments[i].investmentDate);
    }
    sumEther += investments[investments.length - 1].amount;

    return safeDiv(safeDiv(sumEther, investmentSample), safeDiv(sumTime, investments.length - 1));
  }

  /// @notice Push to array data about current investment
  /// @return Whether save operation was successful or not
  function saveLatestInvestment() internal returns (bool success) {
    if (investments.length >= investmentSample) {
      removeFromInvestments(0);
    }

    investments.push(Investment(msg.value, now));
    return true;
  }

  /// @notice Delete passed element from investment array
  /// @param index Index of array element
  /// @return Whether remove operation was successful or not
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

  /// @notice Set size of sample for investment data
  /// @param _investmentSample New size of sample
  /// @return Whether the set investment sample operation was successful or not
  function setInvestmentSample(uint _investmentSample) public onlyOwner returns (bool success) {
    require(_investmentSample > 1);
    investmentSample = _investmentSample;
    return true;
  }

  /// @notice Set amount of investments without check
  /// @param _amountLuckyInvestments New amount of investments
  /// @return Whether the set investment without check operation was successful or not
  function setAmountLuckyInvestments(uint _amountLuckyInvestments) public onlyOwner returns (bool success) {
    amountLuckyInvestments = _amountLuckyInvestments;
    return true;
  }
}
