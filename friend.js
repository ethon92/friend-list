'use strict'

const BASE_URL = "https://lighthouse-user-api.herokuapp.com/"
const INDEX_URL = "api/v1/users/"

const cardBox = document.querySelector('#card-box')
const paginationBox = document.querySelector("#pagination-box")
const modalContent = document.querySelector(".modal-content")
// 宣告變數personInfo並改成localStorge的資料或空陣列
const personInfo = JSON.parse(localStorage.getItem("favoritePerson")) || []
const per_page_person = 24

// 呼叫displayCard函式
displayCard(getPersonByPage(1))

// 呼叫displayPagination函式
displayPagination(personInfo)

// 在paginationBox上加監聽器
paginationBox.addEventListener("click", displayPersonByPage)

// 在cardBox上加監聽器
cardBox.addEventListener("click", onCardBoxClicked)

// 宣告onCardBoxClicked函式
function onCardBoxClicked(event) {
  const id = Number(event.target.id)
  const target = event.target
  if (target.matches("img")) {
    displayPersonModal(id)
  } else if (target.matches("i")) {
    // 呼叫deleteFriends函式
    deleteFriends(id)
  }

}

// 宣告displayPersonByPage函式
function displayPersonByPage(event) {
  const id = event.target.id
  const children = paginationBox.children
  for (let child of children) {
    if (child.classList.contains("active")) {
      child.classList.remove("active")
    }
  }
  displayCard(getPersonByPage(id))
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

// 宣告deleteFriends函式
function deleteFriends(id) {

  // 宣告變數personIndex利用findIndex找出要刪除的人物在personInfo中的位置
  const personIndex = personInfo.findIndex( person => person.id === id)

  // 宣告變數deletePage並選出該刪除人物所在的頁數
  // 要加一是因為如果刪除的是index為零的人物時，deletePage會為零
  // 導致displayCard會渲染出空的畫面
  const deletePage = Math.ceil(( personIndex + 1 ) / per_page_person)
  
  if (confirm("你確定要刪除好友?")) {
    // 利用splice將人物刪除
    personInfo.splice(personIndex, 1)

    // 刪除後在將friends放回localStorge中
    localStorage.setItem("favoritePerson", JSON.stringify(personInfo))

    // 呼叫displayCard函式可立即呈現刪除的效果
    displayCard(getPersonByPage(deletePage))

    // 呼叫displayDeletePagination函式可使刪除後停留在當下頁面
    displayDeletePagination(personInfo, deletePage)
  }
}

// 宣告addActive函式
function addActive(event) {
  const parent = event.target.parentElement
  parent.classList.add("active")
}

// 宣告getPersonByPage函式
function getPersonByPage(page) {
  const startIndex = (page - 1) * per_page_person
  const endIndex = startIndex + per_page_person

  return personInfo.slice(startIndex, endIndex)
}

// 宣告displayPagination函式
function displayPagination(data) {
  const totalPage = Math.ceil(data.length / per_page_person)
  
  let rawHTML = ""

  // 當totalPage不為零時，即為personInfo內有值時才要顯示第一頁
  if(totalPage !== 0){
    rawHTML += `
        <li class="page-item active"><a class="page-link" href="#"  id="1">1</a></li>
      `
  }
  
  for (let page = 2; page <= totalPage; page++) {
      rawHTML += `
      <li class="page-item"><a class="page-link" href="#"  id="${page}">${page}</a></li>
    `
  }
  paginationBox.innerHTML = rawHTML
}

// 宣告displayDeletePagination函式
// 將"需要刪除人物的頁數"傳入
function displayDeletePagination(data, deletePage){
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

// 宣告displayCard函式
function displayCard(database) {
  let rawHTML = ""
  database.forEach(data => {
    const fullName = data["name"] + " " + data["surname"]
    const id = data["id"]
    rawHTML += `
      <div class="card m-2" style="width: 10rem;">
        <div class="heart-icon text-right pr-3 pt-3">
          <i class="fas fa-heart" id="${id}"></i>
        </div>
        <img src="${data["avatar"]}" class="card-img-top rounded-circle p-3" id="${id}" alt="person-image" data-toggle="modal" data-target="#personModal">
        <div class="card-body">
          <p class="card-text font-weight-bold">${fullName}</p>
        </div>
      </div>
    `
  });
  cardBox.innerHTML = rawHTML
}


