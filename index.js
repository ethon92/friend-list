'use strict'

// 宣告變數並放入API網址
const BASE_URL = "https://lighthouse-user-api.herokuapp.com/"
const INDEX_URL = "api/v1/users/"

// 宣告變數cardBox並選出呈現人物資料的部份
const cardBox = document.querySelector('#card-box')
// 宣告變數paginationBox並選出分頁部份
const paginationBox = document.querySelector("#pagination-box")
// 宣告變數modalContent並選出modal的內容
const modalContent = document.querySelector(".modal-content")
// 宣告變數personInfo的空陣列
const personInfo = []
// 宣告變數per_page_person並放入每頁呈現多少人物資料
const per_page_person = 24
// 宣告變數searchForm並選出form標籤
const searchForm = document.querySelector("#search-form")
// 宣告變數searchInput並選出input標籤
const searchInput = document.querySelector("#search-input")
// 宣告空的filteredFriends變數
let filteredFriends = []


// 利用axios向API抓取資料
axios.get(BASE_URL + INDEX_URL).then(response => {
  const data = response["data"]["results"]
  personInfo.push(...data)
  // 呼叫displayCard函式
  displayCard(getPersonByPage(1))
  // 呼叫displayPagination函式
  displayPagination(personInfo)
})//   當連線有錯誤時
  .catch((error) => {
    if (error.reponse) {
      //         當已經與server連線後所回傳的response有錯誤時
      //         即為 2XX 的code
      console.log(response.data);
      console.log(response.status);
      console.log(response.headers);
    } else if (error.request) {
      //         當有傳送出request但沒有response的時候
      console.log(error.request);
    } else {
      //         當在設定的時露所發生錯誤的訊息
      console.log("Error", error.message);
    }
    console.log(error.config);
  });

// 在分頁上放置監聽器
paginationBox.addEventListener("click", displayPersonByPage)

// 在cardBox上放監聽器
cardBox.addEventListener("click", onCardBoxClicked)

// 在searchForm上放submit事件監聽器
searchForm.addEventListener("submit", onSearchFormSubmitted)

// 在searchForm上放keyup事件監聽器
searchForm.addEventListener("keyup", onSearchFormByKeyin)

// 宣告onSearchFormByKeyin函式
function onSearchFormByKeyin(event){

  // 宣告變數keyword並放入滑鼠點擊到input方框時所輸入的值
  const keyword = event.target.value
  
  // 從personInfo裡尋找出含有keyword的人物資料
  filteredFriends = personInfo.filter( person => {
    const fullName = person.name + person.surname
    return fullName.toLowerCase().includes(keyword)
  })

  // 當filteredFriends為空陣列時(即為搜尋不到輸入文字的人名時)
  if (filteredFriends.length === 0) {

    // 將cardBox清空
    cardBox.innerHTML = ""

    // 回傳displayPagination函式並結束onSearchFormByKeyin函式
    return displayPagination(filteredFriends)
  }

  // 呼叫displayPagination函式
  displayPagination(filteredFriends)

  // 呼叫displayCard函式
  displayCard(getPersonByPage(1))
}


// 宣告onSearchFormSubmitted函式
function onSearchFormSubmitted(event) {

  // 停止瀏覽器預設事件，在此即為傳送表單時，會重新載入首頁
  event.preventDefault()

  // 宣告keyword變數並選出input的值
  const keyword = searchInput.value.trim().toLowerCase()

  // 利用filter尋找出與輸入文字相同的名字
  filteredFriends = personInfo.filter( person => {
    const fullName = person.name + person.surname
    return fullName.toLowerCase().includes(keyword)
  })

  if(filteredFriends.length === 0){
    return alert("找不到含有你輸入文字的人名!!")
  }

  // 呼叫displayPagination函式渲染頁數
  displayPagination(filteredFriends)

  // 呼叫displayCard函式呈現第一頁
  displayCard(getPersonByPage(1))
}


// 宣告onCardBoxClicked函式
function onCardBoxClicked(event) {
  const id = Number(event.target.id)
  const target = event.target

  // 如果點擊到圖片呈現個人詳細資訊
  if (target.matches("img")) {
    displayPersonModal(id)
    // 如果點擊到愛心則加朋友
  } else if (target.matches("i")) {
    addFriends(id)
  }
}


