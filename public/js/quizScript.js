let correctOnFirstTry = 0;
let firstTry = true;
let secondTry = false;
let totalNumQuestions = 0;


// Get the modal
let modal = document.getElementById('myModal');
const startModal = document.getElementById('startModal');

// const green = "#22bc00";
const questions = {};
let quizReady = false;
questions['answerIndex'] = -1;
questions['numQuestions'] = -1;
questions['curQuestion'] = 0;
let firstQuestion = true;

let queuedQuiz = {};
let bank = {};
bank['coinBanks'] = 0;
bank['armoredCars'] = 0;
bank['moneyBags'] = 0;
bank['goldCoinStacks'] = 0;
bank['goldCoins'] = 0;
bank['silverCoins'] = 0;
if (sessionStorage.getItem('totalPoints') === null) {
    sessionStorage.setItem('totalPoints', "0");
}
bank['totalPoints'] = parseInt(sessionStorage.getItem('totalPoints'));

let progress = {};
progress['totalRight'] = 0;
progress['totalWrong'] = 0;
progress['quizzes'] = [];
progress['words'] = {};
progress['subcategories'] = {};
if (sessionStorage.getItem('progress') === null) {
    sessionStorage.setItem('progress', JSON.stringify(progress));
}
progress = JSON.parse(sessionStorage.getItem('progress'));

// bank['newRight'] = 0;
const quizRefreshPath = window.redirectLocation + '/quizRefresh';
const subcategory = window.subcategory;
const parentCategory = window.parentCategory;

const emptySubcategoryProgress = {"parentCategory": parentCategory, "right": 0, "wrong": 0};
let subcategoryProgress = getOrDefault(progress.subcategories, subcategory, emptySubcategoryProgress);

const currentDate = getCurrentDate();
let thisQuizProgress = {"subcategory": subcategory, "parentCategory": parentCategory, "right":[], "wrong": [], "date": currentDate};
let currentAnswerAudio;

$( document ).ready(function() {
    // console.log("quiz refresh path: " + quizRefreshPath);
    questions['quiz'] = window.sharedInfo.quiz;

    questions.numQuestions = questions.quiz.length;
    totalNumQuestions = questions.numQuestions;
    SetupQuiz(questions);
    quizReady = true;



    $("#begin-quiz").click(function() {
        startModal.style.display = "none";

        setTimeout(function() {
            $("#answer-audio").trigger('play');
        }, 500);

        $.get(quizRefreshPath, function(data, status){
            // console.log("refresh data: " + data.quiz);
            queuedQuiz = data.quiz;
        });
    });

    //save progress before exiting the quiz
    $("#backButton").click(function() {
        saveProgress();
        window.location.href = window.redirectLocation;
    });


    $("#homeButton").click(function() {
        saveProgress();
        window.location.href = "/street?store=" + window.categoryNum;
    });

    $("#repeatButton").click(function() {
        if (quizReady === true) {
            $("#answer-audio").trigger('play');
        }
    });


    // get the button that closes the quiz complete modal
    // const quizDoneButton = document.getElementById("quiz-complete-button");

    // When the user clicks the done button, return to the subcategory
    // quizDoneButton.onclick = function() {
    //     window.location.href = window.redirectLocation;
    // };

    $("#top-left").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 0) {
                ResetColors();
                $("#top-left").addClass('correct');
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                // alert("Wrong Answer");
                $("#top-left").addClass('incorrect');
                handleIncorrect();
                $("#incorrect-sound").trigger('play');
            }
        }
    });

    $("#top-right").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 1) {
                ResetColors();
                $("#top-right").addClass('correct');
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                // alert("Wrong Answer");
                $("#top-right").addClass('incorrect');
                handleIncorrect();
                $("#incorrect-sound").trigger('play');
            }
        }
    });

    $("#bottom-left").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 2) {
                ResetColors();
                $("#bottom-left").addClass('correct');
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                // alert("Wrong Answer");
                $("#bottom-left").addClass('incorrect');
                handleIncorrect();
                $("#incorrect-sound").trigger('play');
            }
        }
    });

    $("#bottom-right").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 3) {
                ResetColors();
                $("#bottom-right").addClass('correct');
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                $("#bottom-right").addClass('incorrect');
                handleIncorrect();
                $("#incorrect-sound").trigger('play');
                // alert("Wrong Answer");
            }
        }
    });


});

