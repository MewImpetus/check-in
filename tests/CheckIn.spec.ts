import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { CheckIn } from '../wrappers/CheckIn';
import '@ton/test-utils';
import { VerifyCheck } from '../build/CheckIn/tact_VerifyCheck';

describe('CheckIn', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let checkIn: SandboxContract<CheckIn>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        checkIn = blockchain.openContract(await CheckIn.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await checkIn.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: checkIn.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and checkIn are ready to use
    });

    it('Test check in', async () => {

        
        // checkin 1
        let checkinResult = await checkIn.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            "check in"
        );

        expect(checkinResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: checkIn.address,
            success: true,
        });


        const user_address = await checkIn.getVerifyAddress(deployer.address);
        const user = blockchain.openContract(VerifyCheck.fromAddress(user_address));

        const user_info1 = await user.getCheckInfo();
        // console.log("user_info1:", user_info1)
        expect(user_info1.count).toEqual(1n);

        // checkin 2
        checkinResult = await checkIn.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            "check in"
        );

        expect(checkinResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: checkIn.address,
            success: true,
        });



        const user_info2 = await user.getCheckInfo();
        // console.log("user_info2:", user_info2)
        expect(user_info2.count).toEqual(2n);

        // 3 checkin failed
        checkinResult = await checkIn.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            "check in"
        );
        

        expect(checkinResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: checkIn.address,
            success: true,
        });


        const user_info3 = await user.getCheckInfo();
        // console.log("user_info3:", user_info3)
        expect(user_info2).toEqual(user_info3)

 
        
    });
});
