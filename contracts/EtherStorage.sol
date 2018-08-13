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

  function() public payable {
    amountRaised += msg.value;
  }

  function withdrawEtherToUser(address _to, uint _amount) public {
    require(_to != address(0));
    require(_amount <= amountRaised);
    require(msg.sender == crowdsale);
    amountRaised -= _amount;
    _to.transfer(_amount);
  }

  function withdrawEtherToOwner(uint _amount) public onlyOwner {
    require(msg.sender != address(0));
    require(_amount <= amountRaised);
    amountRaised -= _amount;
    msg.sender.transfer(_amount);
  }

  function setCrowdsale(address _crowdsale) public onlyOwner {
    require(_crowdsale != address(0));
    crowdsale = _crowdsale;
  }
}
