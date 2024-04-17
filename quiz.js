"use userstrict";

/* ==============================================
 基本データ
 ================================================ */

//  地理のクイズデータ
const data = [
    {
        question: "日本で一番面積の大きい都道府県は？",
        answers: ["北海道", "京都", "青森", "岩手",],
        correct: "北海道"
    },
    {
        question: "日本で一番人口の多い都道府県は？",
        answers: ["北海道", "東京都", "青森", "岩手",],
        correct: "東京都"
    },
    {
        question: "日本で一番人口密度の高い都道府県は？",
        answers: ["北海道", "東京都", "青森", "岩手",],
        correct: "東京都"
    }
]

// 出題する問題数
const QUESTION_LENGTH = 3;
// 解答時間(ms)
const ANSWER_TIME_MS = 10000;
// 
const INTERVAL_TIME_MS = 10;

let startTime = null;
// インターバルID
let IntervalID = null;

// 解答中の経過時間
let elapsedTime = 0;

// 出題する問題データ
let questions = [];
// 出題する問題のインデックス
let questionIndex = 0;
// 正解数
let correctCount = 0;



/* ==============================================
 要素一覧
 ================================================ */

const startPage = document.getElementById("startPage");
const questionPage = document.getElementById("questionPage");
const resultPage = document.getElementById("resultPage");

const startButton = document.getElementById("startButton");

const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const optionButton = document.querySelectorAll("#questionPage button");
const questionProgress = document.getElementById("questionProgress");

const resultMessage = document.getElementById("resultMessage");
const backButton = document.getElementById("backButton");

const dialog = document.getElementById("dialog");
const questionResult = document.getElementById("questionResult");
const nextButton = document.getElementById("nextButton");



/* ==============================================
 処理
 ================================================ */

startButton.addEventListener("click", clickstartButton);

for (let i = 0; i < optionButton.length; i++){
    optionButton[i].addEventListener("click", clickoptionButton);
}
// optionButton.forEach((button) => {
//     button.addEventListener("click", clickoptionButton)
// });

nextButton.addEventListener("click", clickNextButton);

backButton.addEventListener("click", clickBackButton);

/* ==============================================
 関数一覧
 ================================================ */

function questionIntervalOver() {
    // 
    questionResult.innerText = "×";
    // 
    
    if (isQuestion()) {
        nextButton.innerText = "結果を見る";
    } else {
        nextButton.innerText = "次の問題へ";
    }
    // 
    dialog.showModal();
    
}

function startProgress() {
    // 開始時間(タイムスタンプ)を取得する
    startTime = Date.now();
    // インターバルを開始する
    IntervalID = setInterval(() => {
        const currectTime = Date.now();
        // 現在時刻(タイムスタンプ)を取得する
        const progress = ((currectTime - startTime) / ANSWER_TIME_MS) * 100;
        // progressバーに経過時間を反映(表示)する
        questionProgress.value = progress;
        // 経過時間が解答時間を超えた場合、インターバルを停止する
        if (startTime + ANSWER_TIME_MS <= currectTime) {
            stopProgress();
            questionIntervalOver();
            return;
        }
        // 経過時間を更新(加算)する
        elapsedTime += INTERVAL_TIME_MS;
    }, INTERVAL_TIME_MS);
}

function stopProgress() {
    // インターバルを停止する
    if (IntervalID !== null) {
        clearInterval(IntervalID);
        IntervalID = null;
    }
}


function reset() {
    // 出題する問題をランダムに取得する
    questions = getRandomQuestion();
    // 出題する問題のインデックスの初期化
    questionIndex = 0;
    // 正解数の初期化
    correctCount = 0;
    // インターバルIDを初期化する
    IntervalID = null;
    // 解答中の経過時間を初期化する
    elapsedTime = 0;
    startTime = null;
    // ボタンを有効か
    for (let i = 0; i < optionButton.length; i++) {
        optionButton[i].removeAttribute("disabled");
    }
}

function isQuestion() {
    // 問題数が最後かどうか
    return questionIndex + 1 === QUESTION_LENGTH;
}

function getRandomQuestion() {
    // 出題する問題数のインデックスリスト
    const questionIndexlist = [];
    while (questionIndexlist.length !== QUESTION_LENGTH) {
        // 出題する問題のインデックスをランダムに生成する
        const index = Math.floor(Math.random() * data.length);
        // インデックスリストに含まれ邸内場合、インデックスリストに追加する
        if (!questionIndexlist.includes(index)) {
            questionIndexlist.push(index);
        }
    }
    // 出題する問題リストを取得する
    const questionlist = questionIndexlist.map((index) => data[index]);
    return questionlist;
}

function setQestion() {
    // 問題を取得する
    const question = questions[questionIndex];
    // 問題番号を表示する
    questionNumber.innerText = `第 ${questionIndex + 1} 問`;
    // 問題文を表示する
    questionText.innerText = question.question;
    // 選択肢を表示する
    for (let i = 0; i < optionButton.length; i++) {
        optionButton[i].innerText = question.answers[i];
    }
}

/*===============================================
 イベント関連の関数一覧
 ================================================ */

function setResult() {
    // 正解率
    const accuracy = Math.floor((correctCount / QUESTION_LENGTH) * 100);
    // 正解率を表示する
    resultMessage.innerText = `正解率: ${accuracy}%`
}

function clickoptionButton(event) {
    // 解答中の経過時間を停止する
    stopProgress();
    // すべての選択肢を無効化する
    optionButton.forEach((button) => {
        button.disabled = true;
    });

    // 選択肢のテキストを取得する
    const optionText = event.target.innerText;
    // 正解のテキストを取得する
    const correctText = questions[questionIndex].correct;

    if (optionText === correctText) {
        correctCount++;
        questionResult.innerText = "〇";
    } else {
        questionResult.innerText = "×";
    }

    // 最後の問題かどうかを判定する 
    if (isQuestion()) {
        nextButton.innerText = "結果を見る";
    } else {
        nextButton.innerText = "次の問題へ";
    }

    // ダイアログ
    dialog.showModal();
}

function clickstartButton() {
    // クイズをリセットする
    reset();
    // 問題画面に問題を設定する
    setQestion();
    // 解答の計測を設定する
    startProgress();
    // スタート画面を非表示にする
    startPage.classList.add("hidden");
    // 問題画面を表示する
    questionPage.classList.remove("hidden");
    // 結果画面を非表示にする
    resultPage.classList.add("hidden");
}

function clickNextButton() {
    if (isQuestion()) {
        // 結果画面に正解率を設定する
        setResult();
        // 正解・不正解のダイアログを閉じる
        dialog.close();
        // 問題画面を非表示する
        questionPage.classList.add("hidden");
        // 結果画面を表示にする
        resultPage.classList.remove("hidden");
    } else {
        optionButton.forEach((button) => {
            button.disabled = false;
        });
        // 問題のインデックスを更新する
        questionIndex++;
        // 問題を設定する
        setQestion();
        // IDの初期化
        IntervalID = null;
        // 経過時間の初期化
        elapsedTime = 0;
        // 正解・不正解のダイアログを閉じる
        dialog.close();
        // 計測開始
        startProgress
    }
}

function clickBackButton() {
    // スタート画面を表示にする
    startPage.classList.remove("hidden");
    // 問題画面を非表示する
    questionPage.classList.add("hidden");
    // 結果画面を非表示にする
    resultPage.classList.add("hidden");
}