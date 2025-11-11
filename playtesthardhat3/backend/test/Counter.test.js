import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe ("playfile is sol contract name the file name its supposed to be a click counter", function() {
    let playfile_solconnect
    let slim_jim;
    let notSlimJim

    beforeEach(async function () {
    const playfile_connect = await ethers.getContractFactory("click_counter");
    [slim_jim, notSlimJim] = await ethers.getSigners();
    playfile_solconnect = await playfile_connect.connect(slim_jim).deploy();
    await playfile_solconnect.waitForDeployment();
    });

    it("should be able to click the button once to increase by 1", async () => {
            var tx = await playfile_solconnect.increase_by_1();
            await tx.wait();
            var newCount = await playfile_solconnect.count();
            expect(newCount).to.equal(1n);
        })

    it("should decrease only by 1", async function(){
    //first we need to make sure we increase by 1
    let tx = await playfile_solconnect.increase_by_1();
    await tx.wait();

    //next we need to decrease again
    tx = await playfile_solconnect.decrease_by_1();
    await tx.wait();

    // now need to read the count
    const newCount = await playfile_solconnect.count();

    //show what is expected
    expect(newCount).to.equal(0n);
    })

    it("should not allow decrease below zero", async()=>{
        await expect(
            playfile_solconnect.decrease_by_1()
        ).to.be.revertedWith("Count is too small, ooo Slim Jim does not like!!");
    })

    it("slim jim should be allowed to increase and decrease", async()=>{
        const tx = await playfile_solconnect.connect(slim_jim).increase_by_1();
        await tx.wait();
        expect(await playfile_solconnect.count()).to.equal(1n);

        await expect(
            playfile_solconnect.connect(notSlimJim).increase_by_1()
        ).to.be.revertedWith("Only Slim can use the counter!!");
    });
});