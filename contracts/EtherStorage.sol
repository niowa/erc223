pragma solidity 0.4.24;

import "./Ownable.sol";


/// @title Storage for ether
contract EtherStorage is Ownable {
  address public crowdsale;
  uint public amountRaised;

  constructor(address _crowdsaleAddress) public {
    crowdsale = _crowdsaleAddress;
    owner = msg.sender;
    amountRaised = 0;
  }

  /// @notice Public interface for investment
  function() public payable {
    amountRaised += msg.value;
  }

  /// @notice Withdraws some tokens to passed address
  /// @param _to Address for withdraw
  /// @param _amount Amount of tokens
  /// @return Whether the withdraw operation was successful or not
  function withdrawEtherToUser(address _to, uint _amount) public returns (bool success) {
    require(_to != address(0));
    require(_amount <= amountRaised);
    require(msg.sender == crowdsale);
    amountRaised -= _amount;
    _to.transfer(_amount);
    return true;
  }

  /// @notice Withdraws some tokens to owner
  /// @param _amount Amount of tokens
  /// @return Whether the withdraw operation was successful or not
  function withdrawEtherToOwner(uint _amount) public returns (bool success) {
    require(msg.sender != address(0));
    require(_amount <= amountRaised);
    require(msg.sender == crowdsale);
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
}
