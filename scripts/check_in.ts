import { Address, toNano } from '@ton/core';
import { CheckIn } from '../wrappers/CheckIn';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    const checkin_contract_address = "0QB_pBBnqnRr-h4pv8DwsA2GG0hzuFObrrOMqOqBBgZ1bssz"
    const checkIn = provider.open(CheckIn.fromAddress(Address.parse(checkin_contract_address)))

    // run methods on `checkIn`

    await checkIn.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        "check in"
    );
}
