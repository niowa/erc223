pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./Interfaces/PlayChipTokenInterface.sol";
import "./Interfaces/EtherStorageInterface.sol";

/// @title Crowdsale with could sell tokens for eth
contract Crowdsale is Ownable, SafeMath {
  PlayChipTokenInterface public token;
  EtherStorageInterface public etherStorage;
  uint public initPrice;
  uint public rate;
  uint public startAt;

  event FundTransfer(address investor, uint amount);

  constructor(address _tokenAddress, uint _initPrice, uint _rate) public {
    require(_initPrice > 0);
    owner = msg.sender;
    initPrice = _initPrice;
    rate = _rate;
    startAt = now;
    token = PlayChipTokenInterface(_tokenAddress);
  }

  /// @notice Public interface for investment
  function() public payable {
    require(address(etherStorage) != address(0));
    uint amountEth = msg.value;
    uint tokensBought = convertEthToTokens(amountEth);
    token.generateTokens(msg.sender, tokensBought);
    token.lockTransfer(msg.sender);
    emit FundTransfer(msg.sender, amountEth); // solhint-disable-line
    address(etherStorage).call.value(amountEth)();
  }

  /// @notice Set new ether storage address
  /// @param _storage New address
  /// @return Whether the set ether storage operation was successful or not
  function setEtherStorage(address _storage) public onlyOwner returns (bool success) {
    require(_storage != address(0));
    etherStorage = EtherStorageInterface(_storage);
    return true;
  }

  /// @notice Behavior of contract when someone sends tokens
  /// @param _from Sender address
  /// @param _value Amount of tokens
  /// @return Whether the token fallback was successful or not
  function tokenFallback(address _from, uint _value) public returns (bool success) {
    require(_from != address(0));
    uint amountEther = convertTokensToEth(_value);
    require(amountEther > 0);
    require(address(etherStorage).balance >= amountEther);
    token.burnTokens(address(this), _value);
    etherStorage.withdrawEtherToUser(_from, amountEther);
    return true;
  }

  /// @notice Set coefficient for token price
  /// @param _rate New rate
  /// @return Whether the set rate operation was successful or not
  function setRate(uint _rate) public onlyOwner returns (bool success) {
    require(rate >= 0);
    rate = _rate;
    return true;
  }

  /// @notice Convert eth to token
  /// @param _amount Number of tokens
  /// @return Amount of wei
  function convertEthToTokens(uint _amount) public view returns (uint convertedAmount) {
    uint price = safeAdd(safeMul(safeSub(now, startAt), rate), initPrice);
    uint tokenDecimalsIncrease = uint(10) ** token.decimals();
    uint tokenNumberWithDecimals = safeMul(_amount, tokenDecimalsIncrease);
    return safeDiv(tokenNumberWithDecimals, price);
  }

  /// @notice Shows how much wei you could get by solding provided number of tokens
  /// @param _amount Number of tokens
  /// @return Amount of wei
  function convertTokensToEth(uint _amount) public view returns (uint convertedAmount) {
    uint price = safeAdd(safeMul(safeSub(now, startAt), rate), initPrice);
    uint tokenDecimalsIncrease = uint(10) ** token.decimals();
    uint etherNumberWithDecimals = safeMul(_amount, price);
    return safeDiv(etherNumberWithDecimals, tokenDecimalsIncrease);
  }
}
