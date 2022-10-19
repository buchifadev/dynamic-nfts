const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dynamic", function () {
  this.timeout(50000);

  let dynamicContract;
  let owner;
  let acc1;
  let acc2;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    const Dynamic = await ethers.getContractFactory("Dynamic");
    [owner, acc1, acc2] = await ethers.getSigners();    

    dynamicContract = await Dynamic.deploy();
  });

  it("Should set the right owner", async function () {
    expect(await dynamicContract.owner()).to.equal(owner.address);
  });

  it("Should mint one NFT", async function () {
    expect(await dynamicContract.balanceOf(acc1.address)).to.equal(0);

    const tokenURI = "https://dacade.org/0";
    const tokenPrice = 5;
    const tx = await dynamicContract.connect(owner).mintToken(tokenURI, tokenPrice);
    await tx.wait();

    expect(await dynamicContract.balanceOf(acc1.address)).to.equal(0);
  });

  it("Should set the correct tokenURI", async function () {
    const tokenURI_zero = "https://dacade.org/0";
    const tokenURI_one = "https://dacade.org/1";
    const tokenPrice = 18;

    const tx1 = await dynamicContract.connect(owner).mintToken(tokenURI_zero, tokenPrice);
    await tx1.wait();
    const tx2 = await dynamicContract.connect(owner).mintToken(tokenURI_one, tokenPrice);
    await tx2.wait();

    expect(await dynamicContract.tokenURI(0)).to.equal(tokenURI_zero);
    expect(await dynamicContract.tokenURI(1)).to.equal(tokenURI_one);
  });
});
