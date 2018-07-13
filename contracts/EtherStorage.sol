pragma solidity 0.4.24;

import "./Ownable.sol";


/// @title Storage for ether
contract EtherStorage is Ownable {
  address public crowdsale;

  constructor(address _crowdsaleAddress) public {
    crowdsale = _crowdsaleAddress;
  }

  function withdrawEtherToUser(address _to, uint _amount) public {
    require(_to != address(0));
    require(msg.sender == crowdsale);
    _to.transfer(_amount);
  }

  function withdrawEtherToOwner(uint _amount) public onlyOwner {
    require(msg.sender != address(0));
    msg.sender.transfer(_amount);
  }
}