// 宣告displayPersonByPage函式
function displayPersonByPage(event) {
  const id = event.target.id
  const children = paginationBox.children

  // 移除在class中已經有active的頁數
  for (let child of children) {
    if (child.classList.contains("active")) {
      child.classList.remove("active")
    }
  }
  // 呼叫displayCard
  displayCard(getPersonByPage(id))
  // 呼叫addActive
  addActive(event)
}

// 宣告displayPersonModal函式
function displayPersonModal(id) {
  //   利用axios與api連線
  axios
    .get(BASE_URL + INDEX_URL + id)
    .then((response) => {
      //     宣告變數data並放入response中所需要的資料
      const data = response["data"];
      //     宣告變數name並放入firstname與surname
      const name = data["name"] + " " + data["surname"];
      //     宣告變數rawHTML並放入所需的HTML架構與變數
      const rawHTML = `
        <div class="modal-header">
          <h5 class="modal-title" id="modal-name">${name}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
           </button>
        </div>
        <div class="modal-body">
          <div class="persone-image d-flex justify-content-center">
            <img src="${data["avatar"]}" class="rounded-circle">
          </div>
          <div class="d-flex flex-column align-items-center mt-5">
            <p>Gender: ${data["gender"]}</p>
            <p>Age: ${data["age"]}</p>
            <p>Region: ${data["region"]}</p>
            <p>Birthday: ${data["birthday"]}</p>
            <p>Email: ${data["email"]}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      `;
      //     將modalContent中的HTML換成rawHTML
      modalContent.innerHTML = rawHTML;
    })
    //   當連線有錯誤時
    .catch((error) => {
      if (error.reponse) {
        //         當已經與server連線後所回傳的response有錯誤時
        //         即為 2XX 的code
        console.log(response.data);
        console.log(response.status);
        console.log(response.headers);
      } else if (error.request) {
        //         當有傳送出request但沒有response的時候
        console.log(error.request);
      } else {
        //         當在設定的時露所發生錯誤的訊息
        console.log("Error", error.message);
      }
      console.log(error.config);
    });
}



// 宣告addFriends函式
function addFriends(id) {

  // 宣告變數list放入提取localStorage中的資料或是空陣列
  // 如果前方item為true則回傳前方item，反之則回傳空陣列
  // 若前方與後方同時都為true時，則以前方為優先
  // 要提出localStorage中的資料時，需要利用JSON.parse()先將裡面的資料從string轉成array或object
  const friends = JSON.parse(localStorage.getItem("favoritePerson")) || []

  // 宣告變數findPerson並利用find找出點擊到的人物id
  const findPerson = personInfo.find(person => person.id === id)

  // 利用some找出點擊已經加為好友的人，並回傳deleteFriends函式
  if (friends.some(person => person.id === id)) {
    return deleteFriends(id, friends)
  }

  // 將findPerson放入list中 
  friends.push(findPerson)

  // 最後在將list並利用JSONstringfy轉成字串放入localStorge中
  localStorage.setItem("favoritePerson", JSON.stringify(friends))

  // 呼叫changeHeart函式
  changeHeart(findPerson)
}

// 宣告deleteFriends函式
function deleteFriends(id, friends) {

  // 宣告變數indexInFriends利用findIndex找出要刪除的人物在friends中的位置
  const indexInFriends = friends.findIndex(person => person.id === id)

  // 如果filteredFriends有值時(即在搜尋頁面刪除時)
  // indexInData要放入filteredFriends，反之則放入personInfo
  const data = filteredFriends.length ? filteredFriends : personInfo
  const indexInData = data.findIndex(person => person.id === id)

  // 宣告變數deletePage並選出該刪除人物所在的頁數
  const deletePage = Math.ceil(indexInData / per_page_person)

  if (confirm("你確定要刪除好友?")) {
    // 利用splice將人物刪除
    friends.splice(indexInFriends, 1)

    // 刪除後在將friends放回localStorge中
    localStorage.setItem("favoritePerson", JSON.stringify(friends))

    // 呼叫displayCard函式可立即呈現刪除的效果
    displayCard(getPersonByPage(deletePage))

    // 呼叫displayDeletePagination函式可使刪除後停留在當下頁面
    displayDeletePagination(data, deletePage)
  }
}

