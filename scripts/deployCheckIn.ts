import { Address, toNano } from '@ton/core';
import { CheckIn } from '../wrappers/CheckIn';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const checkIn = provider.open(await CheckIn.fromInit());

    // const checkIn = provider.open(await CheckIn.fromAddress(Address.parse("kQC-lWLrr-2N-rcVSC1ZWKiaAEbDWD0brIUTd--u8hUCQQGm")))

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

    await checkIn.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        "check in"
    );
}