function saveProgress() {
    if(thisQuizProgress.right.length > 0 || thisQuizProgress.wrong.length > 0) {
        progress.quizzes.push(thisQuizProgress);
        progress.subcategories[subcategory] = subcategoryProgress;
    }
    sessionStorage.setItem('progress', JSON.stringify(progress));
}

function handleIncorrect() {
    if (secondTry) {
        secondTry = false;
    }
    if (firstTry) {
        secondTry = true;
        firstTry = false;
    }
}

function ResetColors() {
    $("#top-left").removeClass("correct incorrect");
    $("#top-right").removeClass("correct incorrect");
    $("#bottom-left").removeClass("correct incorrect");
    $("#bottom-right").removeClass("correct incorrect");
}

function QuizComplete(questions) {
    // alert("You finished the quiz!");
    $("#numRight").text(correctOnFirstTry + "/" + totalNumQuestions);
    modal.style.display = "block";
}

function getOrDefault(obj, key, def) {
    if (key in obj && obj['key'] !== undefined) {
        return obj.key;
    } else {
        return def;
    }
}

function correctAnswer(questions) {
    quizReady = false;
    $("#correct-sound").trigger('play');
    let timeOutLength = 500;
    if (firstTry) {
        timeOutLength = 2000;
        setTimeout(function () {
            $("#" + (bank.totalPoints % 40)).trigger('play');
        }, 500);
    }

    setTimeout(function() {
        const curWord = questions.quiz[questions.curQuestion].word;
        const emptyWordData = {'right': 0, 'wrong': 0, "parentCategory": parentCategory, "subcategory": subcategory};
        let curWordProgress = getOrDefault(progress.words, curWord, emptyWordData);

        if (firstTry) {
            bankUpdate();
            correctOnFirstTry++;
            progress.totalRight++;
            curWordProgress.right++;
            subcategoryProgress.right++;
            thisQuizProgress.right.push(curWord);
        } else {
            progress.totalWrong++;
            curWordProgress.wrong++;
            subcategoryProgress.wrong++;
            thisQuizProgress.wrong.push(curWord);
            if (secondTry) {
                secondTryBankUpdate();
            }
        }
        progress.words[curWord] = curWordProgress;


        firstTry = true;
        secondTry = false;
        // console.log("correct on first try " + correctOnFirstTry);

        questions.curQuestion++;

        ResetColors();
        if(questions.numQuestions <= questions.curQuestion) {
            //reached the end of the quiz questions, refresh the quiz with new questions
            questions.quiz = queuedQuiz;

            questions.numQuestions = questions.quiz.length;
            totalNumQuestions = questions.numQuestions;

            questions.curQuestion = 0;

            SetupQuiz(questions);
            quizReady = true;

            $.get(quizRefreshPath, function(data, status){
                // console.log("refresh data: " + data.quiz);
                queuedQuiz = data.quiz;
                // console.log("queued quiz:");
                // console.log(queuedQuiz);
            });
        } else {
            SetupQuiz(questions);
        }
    }, timeOutLength);

}

function SetupQuiz(questions) {
    const quiz = questions.quiz;
    const curQuestion = questions.curQuestion;
    // console.log(questions);
    const allSrcs = [];

    const question = quiz[curQuestion];
    const word = question.word;
    $("#question-word").text(word);

    const correctImage = question.answerImage;
    const answerIndex = Math.floor((Math.random() * 4));

    $.each(question.incorrectImages, function(index, value) {
        allSrcs.push(value);
    });

    if(answerIndex === 4) {
        allSrcs.push(correctImage);
    } else {
        allSrcs.splice(answerIndex, 0, correctImage);
    }
    // console.log(allSrcs);
    // console.log(answerIndex);

    $("#top-left").children(".option-image").attr("src", allSrcs[0]);
    $("#top-right").children(".option-image").attr("src", allSrcs[1]);
    $("#bottom-left").children(".option-image").attr("src", allSrcs[2]);
    $("#bottom-right").children(".option-image").attr("src", allSrcs[3]);


    currentAnswerAudio = question.answerAudio;
    $("#answer-audio").attr("src", currentAnswerAudio);

    if(!firstQuestion) {
        setTimeout(function() {
            $("#answer-audio").trigger('play');
        }, 500);
    } else {
        firstQuestion = false;
    }

    questions.answerIndex = answerIndex;
    quizReady = true;
}

