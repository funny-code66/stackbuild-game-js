const WEBGL = require('../lib/WebGL');
const Game = require('./game');
const WalletConnect = require('./walletConnect')
if (!WEBGL.isWebGLAvailable()) {
  console.error('WebGL is not supported in this browser.');
}
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});


