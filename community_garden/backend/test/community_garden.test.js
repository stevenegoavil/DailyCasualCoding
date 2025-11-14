import { expect } from "chai";
import {network} from "hardhat";

const { ethers } = await network.connect();

describe("community_garden.sol testing contract functionality", function () {
  let connect_community_garden;
  //let sim_jim; // this might not be useful if slim jim is just another regular primary, maybe for the sake of this test code we will make him have special abilities, but will be implimented at the end.
  let admin;
  let friend;
  let primaryslotbuyer;
  let denied_user;
  let monthlyFee // this makes it available in the "it" functions as well

  beforeEach(async function() {
    [admin, friend, primaryslotbuyer, denied_user] = await ethers.getSigners();
    const testing_community_garden = await ethers.getContractFactory("c_garden", admin);
    

    const initialSlots = [1];
    const primary = [primaryslotbuyer.address]; //sim_jim is in here for now
    const friends = [friend.address];//secondary
    const monthlyFee = ethers.parseEther("0.1");

    //connect_community_garden = await testing_community_garden.deploy(initialSlots, primary, friends, monthlyFee);
    connect_community_garden = await testing_community_garden.deploy(initialSlots, primary, friends, monthlyFee);
    await connect_community_garden.waitForDeployment();
  })

  //admin testing functions ------->
  it("deploys and sets owner to admin", async()=>{
    expect(await connect_community_garden.owner()).to.equal(await admin.getAddress());

  });

  it("admin should be able to add primary to a available slots, meaning giving gate access, and two keys to primary", async() =>{

    // pick a free slot (1 and 2 are already used in the constructor)
    const freeSlot = 3;

    // 1) Admin assigns the plot to primaryslotbuyer
    await expect(
      connect_community_garden
        .connect(admin)
        .assignPlot(freeSlot, primaryslotbuyer.address)
    )
      .to.emit(connect_community_garden, "PlotAssigned")
      .withArgs(freeSlot, primaryslotbuyer.address);

    // Check that the plot is correctly assigned
    const plot = await connect_community_garden.plots(freeSlot);
    expect(plot.primary).to.equal(primaryslotbuyer.address);
    expect(plot.friend).to.equal(ethers.ZeroAddress);

    // 2) Initially, no gate access (hasn't paid yet)
    expect(
      await connect_community_garden.hasGateAccess(primaryslotbuyer.address)
    ).to.equal(false);

    // 3) Primary pays the monthly fee
    const fee = await connect_community_garden.monthlyFee(); // needed to direct
    await expect(
      connect_community_garden
        .connect(primaryslotbuyer)
        .payForMonth({ value: fee })
    ).to.emit(connect_community_garden, "MonthPaid");

    // 4) Now primary has gate access
    expect(
      await connect_community_garden.hasGateAccess(primaryslotbuyer.address)
    ).to.equal(true);

    // 5) And can receive keys (2 keys per member)
    const keyCount = await connect_community_garden.getKeyCount(
      primaryslotbuyer.address
    );
    expect(keyCount).to.equal(2); // keys_per_memeber is 2 in the contract
  });

  it("admin should be able to remove primary from a slot, meaning removing gate access, and removing primary which will automatically remove friend", async()=>{ 

    const slot_revoke = 1;
    const before = await connect_community_garden.plots(slot_revoke);
    expect(before.primary).to.equal(primaryslotbuyer.address);
    expect(before.friend).to.equal(friend.address); //secondary

    await expect(
      connect_community_garden.connect(admin).revokePlot(slot_revoke)
    )
      .to.emit(connect_community_garden, "FriendRemoved")
      .withArgs(slot_revoke, friend.address)
      .and.to.emit(connect_community_garden, "PlotRevoked")
      .withArgs(slot_revoke, primaryslotbuyer.address);
    
    const after = await connect_community_garden.plots(slot_revoke);
    expect(after.primary).to.equal(ethers.ZeroAddress);
    expect(after.friend).to.equal(ethers.ZeroAddress);

  });
  it("admin should be able to withdrawl funds from slots and be able to look at balances", async()=>{
      
    const fee = await connect_community_garden.monthlyFee();

      // user pays fee so contract has balance
      await connect_community_garden
        .connect(primaryslotbuyer)
        .payForMonth({ value: fee });

    const contractAddress = await connect_community_garden.getAddress();
    const before = await ethers.provider.getBalance(contractAddress);
    expect(before).to.equal(fee);

    const tx = await connect_community_garden
      .connect(admin)
      .withdraw(admin.address, fee);

    await expect(tx)
      .to.emit(connect_community_garden, "Withdrawn")
      .withArgs(admin.address, fee);

    const after = await ethers.provider.getBalance(contractAddress);
    expect(after).to.equal(0);
  });

  // Primary and Friend functions testing ------>
  it("Primary should be able to add friend and remove friend from plot", async()=>{

  }); //would it be a good idea to do a test function that does both?

  it("primary and friend should be able to pay monthly bill if they need to, and see balance if its paid or not", async()=>{

  });


  

  
});