// 宣告displayDeletePagination函式
// 將"需要刪除人物的頁數"傳入
function displayDeletePagination(data, deletePage) {
  const totalPage = Math.ceil(data.length / per_page_person)
  let rawHTML = ""
  for (let page = 1; page <= totalPage; page++) {
    // 當page是deletePage時
    // 頁數還是停留在deletePage
    if (page === deletePage) {
      rawHTML += `
        <li class="page-item active"><a class="page-link" href="#"  id="${page}">${page}</a></li>
      `
    } else {
      rawHTML += `
      <li class="page-item"><a class="page-link" href="#"  id="${page}">${page}</a></li>
    `
    }
  }
  paginationBox.innerHTML = rawHTML
}

// 宣告changeHeart函式並將空心愛心換成實心愛心
function changeHeart(person) {

  // 宣告hearts變數並選出所有含有fa-heart標籤
  const hearts = document.querySelectorAll(".fa-heart")

  // 當heatrs的id等於點擊person的id時
  // 將空心愛心換成實心愛心
  hearts.forEach(heart => {
    if (Number(heart.id) === person.id) {
      heart.classList.remove("far")
      heart.classList.add("fas")
    }
  })
}

// 宣告addActive函式
// 當點擊到哪一頁就將哪一頁的li標籤class內加入active
function addActive(event) {
  const parent = event.target.parentElement
  parent.classList.add("active")
}


// 宣告getPersonByPage函式
// 指定開始與結束的index並利用slice擷取出該頁需要呈現的人物資料
function getPersonByPage(page) {
  const startIndex = (page - 1) * per_page_person
  const endIndex = startIndex + per_page_person
  const data = filteredFriends.length ? filteredFriends : personInfo

  return data.slice(startIndex, endIndex)
}

// 宣告displayPagination函式將總頁數呈現
function displayPagination(amount) {
  const totalPage = Math.ceil(amount.length / per_page_person)
  let rawHTML = ""
  
  // 當totalPage不為零時，首頁要有active標籤
  if(totalPage !== 0){
    rawHTML += `
    <li class="page-item active"><a class="page-link" href="#"  id="1">1</a></li>
  `
  }
 
  // 剩下的頁數用for迴圈串接
  for (let page = 2; page <= totalPage; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#"  id="${page}">${page}</a></li>
    `
  }
  paginationBox.innerHTML = rawHTML
}

// 宣告displayCard函式並呈現每張人物資料
function displayCard(database) {
  let rawHTML = ""

  // 利用forEach串接出每筆人物資料
  database.forEach(data => {
    const fullName = data["name"] + " " + data["surname"]
    const id = data["id"]
    rawHTML += `
      <div class="card m-2" style="width: 10rem;">
        <div class="heart-icon text-right pr-3 pt-3">
          <i class="far fa-heart" id="${id}"></i>
        </div>
        <img src="${data["avatar"]}" class="card-img-top rounded-circle p-3" id="${id}" alt="person-image" data-toggle="modal" data-target="#personModal">
        <div class="card-body">
          <p class="card-text font-weight-bold">${fullName}</p>
        </div>
      </div>
    `
  });
  cardBox.innerHTML = rawHTML

  // 呼叫displayLikedFriend函式渲染實心愛心
  displayLikedFriend()
}

// 宣告displayLikedFriend函式並將已經加入的好友呈現實心愛心
function displayLikedFriend() {
  const friends = JSON.parse(localStorage.getItem("favoritePerson")) || []
  const hearts = document.querySelectorAll(".fa-heart")


  // 當heatrs的id等於點擊person的id時
  // 將空心愛心換成實心愛心
  hearts.forEach(heart => {
    for (let friend of friends) {
      if (Number(heart.id) === friend.id) {
        heart.classList.remove("far")
        heart.classList.add("fas")
      }
    }
  })
}