function bankUpdate() {
    // bank.newRight += 2;
    bank.totalPoints += 2;
    sessionStorage.setItem('totalPoints', bank.totalPoints.toString());
    addGoldCoin();
    bank.goldCoins++;

    if (bank.goldCoins >= 5) {
        $(".gold-coin").remove();
        bank.goldCoins = 0;
        addGoldCoinStack();
        bank.goldCoinStacks++;
    }
    if (bank.goldCoinStacks >= 5) {
        $(".gold-coin-stack").remove();
        bank.goldCoinStacks = 0;
        addMoneyBag();
        bank.moneyBags++;
    }
    if (bank.moneyBags >= 5) {
        $(".money-bag").remove();
        bank.moneyBags = 0;
        addArmoredCar();
        bank.armoredCars++;
    }
    if (bank.armoredCars >= 5) {
        $(".armored-car").remove();
        bank.armoredCars = 0;
        addCoinBank();
        bank.coinBanks++;
    }
}

function secondTryBankUpdate() {
    // bank.newRight += 1;
    bank.totalPoints += 1;
    sessionStorage.setItem('totalPoints', bank.totalPoints.toString());
    addSilverCoin();
    bank.silverCoins++;
    if (bank.silverCoins >= 2) {
        $(".silver-coin").remove();
        bank.silverCoins = 0;
        addGoldCoin();
        bank.goldCoins++
    }
    if (bank.goldCoins >= 5) {
        $(".gold-coin").remove();
        bank.goldCoins = 0;
        addGoldCoinStack();
        bank.goldCoinStacks++;
    }
    if (bank.goldCoinStacks >= 5) {
        $(".gold-coin-stack").remove();
        bank.goldCoinStacks = 0;
        addMoneyBag();
        bank.moneyBags++;
    }
    if (bank.moneyBags >= 5) {
        $(".money-bag").remove();
        bank.moneyBags = 0;
        addArmoredCar();
        bank.armoredCars++;
    }
    if (bank.armoredCars >= 5) {
        $(".armored-car").remove();
        bank.armoredCars = 0;
        addCoinBank();
        bank.coinBanks++;
    }
}


function addCoinBank() {
    let coinBank = document.createElement("IMG");
    coinBank.setAttribute("src", "/images/buttons/bank.png");
    coinBank.setAttribute("class", "coin-bank");
    $("#coin-banks").append(coinBank);
}

function addArmoredCar() {
    let armoredCar = document.createElement("IMG");
    armoredCar.setAttribute("src", "/images/buttons/armoredCar.png");
    armoredCar.setAttribute("class", "armored-car");
    $("#armored-cars").append(armoredCar);
}

function addMoneyBag() {
    let moneyBag = document.createElement("IMG");
    moneyBag.setAttribute("src", "/images/buttons/bag.png");
    moneyBag.setAttribute("class", "money-bag");
    $("#money-bags").append(moneyBag);
}

function addGoldCoinStack() {
    let goldCoinStack = document.createElement("IMG");
    goldCoinStack.setAttribute("src", "/images/buttons/gcoinStack.png");
    goldCoinStack.setAttribute("class", "gold-coin-stack");
    $("#gold-coin-stacks").append(goldCoinStack);
}

function addGoldCoin() {
    let goldCoin = document.createElement("IMG");
    goldCoin.setAttribute("src", "/images/buttons/gcoin.png");
    goldCoin.setAttribute("class", "gold-coin");
    $("#gold-coins").append(goldCoin);
}

function addSilverCoin() {
    let silverCoin = document.createElement("IMG");
    silverCoin.setAttribute("src", "/images/buttons/scoin.png");
    silverCoin.setAttribute("class", "silver-coin");
    $("#silver-coins").append(silverCoin);
}

function makeTwoDigits(num) {
    if (num < 10) {
        return '0' + num;
    }
    return num;
}

function getCurrentDate() {
    let today = new Date();
    let h = makeTwoDigits(today.getHours());
    let m = makeTwoDigits(today.getMinutes());
    let s = makeTwoDigits(today.getSeconds());
    let dd = makeTwoDigits(today.getDate());
    let mm = makeTwoDigits(today.getMonth() + 1); //January is 0!

    let yyyy = today.getFullYear();

    return yyyy + '/' + mm + '/' + dd + " " + h + ':' + m + ':' + s;
}