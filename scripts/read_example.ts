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

    // ... 参考测试中的调用即可


})();
