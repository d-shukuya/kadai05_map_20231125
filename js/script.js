//****************************************
//import firebase
//****************************************
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
  onChildRemoved,
  onChildChanged,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";

//****************************************
//変数定義
//****************************************

// firebase

// map
let watchId;
let map;
let myPin;

// その他
let myId;
let myLocation = {
  name: "",
  wantToDo: "",
  initial: "",
};

//****************************************
//firebase設定
//****************************************
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let locationRef = ref(db, `RealLocation/location`);
let myLocationRef = ref(db, `RealLocation/location/${myId}`);

//****************************************
//成功関数
//****************************************

function mapsInit(position) {
  console.log(position, "取得");
  //lat=緯度、lon=経度 を取得
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  //Map表示
  map = new Microsoft.Maps.Map("#myMap", {
    center: new Microsoft.Maps.Location(lat, lon),
    mapTypeId: Microsoft.Maps.MapTypeId.load,
    zoom: 18,
  });

  //pinを登録
  set(myLocationRef, {
    name: myLocation.name,
    wantToDo: myLocation.wantToDo,
    initial: myLocation.initial,
  });

  //Pinを追加
  myPin = new Microsoft.Maps.Pushpin(
    { latitude: lat, longitude: lon },
    {
      color: "red",
    }
  );
  map.entities.push(myPin);
}

//****************************************
//失敗関数
//****************************************
function mapsError(error) {
  let e = "";
  if (error.code == 1) {
    //1＝位置情報取得が許可されてない（ブラウザの設定）
    e = "位置情報が許可されてません";
  }
  if (error.code == 2) {
    //2＝現在地を特定できない
    e = "現在位置を特定できません";
  }
  if (error.code == 3) {
    //3＝位置情報を取得する前にタイムアウトになった場合
    e = "位置情報を取得する前にタイムアウトになりました";
  }
  alert("エラー：" + e);
}

//****************************************
//オプション設定
//****************************************
const setting = {
  enableHighAccuracy: true, //より高精度な位置を求める
  maximumAge: 20000, //最後の現在地情報取得が20秒以内であればその情報を再利用する設定
  timeout: 10000, //10秒以内に現在地情報を取得できなければ、処理を終了
};

//最初に実行する関数
function GetMap() {
  watchId = navigator.geolocation.watchPosition(mapsInit, mapsError, setting);
}

function CloseMap() {
  navigator.geolocation.clearWatch(watchId);
}

//****************************************
//イベント
//****************************************

// ロード時の処理
$(window).on("load", function () {
  GetMap();
  myId = CreateId();
});

// クローズ時の処理
$(window).on("beforeunload", function () {
  CloseMap();
});

// 名前入力
$("#name").on("change", function () {
  const name = $(this).val();
  myLocation.name = name;
  myLocation.initial = getInitial(name);

  //Pinを追加
  const pin = new Microsoft.Maps.Pushpin(
    { latitude: lat, longitude: lon },
    {
      color: "red",
      title: myLocation.name,
      subTitle: myLocation.wantToDo,
      text: myLocation.initial,
    }
  );
  map.entities.push(pin);
});

// やりたいこと入力
$("#want_to_do").on("change", function () {
  myLocation.wantToDo = $(this).val();

  //Pinを追加
  const pin = new Microsoft.Maps.Pushpin(
    { latitude: lat, longitude: lon },
    {
      color: "red",
      title: myLocation.name,
      subTitle: myLocation.wantToDo,
      text: myLocation.initial,
    }
  );
  map.entities.push(pin);
});

//****************************************
//関数
//****************************************

// ID作成
function CreateId() {
  return generateRandomString(10);
}

function generateRandomString(length) {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function getInitial(name) {
  return name.substr(0, 1);
}
