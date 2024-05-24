import { toNano } from '@ton/core';
import { CheckIn } from '../wrappers/CheckIn';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const checkIn = provider.open(await CheckIn.fromInit());

    await checkIn.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(checkIn.address);

    // run methods on `checkIn`
}
