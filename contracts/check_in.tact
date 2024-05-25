import "@stdlib/ownable";
import "@stdlib/deploy";

message Record {
    count: Int as uint32;
    address: Address;
    at: Int as uint32;
}

message InterCheckIn {
    index: Int as uint64;
}

struct LogRecord {
    index: Int as uint64;
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

    receive(msg: InterCheckIn) {
        require(sender() == self.master, "Master only");
        // check limit
        let _now: Int = now();
        require(_now - self.today_count_update >= self.delta || self.today_count < self.day_limit, "Exceeded daily limit.");
        if(_now - self.today_count_update >= self.delta) {
            self.today_count = 1;
            self.today_count_update = _now;
        } else if(self.today_count < self.day_limit) {
            self.today_count = self.today_count + 1;
            self.today_count_update = _now;
        }
        self._check_in(msg.index, _now);
        
    }

    get fun check_info(): UserCountInfo {
        return UserCountInfo {
            count: self.count,
            today_count: self.today_count,
            today_count_update: self.today_count_update
        };
    }


    inline fun _check_in(index: Int, at: Int) {
        self.count = self.count + 1;
        let init: StateInit = initOf Log(self.master, index);
        let log_address: Address = contractAddress(init);
        send(SendParameters{
            to: log_address,
            body: Record { count: self.count, address: self.user, at: at}.toCell(),
            value: myBalance() - ton("0.02"),
            // mode: SendRemainingValue,
            code: init.code,      
            data: init.data
        });
    }



}

contract Log {
    master: Address;
    seqno: Int as uint64;
    record: LogRecord;

    init(master: Address, seqno: Int) {
        self.master = master;
        self.seqno = seqno;
        self.record = LogRecord{
            index: seqno,
            count: 0,
            address: newAddress(0, 0),
            at: now()
        };
    }

    receive(msg: Record) {

        require(self.caculate_verify_address(msg.address) == sender(), "No permission");
        self.record.count = msg.count;
        self.record.address = msg.address;
        self.record.at = now();

        send(SendParameters{
            to: self.master,
            value: ton("0.008"),
            body: "increase".asComment(),
        });

        send(SendParameters{
            to: msg.address,
            bounce: true,
            value: context().value - ton("0.03"),
        });
    }

    get fun record(): LogRecord {
        return self.record;
    }

    inline fun caculate_verify_address(user: Address): Address {
        return contractAddress(initOf VerifyCheck(self.master, user));

    }

    
}

contract CheckIn with Deployable, OwnableTransferable {
    owner: Address;
    seqno: Int as uint64;
    init(){
        self.owner = sender();
        self.seqno = 0;
    }

    receive("check in") {
        let init: StateInit = self.caculate_verify_init(sender());
        let verify_address: Address = contractAddress(init);
        send(SendParameters{
            to: verify_address,
            body: InterCheckIn { index: self.seqno}.toCell(),
            value: myBalance() - ton("0.02"),
            code: init.code,      
            data: init.data
        });
    }

    receive("increase") {
        self.seqno = self.seqno + 1;
    }

    get fun current_index(): Int {
        return self.seqno;
    }

    get fun verify_address(user: Address): Address {
        return contractAddress(self.caculate_verify_init(user));
    }

    get fun log_address(index: Int): Address {
        return contractAddress(self.caculate_log_init(index));
    }

    inline fun caculate_verify_init(user: Address): StateInit {
        return initOf VerifyCheck(myAddress(), user);

    }

    inline fun caculate_log_init(seqno: Int): StateInit {
        return initOf Log(myAddress(), seqno);
    }
}