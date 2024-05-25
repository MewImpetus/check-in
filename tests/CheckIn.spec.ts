import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { CheckIn } from '../wrappers/CheckIn';
import '@ton/test-utils';
import { Log } from '../build/CheckIn/tact_Log';
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

        const index = await checkIn.getCurrentIndex();
        expect(index).toEqual(0n)
        
        // 1 checkin
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

        const log_address = await checkIn.getLogAddress(0n);

        const index_after = await checkIn.getCurrentIndex();
        expect(index_after).toEqual(1n)

        const log = blockchain.openContract(Log.fromAddress(log_address));
        
        const record = await log.getRecord();

        console.log("record:", record);

        const user_address = await checkIn.getVerifyAddress(deployer.address);
        const user = blockchain.openContract(VerifyCheck.fromAddress(user_address));

        const user_info = await user.getCheckInfo();
        console.log("user_info:", user_info)

        // 2 checkin
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


        const index_after2 = await checkIn.getCurrentIndex();
        expect(index_after2).toEqual(2n)

        const log_address_1 = await checkIn.getLogAddress(1n);

        const log_1 = blockchain.openContract(Log.fromAddress(log_address_1));
        
        const record_1 = await log_1.getRecord();

        console.log("record_1:", record_1);

        const user_info2 = await user.getCheckInfo();
        console.log("user_info2:", user_info2)

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


        const index_after3 = await checkIn.getCurrentIndex();
        console.log(index_after3)
        expect(index_after3).toEqual(3n)

        const user_info3 = await user.getCheckInfo();

        expect(user_info2).toEqual(user_info3)

        const log_address_2 = await checkIn.getLogAddress(2n);

        const log_2 = blockchain.openContract(Log.fromAddress(log_address_2));

        expect(log_2.init).toEqual(undefined)
        
    });
});
