const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShipChartering", function () {
  let shipChartering;
  let owner;
  let charterer;
  let other;

  beforeEach(async () => {
    [owner, charterer, other] = await ethers.getSigners();
    const ShipChartering = await ethers.getContractFactory("ShipChartering");
    shipChartering = await ShipChartering.connect(owner).deploy(ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000) + 3600, Math.floor(Date.now() / 1000) + 7200);
    await shipChartering.deployed();
  });

  it("should be able to create a new charter", async function () {
    expect(await shipChartering.charterPrice()).to.equal(ethers.utils.parseEther("1"));
    expect(await shipChartering.startDateTime()).to.equal(Math.floor(Date.now() / 1000) + 3600);
    expect(await shipChartering.endDateTime()).to.equal(Math.floor(Date.now() / 1000) + 7200);
  });

  it("should not allow ship owner to charter their own ship", async function () {
    await expect(shipChartering.connect(owner).agreeCharter()).to.be.revertedWith("Ship owner cannot charter their own ship");
  });

  it("should not allow charterer to agree to the charter without paying the full price", async function () {
    await expect(shipChartering.connect(charterer).agreeCharter({ value: ethers.utils.parseEther("0.5") })).to.be.revertedWith("Charter price must be paid in full");
  });

  it("should not allow charter to start in the past", async function () {
    await expect(shipChartering.connect(charterer).agreeCharter({ value: ethers.utils.parseEther("1") })).to.be.revertedWith("Charter cannot start in the past");
  });

  it("should allow charterer to agree to the charter", async function () {
    await expect(shipChartering.connect(charterer).agreeCharter({ value: ethers.utils.parseEther("1") })).to.emit(shipChartering, "CharterAgreed").withArgs(owner.address, charterer.address, ethers.utils.parseEther("1"), Math.floor(Date.now() / 1000) + 3600, Math.floor(Date.now() / 1000) + 7200);
    expect(await shipChartering.charterer()).to.equal(charterer.address);
    expect(await shipChartering.isChartered()).to.be.true;
  });

  it("should not allow charter to be cancelled after it has started", async function () {
    await shipChartering.connect(charterer).agreeCharter({ value: ethers.utils.parseEther("1") });
    await ethers.provider.send("evm_setNextBlockTimestamp", [Math.floor(Date.now() / 1000) + 3600]);
    await ethers.provider.send("evm_mine");
    await expect(shipChartering.connect(charterer).cancelCharter()).to.be.revertedWith("Charter cannot be cancelled after it has started");
  });

  // it("should allow charterer to cancel the charter before it starts", async function () {
    // await shipChartering.connect(charterer).agreeCharter({ value: ethers.utils.parseEther("1") });
    // await expect(shipChartering.connect(charterer).cancelCharter()).to.emit(shipChartering, "CharterCancelled").withArgs(owner.address, charterer.address);
  // });

})