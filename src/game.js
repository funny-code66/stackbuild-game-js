const Stage = require('./stage');
const WalletConnect = require('./walletConnect');
const { NormalBlock: Block, FallingBlock } = require('./block');

let account = window.ethereum.selectedAddress;

class Game {
  constructor() {
    this.STATES = {
      NOT_CONNECTED: 'not-connected',
      CONNECTED: 'connected',
      LOADING: 'loading',
      PLAYING: 'playing',
      READY: 'ready',
      ENDED: 'ended',
      RESETTING: 'resetting',
      RANKING: 'ranking'
    }

    this.blocks = [];
    this.fallingBlocks = [];
    this.state = this.STATES.LOADING;

    this.stage = new Stage();
    
    this.online_status = false;

    this.mainContainer = document.getElementById('container');
    this.scoreContainer = document.getElementById('score');
    this.onlineStartButton = document.getElementById('online-button');
    this.offlineStartButton = document.getElementById('offline-button');
    this.leaderBoardButton = document.getElementById('leaderboard-button');
    this.walletButton = document.getElementById('wallet-connect-button');
    this.mainmenuButton = document.getElementById('mainmenu-button');

    this.instructions = document.getElementById('instructions');
    this.scoreContainer.innerHTML = '0';
    this.wallet = new WalletConnect();
    //if wallet connected before show wallet address.
    if (window.ethereum.selectedAddress)
      this.walletButton.innerHTML = this.wallet.stringfyAddress(window.ethereum.selectedAddress);

    this.music = document.getElementById('music')

    this.addBlock();
    this.tick();

    for (let key in this.STATES) {
      this.mainContainer.classList.remove(this.STATES[key]);
    }
    this.setState(this.STATES.NOT_CONNECTED);

    document.addEventListener('keydown', e => {
      if (e.keyCode === 32) { // Space
        this.handleEvent();
      }
    });
    //wallet connect part
    this.walletButton.addEventListener('click', async e => {
      
      await console.log(window.ethereum.selectedAddress);
      // await this.wallet.connect();
      console.log(window.ethereum.isConnected());
      if (window.ethereum.selectedAddress) {
        this.walletButton.innerHTML = this.wallet.stringfyAddress(window.ethereum.selectedAddress);
        this.setState(this.STATES.CONNECTED);
        var myHeaders = new Headers();

        //login to background
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("account", account);

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded,
          redirect: 'follow'
        };

        fetch("https://stack-server.onrender.com/api/user/login", requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
      } else {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
    })
    this.onlineStartButton.addEventListener('click', async e => {
      if (this.state === this.STATES.CONNECTED || this.state === this.STATES.READY) {
        this.online_status = true;
        console.log('online_status by online', this.online_status)
        this.setState(this.STATES.READY);
      }
    })
    this.offlineStartButton.addEventListener('click', e => {
      if (this.state === this.STATES.CONNECTED || this.state === this.STATES.READY) {
        this.online_status = false;
        console.log('online_status', this.online_status)
        this.setState(this.STATES.READY);
      }
    })
    this.leaderBoardButton.addEventListener('click', e => {
      this.setState(this.STATES.RANKING);
    })
    this.mainmenuButton.addEventListener('click', e => {
      this.setState(this.STATES.READY);
    })

    document.addEventListener('click', e => {
      if (this.state === this.STATES.READY || this.state === this.STATES.PLAYING || this.state === this.STATES.ENDED)
        this.handleEvent();
    });

    document.addEventListener('touchend', e => {
      this.handleEvent();
    });
  }

  handleEvent() {
    switch (this.state) {
      case this.STATES.READY:
        this.setState(this.STATES.PLAYING);
        this.music.play();
        this.addBlock();
        break;
      case this.STATES.PLAYING:
        this.addBlock();
        break;
      case this.STATES.RANKING:
        // this.setState(this.STATES.READY)
        break;
      case this.STATES.ENDED:
        // send score to backend
        console.log('online_status', this.online_status)
        if (this.online_status) {
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

          var urlencoded = new URLSearchParams();
          urlencoded.append("account", window.ethereum.selectedAddress);
          urlencoded.append("score", String(this.blocks.length - 1));
          urlencoded.append("isCompetition", "1");

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
          };

          fetch("https://stack-server.onrender.com/api/user/saveScore", requestOptions)
            .then(response => response.json())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
        }
        this.blocks.forEach(block => {
          this.stage.remove(block.mesh);
        })
        this.blocks = [];
        this.scoreContainer.innerHTML = '0';
        this.addBlock();
        this.setState(this.STATES.READY);

        break;
      default:
        break;
    }
  }

  addBlock() {
    let lastBlock = this.blocks[this.blocks.length - 1];
    const lastToLastBlock = this.blocks[this.blocks.length - 2];

    if (lastBlock && lastToLastBlock) {
      const { axis, dimensionAlongAxis } = lastBlock.getAxis();
      const distance = lastBlock.position[axis] - lastToLastBlock.position[axis];
      let position, dimension;
      let positionFalling, dimensionFalling;
      const { color } = lastBlock;
      const newLength = lastBlock.dimension[dimensionAlongAxis] - Math.abs(distance);

      if (newLength <= 0) {
        this.stage.remove(lastBlock.mesh);
        this.setState(this.STATES.ENDED);
        this.music.pause();
        return;
      }

      dimension = { ...lastBlock.dimension }
      dimension[dimensionAlongAxis] = newLength;

      dimensionFalling = { ...lastBlock.dimension }
      dimensionFalling[dimensionAlongAxis] = Math.abs(distance)

      if (distance >= 0) {
        position = lastBlock.position;

        positionFalling = { ...lastBlock.position };
        positionFalling[axis] = lastBlock.position[axis] + newLength;
      } else {
        position = { ...lastBlock.position };
        position[axis] = lastBlock.position[axis] + Math.abs(distance);

        positionFalling = { ...lastBlock.position };
        positionFalling[axis] = lastBlock.position[axis] - Math.abs(distance);
      }

      this.blocks.pop();
      this.stage.remove(lastBlock.mesh);
      lastBlock = new Block({ dimension, position, color, axis }, true);

      this.blocks.push(lastBlock);
      this.stage.add(lastBlock.mesh);

      const fallingBlock = new FallingBlock({
        dimension: dimensionFalling,
        position: positionFalling,
        color,
      });

      this.fallingBlocks.push(fallingBlock);
      this.stage.add(fallingBlock.mesh);
    }

    this.scoreContainer.innerHTML = String(this.blocks.length - 1);

    const newBlock = new Block(lastBlock);
    this.stage.add(newBlock.mesh);
    this.blocks.push(newBlock);

    this.stage.setCamera(this.blocks.length * 2);
  }

  setState(state) {
    const oldState = this.state;
    this.mainContainer.classList.remove(this.state);
    this.state = state;
    this.mainContainer.classList.add(this.state);
    return oldState;
  }

  tick() {
    if (this.blocks.length > 1) {
      this.blocks[this.blocks.length - 1].tick(this.blocks.length / 10);
    }
    this.fallingBlocks.forEach(block => block.tick());
    this.fallingBlocks = this.fallingBlocks.filter(block => {
      if (block.position.y > 0) {
        return true;
      } else {
        this.stage.remove(block.mesh);
        return false;
      }
    });
    this.stage.render();
    requestAnimationFrame(() => { this.tick() });
  }
}


module.exports = Game;
