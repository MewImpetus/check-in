import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { CheckIn } from '../wrappers/CheckIn';
import '@ton/test-utils';

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
});
