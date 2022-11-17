// App.js
import { useEffect, useState } from "react";
import "./App.css";
import "./App_responsive.css";

import { CONTRACT_ADDRESS, ABI, ETHERS } from "./constants";

import { NFTStorage } from 'nft.storage';

import headerLogoImage from "./assets/love_fruits.jpg";
import footerLogoImage from "./assets/JuicyVoice.JPG";

import { useForm } from 'react-hook-form';

import { networks } from './utils/networks';

import { ColorRing } from 'react-loader-spinner';
<ColorRing
visible={true}
height="80"
width="80"
ariaLabel="blocks-loading"
wrapperStyle={{}}
wrapperClass="blocks-wrapper"
colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
/>

function App() {

  const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNFRkRCYWI4NGE4RjhhOWEyQjM0RTBkNmQ5RTFhMjdCMUUwNzYwMjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2ODA4MzgxNDI0NiwibmFtZSI6Ikp1aWxsaWFyZCJ9.u2WR7t81CGk9JvB13aEy4m4IJaeP_0zCkk-lKSqFPgk';

  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [currentAccount, setCurrentAccount] = useState(null);
  // network を状態変数として設定します。
  const [network, setNetwork] = useState("");
  //音声投稿フラグを保存する変数とメソッド
  const [postModeValue, setPostModeValue] = useState("");
  //ローディングフラグを保存する変数とメソッド
  const [isLoadingValue, setIsLoadingValue] = useState("");
  // すべてのvoicesを保存する状態変数を定義 
  const [allVoices, setAllVoices] = useState([]);

  //  アーカイブされているすべての音声データを得る
  const getAllVoices = async () => {
    
    const { ethereum } = window;

    try {
      if (ethereum) {
        
        const provider = new ETHERS.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const VPContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);

        /* コントラクトからgetAllVoicesメソッドを呼び出す */
        const voices = await VPContract.getAllVoices();
        /* UIに必要なのは、ID、アドレス、メッセージ、タイムスタンプ、ライク数なので、以下のように設定 */
        const voicesCleaned = voices.map((voice) => {
          return {
            id: voice.id,
            address: voice.poster,
            username: voice.username,
            gender: voice.gender,
            genre: voice.genre,
            voice: voice.voice,
            title: voice.title,
            description: voice.description,
            isPublic: voice.isPublic,
            haveAuthorityToComment: voice.haveAuthorityToComment,
            timestamp: new Date(voice.timestamp * 1000).toUTCString(),
            totallikes: voice.totallikes
          };
        });

        /*for(let i = 0; i < voices.length; i++ ){
          console.log("voiceURL ",voices[i].voice);
        }*/

        /* React Stateにデータを格納する */
        setAllVoices(voicesCleaned);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //コントラクトのNewVoiceイベントから送られてきたデータを受け取り、処理する
  useEffect(() => {
    
    let VPContract;

    //新しく追加されたボイスをオブジェクト配列の末尾に保存
    const onNewVoice = ( id, from, username, gender, genre, voice, title, description, isPublic, haveAuthorityToComment, timestamp, totallikes ) => {
      
      console.log("NewVoice", id, from, username, gender, genre, voice, title, description, isPublic, haveAuthorityToComment, timestamp, totallikes);
      setAllVoices((prevState) => [
        ...prevState,
        {
          id: id,
          address: from,
          username: username,
          gender: gender,
          genre: genre,
          voice: voice,
          title: title,
          description: description,
          isPublic: isPublic,
          haveAuthorityToComment: haveAuthorityToComment,
          timestamp: new Date(timestamp * 1000).toUTCString(),
          totallikes: totallikes
        },
      ]);
    };

    /* NewCommentイベントがコントラクトから発信されたときに、情報を受け取ります */
    if (window.ethereum) {
      const provider = new ETHERS.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      VPContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);
      VPContract.on("NewVoice", onNewVoice);
    }
    /*メモリリークを防ぐために、NewVoiceのイベントを解除します*/
    return () => {
      if (VPContract) {
        VPContract.off("NewVoice", onNewVoice);
      }
    };
  }, []);

  // MetaMaskと接続する関数
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error);
    }

  };

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Mumbai testnet に切り替えます。
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // utilsフォルダ内のnetworks.js を確認しましょう。0xは16進数です。
        });
      } catch (error) {
        // このエラーコードは当該チェーンがメタマスクに追加されていない場合です。
        // その場合、ユーザーに追加するよう促します。
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                      name: "Mumbai Matic",
                      symbol: "MATIC",
                      decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // window.ethereum が見つからない場合メタマスクのインストールを促します。
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }

  // network を扱えるよう checkIfWalletIsConnected 関数をupdateします。
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);

      //ボイスオブジェクト配列を設定
      getAllVoices();

    } else {
      console.log('No authorized account found');
    }

    // ユーザーのネットワークのチェーンIDをチェックします。
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);

    // ネットワークが変わったらリロードします。
    function handleChainChanged(_chainId) {
      console.log('No authorized account found');
      window.location.reload();
    }

    /*ethereum.on('accountsChanged', handleAccountsChanged);

    // アカウントの接続が変わったらリロードします。
    function handleAccountsChanged(_accounts) {
      console.log('This page is reloaded because recent account was disconnected.');
      window.location.reload();
    }*/

  };

  //ボイス投稿ボタンが押されたときに呼ばれる関数
  const onPost = async () => {
    
    if( !postModeValue ){
      
      await connectWallet();
      console.log("Clicked onPost!");
      setPostModeValue( true );
    
    }
    else{

      console.log("Clicked onPost!");
      setPostModeValue( false );

    }

  };

  const storeNFT = async (_voice) => {
    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    // call client.store, passing in the image & metadata
    return nftstorage.storeBlob(_voice);
  };

  //登録ボタンが押されたときに呼ばれる関数
  const onSubmit = async (data) => {

    setIsLoadingValue( true );
    
    console.log( data.name );
    console.log( data.gender );
    console.log( data.genre );
    console.log( data.title );
    console.log( data.description );
    console.log( data.isPublic );
    console.log( data.permission );
    console.log( data.voice );

    console.log("Your voice is uploading!");
    
    const voices = data.voice;

    let voiceURL = "";

    for (const voice of voices) {
      const cid = await storeNFT(voice);
      console.log("Your voice uploaded!");
      console.log(cid);
      voiceURL = "https://" + cid + ".ipfs.nftstorage.link/";
    }

    console.log(voiceURL);

    let isPublic;
    let permission; 

    if( data.isPublic === "1" ){ isPublic = true; console.log("isPublic true",isPublic);}
    else{ isPublic = false; console.log("isPublic false",isPublic);}

    if( data.permission === "1" ){ permission = true; console.log("permission true",permission);}
    else{ permission = false; console.log("permission false",permission);}

    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const provider = new ETHERS.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const VPContract = new ETHERS.Contract(CONTRACT_ADDRESS, ABI, signer);

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);

      console.log("post new voice");
      
      //基本情報を登録する
      let submitTxn = await VPContract.post(
        data.name,
        data.gender,
        data.genre,
        voiceURL,
        data.title,
        data.description,
        isPublic,
        permission,
      );
      console.log("Posting...", submitTxn);
      await submitTxn.wait();
      console.log("Posted -- ", submitTxn);

      alert("あなたの新しい音声が投稿できました！");
      
    } catch (error) {
      
      console.log(error);
      alert("投稿失敗");

    }

    setIsLoadingValue( false );

    setPostModeValue( false );

  };

  //ライクされた時に呼ばれる関数
  const like = async (num) => {}

  //コメントするボタンが押された時に呼ばれる関数
  const comment = async (num) => {}

  //チップを送るボタンが押された時に呼ばれる関数
  const tip = async (num) => {}

  // レンダリング関数です。
  const renderNotConnectedContainer = () => (
    <div className="top-wrapper">
      <div className="container">
        <h1 className="top-text">Juicy VOICE</h1>
        <h1 className="top-text">お耳の恋人</h1>
        <div className="btn-wrapper">
          <button
            onClick={connectWallet}
            className="cta-button connect-wallet-button mar"
          >
            こちらからウォレットを接続してください
          </button>
        </div>
      </div>
    </div>
  );

  // 最初のページ。医療従事者と患者で振り分けて、ページの表示を決める
  const renderFirstPage = () => {
    // Polygon Mumbai Testnet上にいない場合、switchボタンをレンダリングします。
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <h2>Please switch to Polygon Mumbai Testnet</h2>
          {/* 今ボタンで switchNetwork 関数を呼び出します。 */}
          <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }
    return (
      <div className="top-wrapper">
        <div className="container">
          <h1 className="top-text">Juicy VOICE</h1>
          <h1 className="top-text">お耳の恋人</h1>
          <div className="btn-wrapper">
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button mar"
            >
              こちらからウォレットを接続してください
            </button>
          </div>
        </div>
      </div>
    )
  };

  // 最初のページ。医療従事者と患者で振り分けて、ページの表示を決める
  const renderGlobalTimeLineContainer = () => {
    return (
      <div>
        <h1>新着ボイス　一覧</h1>
        {/* グローバルタイムラインを表示する */}
        { allVoices
            .slice(0)
            .reverse()
            .map((voice, index) => {
              return (
                <div
                  key={voice.id.toNumber()}
                  className="indivisual-voice"
                >
                  <div>{voice.username}:{voice.gender}　　　　ジャンル: {voice.genre}</div>
                  <div>タイトル: {voice.title}</div>
                  <audio controls src={voice.voice}></audio>
                  <div className="display-left">
                    <div className="margin-right">
                      <button className='cta-button4 connect-wallet-button3' onClick={ () => like(voice.id.toNumber()) }>
                        いいね！👍 {voice.totallikes.toNumber()}
                      </button>
                    </div>
                    <div className="margin-right">
                      <button className='cta-button4 connect-wallet-button3' onClick={ () => comment(voice.id.toNumber()) }>
                        コメントをする
                      </button>
                    </div>
                    {/*<div className="margin-right">
                      <form onSubmit={handleSubmit(tip)} className="formBox">
                        <div className="example">
                          <input type="text" name="name" id="namelabel" placeholder="チップの額を入力"></input>
                          <label>×10の18乗 MATIC</label>
                        </div>
                        <div className="example">
                          <button type="submit" className="cta-button4 connect-wallet-button3" >チップを送る</button>
                        </div>  
                      </form>
                    </div>*/}
                  </div>
                  {/*<div>Address: {voice.address}</div>
                  <div>Time: {voice.timestamp.toString()}</div>
                  <div>username: {voice.username}</div>
                  <div>gender: {voice.gender}</div>
                  <div>genre: {voice.genre}</div>
                  <audio controls src={voice.voice}></audio>
                  <div>title: {voice.title}</div>
                  <div>description: {voice.description}</div>
                  <div>isPublic: {voice.isPublic ? "true" : "false"}</div>
                  <div>haveAuthorityToComment: {voice.haveAuthorityToComment ? "true" : "false"}</div>
                  <div className="submitBox">
                    <button className="waveButton" onClick={ () => like(voice.id.toNumber()) }>
                      👍 {voice.totallikes.toNumber()}
                    </button>
                    <form className="formBox">
                      <div className="example">
                        <input type="text" name="name" id="namelabel" placeholder="0.001"></input>
                        <label>×10の18乗 MATIC</label>
                      </div>
                      <div className="example">
                        <input type="submit" value="チップを送る"></input>
                      </div>  
                    </form>
                  </div>*/}
                </div>
              );
            })}
      </div>
    );
  };

  // 投稿ページをレンダリングする関数
  const renderPostVoiceContainer = () => (
    <div className="form-container">
      <h1>新規ボイス　投稿フォーム</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
      <table className="form-table">
          <tbody>
            <tr>
              <th><label htmlFor="name">お名前</label></th>
              <td className="form-table-marge-left">
                <input id="form-container-name2" {...register('name', { required: true })} autoComplete="name"/>
                {errors.name && <div id="color-red">姓は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th>声の性別</th>
              <td  className="form-table-not-marge">
                <div className="radio-button-field">
                  <label className="radio-label" htmlFor="gender-1">
                    <input
                        {...register("gender", { required: true })}
                        type="radio"
                        value="女性"
                        id="gender-1"
                    />
                    女性
                  </label>
                  <label className="radio-label" htmlFor="gender-2">
                    <input
                        {...register("gender", { required: true })}
                        type="radio"
                        value="男性"
                        id="gender-2"
                    />
                    男性
                  </label>
                  <label className="radio-label" htmlFor="gender-3">
                    <input
                        {...register("gender", { required: true })}
                        type="radio"
                        value="カップル"
                        id="gender-3"
                    />
                    カップル
                  </label>
                </div>
                {errors.gender && <div id="color-red">声の性別は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th>ジャンル</th>
              <td  className="form-table-not-marge">
                <div className="radio-button-field">
                  <label className="radio-label" htmlFor="genre-1">
                    <input
                        {...register("genre", { required: true })}
                        type="radio"
                        value="エロ声"
                        id="genre-1"
                    />
                    エロ声
                  </label>
                  <label className="radio-label" htmlFor="genre-2">
                    <input
                        {...register("genre", { required: true })}
                        type="radio"
                        value="オナ声"
                        id="genre-2"
                    />
                    オナ声
                  </label>
                  <label className="radio-label" htmlFor="genre-3">
                    <input
                        {...register("genre", { required: true })}
                        type="radio"
                        value="体験談"
                        id="genre-3"
                    />
                    体験談
                  </label>
                  <label className="radio-label" htmlFor="genre-4">
                    <input
                        {...register("genre", { required: true })}
                        type="radio"
                        value="私の秘密"
                        id="genre-4"
                    />
                    私の秘密
                  </label>
                  <label className="radio-label" htmlFor="genre-5">
                    <input
                        {...register("genre", { required: true })}
                        type="radio"
                        value="その他"
                        id="genre-5"
                    />
                    その他
                  </label>
                </div>
                {errors.genre && <div id="color-red">ジャンルは必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th><label htmlFor="title">タイトル</label></th>
              <td className="form-table-not-marge">
                <input id="form-container-name2" {...register('title', { required: true })} />
                {errors.title && <div id="color-red">タイトルは必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th><label htmlFor="description">詳細</label></th>
              <td className="form-table-not-marge">
                <textarea id="form-container-name2" {...register('description', { required: false })} placeholder="" />
              </td>
            </tr>
            <tr>
              <th>公開・非公開</th>
              <td  className="form-table-not-marge">
                <div className="radio-button-field">
                  <label className="radio-label" htmlFor="isPublic-1">
                    <input
                        {...register("isPublic", { required: true })}
                        type="radio"
                        value="1"
                        id="isPublic-1"
                    />
                    公開
                  </label>
                  <label className="radio-label" htmlFor="isPublic-2">
                    <input
                        {...register("isPublic", { required: true })}
                        type="radio"
                        value="0"
                        id="isPublic-2"
                    />
                    非公開
                  </label>
                </div>
                {errors.permission && <div id="color-red">公開・非公開は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th>コメント</th>
              <td  className="form-table-not-marge">
                <div className="radio-button-field">
                  <label className="radio-label" htmlFor="permission-1">
                    <input
                        {...register("permission", { required: true })}
                        type="radio"
                        value="1"
                        id="permission-1"
                    />
                    許可する
                  </label>
                  <label className="radio-label" htmlFor="permission-2">
                    <input
                        {...register("permission", { required: true })}
                        type="radio"
                        value="0"
                        id="permission-2"
                    />
                    禁止する
                  </label>
                </div>
                {errors.permission && <div id="color-red">コメントの可否は必須の項目です</div>}
              </td>
            </tr>
            <tr>
              <th><label htmlFor="title">音声ファイル</label></th>
              <td className="form-table-not-marge">
                <div className="nftUplodeBox">
                  <button>
                    ファイルを選択
                    <input className="nftUploadInput" type="file" {...register("voice", { required: true })}/>
                  </button>
                  {errors.voice && <div id="color-red">音声ファイルは必須の項目です</div>}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="textcenter">
          { !isLoadingValue ? <button type="submit" className="cta-button connect-wallet-button" >新規投稿</button> : <ColorRing/> }
        </div>
      </form>
    </div>
  );

  // currentAccount, network が変わるたびに実行されます。
  useEffect(() => {
    if (network === 'Polygon Mumbai Testnet') {
    }
  }, [currentAccount, network]);

  //ページがロードされた時に走る処理
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      
      <header>
        <div className="container">
          <div className="header-left">
            <img heght="45px" width="45px" alt="Twitter Logo" className="logo" src={headerLogoImage} />
          </div>
          <div className="header-left">
            <p className="header-title">Juicy Voice</p>
          </div>
          <span className="fa fa-bars menu-icon"></span>
    
          <div className="header-right">
            {!postModeValue ?
              <button className="cta-button2 connect-wallet-button" onClick={()=>onPost()} > ボイス投稿 </button> : 
              <button className="cta-button2 connect-wallet-button" onClick={()=>onPost()} > 前に戻る </button>
            }
            { !currentAccount ?
              <button className="cta-button2 connect-wallet-button" onClick={()=>connectWallet()} >ログイン</button> : 
              <button className="cta-button2 connect-wallet-button" onClick={()=>connectWallet()} >アカウント</button> 
            }
          </div>
        </div>
      </header>

      <div  className="pages-for-second-pages">

        { !currentAccount && renderFirstPage()}
        {/* グローバルタイムラインをレンダリングします。 */}
        { currentAccount && !postModeValue && renderGlobalTimeLineContainer()}
        {/* ボイス投稿ボタンが押された時の投稿フォームをレンダリングします。 */}
        { currentAccount && postModeValue && renderPostVoiceContainer()}

      </div>

      <footer>
        <div className="container">
          <img alt="Twitter Logo" src={footerLogoImage} />
          <p>Human Health Care on web3</p>
        </div>
      </footer>

    </div>
  );

}

export default App;