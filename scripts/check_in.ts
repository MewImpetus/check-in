import { Address, toNano } from '@ton/core';
import { CheckIn } from '../wrappers/CheckIn';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    const checkin_contract_address = "0QB2mjRa7F6OifAAaiSyVO3x92ZSomoHgNqrXNYeETiMCzh1"
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
