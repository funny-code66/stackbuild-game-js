
class WalletConnect {
    constructor() {

    }
    async connect() {
        if (window.ethereum) {

            await ethereum.request({ method: 'eth_requestAccounts' });
        } else {
            console.log("No wallet");
        }
    }
    stringfyAddress(addr) {
        let retaddr = addr.slice(0, 5) + "..." + addr.slice(-3);
        return retaddr;
    }
}
module.exports = WalletConnect;