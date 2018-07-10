pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./Interfaces/PlayChipTokenInterface.sol";

/// @title Crowdsale with could sell tokens for eth
contract Crowdsale is Ownable, SafeMath {

  PlayChipTokenInterface public token;
  address public investAgentAddress;
  address public cadInvestAgentAddress;
  address public withdrawAddress;
  uint public initPrice;
  uint public factor;
  uint public amountRaised;
  uint public startAt;

  event FundTransfer(address investor, uint amount);

  constructor(address _tokenAddress, uint _initPrice, uint _factor) public {
    require(_initPrice > 0);
    amountRaised = 0;
    owner = msg.sender;
    withdrawAddress = msg.sender;
    initPrice = _initPrice;
    factor = _factor;
    startAt = now;
    token = PlayChipTokenInterface(_tokenAddress);
  }

  /// @notice Public interface for investment
  function() public payable {
    uint amount = msg.value;
    amountRaised += amount;
    uint price = safeAdd(safeMul(safeSub(now, startAt), factor), initPrice);
    token.transfer(msg.sender, safeDiv(amount, price));
    emit FundTransfer(msg.sender, amount); // solhint-disable-line
    withdrawAddress.transfer(msg.value);
  }

  function setFactor(uint _factor) public onlyOwner {
    factor = _factor;
  }
}
