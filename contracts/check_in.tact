import "@stdlib/ownable";
import "@stdlib/deploy";

message CheckInEvent {
    count: Int as uint32;
    address: Address;
    at: Int as uint32;
}

struct UserCountInfo {
    count: Int as uint32;
    today_count: Int as uint32;
    today_count_update: Int as uint32;

}

contract VerifyCheck {
    master: Address;
    user: Address;
    count: Int as uint32;
    day_limit: Int as uint32;
    today_count: Int as uint32;
    today_count_update: Int as uint32;
    const delta: Int = 86400;  // TODO to 86400

    init(master: Address, user: Address){
        self.master = master;
        self.user = user;
        self.count = 0;
        self.day_limit = 2;
        self.today_count = 0;
        self.today_count_update = 0;
    }

    receive("InterCheckIn") {
        require(sender() == self.master, "Master only");
        let _now: Int = now();
        // require(_now - self.today_count_update >= self.delta || self.today_count < self.day_limit, "Exceeded daily limit.");
        if(_now - self.today_count_update >= self.delta) {
            self.today_count = 1;
            self.today_count_update = _now;
            self.count = self.count + 1;
            emit(CheckInEvent{count: self.count, address: self.user, at: _now}.toCell());
        } else if(self.today_count < self.day_limit) {
            self.today_count = self.today_count + 1;
            self.count = self.count + 1;
            emit(CheckInEvent{count: self.count, address: self.user, at: _now}.toCell());
        }
       
        send(SendParameters{
            to: self.user,
            value: myBalance()- ton("0.015"),
            mode: SendIgnoreErrors
        });
        
    }

    get fun check_info(): UserCountInfo {
        return UserCountInfo {
            count: self.count,
            today_count: self.today_count,
            today_count_update: self.today_count_update
        };
    }
}

contract CheckIn with Deployable, OwnableTransferable {
    owner: Address;
    init(){
        self.owner = sender();
    }

    receive() {
        require(myBalance() <= ton("0.1"), "Balance getting too high");
    }

    receive("check in") {
        let init: StateInit = self.caculate_verify_init(sender());
        send(SendParameters{
            to: contractAddress(init),
            body: "InterCheckIn".asComment(),
            value: 0,
            mode: SendRemainingValue,
            code: init.code,      
            data: init.data
        });
    }

    get fun verify_address(user: Address): Address {
        return contractAddress(self.caculate_verify_init(user));
    }

    inline fun caculate_verify_init(user: Address): StateInit {
        return initOf VerifyCheck(myAddress(), user);
    }
}
