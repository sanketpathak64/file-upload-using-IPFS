import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Meme from '../abis/Meme.json'

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({host: 'ipfs.infura.io' ,port: 5001,protocol: 'https'})
let accounts;

var link;
class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    
  }
  //get acc,net,cont,memehash
  async loadBlockchainData() {
    const web3 = window.web3;
    accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})
    const networkId = await web3.eth.getId()
    const networkData = Meme.networks[networkId]
    if(networkData){
        const abi = Meme.abi;
        const address = networkData.address

        const contract = web3.eth.Contract(abi,address)
        this.setState({contract})
        const memeHash = await contract.methods.get().call()
        this.setState({memeHash})

    } else {
      window.alert("contract not deployed on network")
    }
  }

  constructor(props) {
    super(props);
    this.state={
      account: '',
      buffer:null,
      contract:'', 
      memeHash:''
    };
  }
  async loadWeb3() {
    if(window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()

    } if(window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert("plz use meta mask");
    }
  }


  captureFile = (event) => {
    event.preventDefault()
    console.log('file captured');
    //process file for ipfs
    const file = event.target.files[0];
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result) })
       
    } 
  }
  onSubmit = (event) => {
    event.preventDefault();
    console.log('submitting a form');
    ipfs.add(this.state.buffer,(error,result) => {
      //do some
      console.log('ipfs result',result)
      const memeHash = result[0].hash;
      this.setState({memeHash});
      if(error){
        console.error(error);
        return
      }
      this.state.contract.methods.set(memeHash).send({
        from: accounts[0]
      }).then((r) => {
        this.setState({memeHash})
      })



      //       : {path: "QmVm2hzYBwaqnb85mmrRAiSCmAbka6dNxgTXG13Wvx69ne", hash: "QmVm2hzYBwaqnb85mmrRAiSCmAbka6dNxgTXG13Wvx69ne", size: 2385}
      // length: 1
      // __proto__: Array(0)
      //https://ipfs.infura.io/ipfs/Qmeke3Btncgmv4gMR3RqC3Ao6NNMbbE5N4HzGVaSHVNe4D
      // way to get a file


    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meme of the day
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sn-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>

        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} />
                  

                </a>
                <br />
                <h1>Meme of the day</h1>
                <form onSubmit={this.onSubmit}>
                  <input type="file" onChange={this.captureFile}></input>
                  <input type="submit"></input>
                </form>
                
                
               
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
