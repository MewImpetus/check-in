import {
    WalletContractV4,
    TonClient4,
    Address,
} from "@ton/ton";
import { CheckIn } from '../wrappers/CheckIn';
import { Log } from '../build/CheckIn/tact_Log';
import { VerifyCheck } from '../build/CheckIn/tact_VerifyCheck';


const Sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

(async () => {
    //create client for testnet sandboxv4 API - alternative endpoint
    const client4 = new TonClient4({
        endpoint: "https://sandbox-v4.tonhubapi.com",
    });



    const checkin_contract_address = "0QB2mjRa7F6OifAAaiSyVO3x92ZSomoHgNqrXNYeETiMCzh1"

    let contract = CheckIn.fromAddress(Address.parse(checkin_contract_address));
    let checkin = client4.open(contract);

    // get the log index
    let current_index = await checkin.getCurrentIndex();
    console.log("current_index:", current_index)

    // history is 0 to current_index-1
    // get the 0 index record
    const log_contract_address_0 = await checkin.getLogAddress(0n);
    let log_0 = client4.open(Log.fromAddress(log_contract_address_0));

    try {
        const record_0 = await log_0.getRecord();
        console.log("record_0:", record_0);
    } catch (error) {
        console.error("Failed to get record_0");
    }


})();
