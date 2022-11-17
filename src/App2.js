import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from "react";

import { NFTStorage } from 'nft.storage';

import { useForm } from 'react-hook-form';

function App() {

  const { register, handleSubmit, formState: { errors } } = useForm();

  const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNFRkRCYWI4NGE4RjhhOWEyQjM0RTBkNmQ5RTFhMjdCMUUwNzYwMjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2ODA4MzgxNDI0NiwibmFtZSI6Ikp1aWxsaWFyZCJ9.u2WR7t81CGk9JvB13aEy4m4IJaeP_0zCkk-lKSqFPgk';

  const storeNFT = async (image) => {
    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    // call client.store, passing in the image & metadata
    return nftstorage.storeBlob(image);
  };

  //再登録ボタンが押されたときに呼ばれる関数
  const onSubmit = async (data) => {

    const images = data.voice;

    let img = "";

    for (const image of images) {
      const cid = await storeNFT(image);
      console.log("Your picture uploaded!");
      console.log(cid);
      img = "https://" + cid + ".ipfs.nftstorage.link/";
    }

    console.log(img);

  }

  //既に基本情報が登録されている場合の表示をレンダリングする関数
  const renderRegisteredUpLoaderContainer = () => (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="outerBox">  
          <div className="title">
            <h2>顔写真をご登録ください</h2>
            <p>縦横が同じ長さの正方形の画像を１枚</p>
            <p>肩から上の正面を向いた顔写真</p>
            <p>３ヶ月以内に撮影されたもの</p>
          </div>
          
          <div className="nftUplodeBox">
            <button>
              ファイルを選択
              <input className="nftUploadInput" type="file" {...register("voice", { required: true })}/>
            </button>
          </div>
        </div>
        {errors.voice && <div id="color-red">voiceは必須の項目です</div>}
        <div>
          <h2>雫が落ちる音</h2>
          <audio controls src="https://bafkreibkoik76dhftuvdnz6gwkmawqw4dbfzcwkq3x57yw6ol2khjb73om.ipfs.nftstorage.link/"></audio>
        </div>
        <div className="textcenter">
          <button type="submit" className="cta-button connect-wallet-button" >登録</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        {renderRegisteredUpLoaderContainer()}
      </header>
    </div>
  );
}

export default App;
