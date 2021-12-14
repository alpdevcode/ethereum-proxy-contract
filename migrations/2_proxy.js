const Dogs = artifacts.require('Dogs');
const Proxy = artifacts.require('Proxy');
const DogsUpdated = artifacts.require('DogsUpdated');

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Dogs);
  const dogs = await Dogs.deployed();
  await deployer.deploy(Proxy, dogs.address);
  const proxy = await Proxy.deployed(); 

  //Create Proxy Dog to Fool Truffle
  var proxyDog = await Dogs.at(proxy.address);

  //Set Number of Dogs to Test the Proxy
  await proxyDog.setNumberOfDogs(10);
  let nrOfDogs = await proxyDog.getNumberOfDogs();
  console.log("Before update: " + nrOfDogs.toNumber());

  //Deploy new version of Dogs
  await deployer.deploy(DogsUpdated);
  const dogsUpdated = await DogsUpdated.deployed(); 
  proxy.upgrade(dogsUpdated.address);
  
  //Fool truffle once again. It now thinks proxyDog has all functions.
  proxyDog = await DogsUpdated.at(proxy.address);
  // //Initialize proxy state.
  proxyDog.initialize(accounts[0]);

  //Check so that storage remained
  nrOfDogs = await proxyDog.getNumberOfDogs();
  console.log("After update: " + nrOfDogs.toNumber());
  await proxyDog.setNumberOfDogs(30);
  nrOfDogs = await proxyDog.getNumberOfDogs();
  console.log("After update and check owner access: " + nrOfDogs.toNumber());
};
