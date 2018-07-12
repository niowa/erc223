pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./Interfaces/PlayChipTokenInterface.sol";
import "./Interfaces/ERC223RecieverInterface.sol";

/// @title Crowdsale with could sell tokens for eth
contract Crowdsale is Ownable, SafeMath {

  PlayChipTokenInterface public token;
  address public withdrawAddress;
  uint public initPrice;
  uint public rate;
  uint public amountRaised;
  uint public startAt;

  event FundTransfer(address investor, uint amount);

  constructor(address _tokenAddress, uint _initPrice, uint _rate) public {
    require(_initPrice > 0);
    amountRaised = 0;
    owner = msg.sender;
    withdrawAddress = msg.sender;
    initPrice = _initPrice;
    rate = _rate;
    startAt = now;
    token = PlayChipTokenInterface(_tokenAddress);
  }

  /// @notice Public interface for investment
  function() public payable {
    uint amount = msg.value;
    amountRaised += amount;
    uint tokensBought = convertEthToTokens(amount);
    token.generateTokens(msg.sender, tokensBought);
    if (isContract(msg.sender)) {
      bytes memory empty;
      ERC223RecieverInterface untrustedReceiver = ERC223RecieverInterface(msg.sender);
      untrustedReceiver.tokenFallback(msg.sender, tokensBought, empty);
    }
    emit FundTransfer(msg.sender, amount); // solhint-disable-line
    withdrawAddress.transfer(amount);
  }

  function setRate(uint _rate) public onlyOwner {
    rate = _rate;
  }

  function convertEthToTokens(uint _amount) public constant returns (uint convertedAmount) {
    uint price = safeAdd(safeMul(safeSub(now, startAt), rate), initPrice);
    uint tokenDecimalsIncrease = uint(10) ** token.decimals();
    uint tokenNumberWithDecimals = safeMul(_amount, tokenDecimalsIncrease);
    return safeDiv(tokenNumberWithDecimals, price);
  }

  /// @notice check if account is contract
  /// @param _addr address for check
  /// @return is address contract or not
  function isContract(address _addr) private view returns (bool result) {
    uint length;
    assembly {
      length := extcodesize(_addr)
    }
    return (length > 0);
  }
}
