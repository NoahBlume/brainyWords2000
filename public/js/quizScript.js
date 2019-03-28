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
bank['moneyBags'] = 0;
bank['goldCoinStacks'] = 0;
bank['goldCoins'] = 0;
bank['silverCoins'] = 0;
if (localStorage.getItem('totalPoints') === null) {
    localStorage.setItem('totalPoints', "0");
}
bank['totalPoints'] = parseInt(localStorage.getItem('totalPoints'));

let progress = {};
progress['totalRight'] = 0;
progress['totalWrong'] = 0;
progress['quizzes'] = [];
progress['words'] = {};
progress['subcategories'] = {};
if (localStorage.getItem('progress') === null) {
    localStorage.setItem('progress', JSON.stringify(progress));
}
progress = JSON.parse(localStorage.getItem('progress'));

// bank['newRight'] = 0;
const quizRefreshPath = window.redirectLocation + '/quizRefresh';
const subcategory = window.subcategory;
const parentCategory = window.parentCategory;

const empty = {"parentCategory": parentCategory, "right": 0, "wrong": 0};
let subcategoryProgress = getOrDefault(progress.subcategories, subcategory, empty);

const currentDate = getCurrentDate();
let thisQuizProgress = {"subcategory": subcategory, "parentCategory": parentCategory, "right":[], "wrong": [], "date": currentDate};

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
        progress.quizzes.push(thisQuizProgress);
        progress.subcategories[subcategory] = subcategoryProgress;
        localStorage.setItem('progress', JSON.stringify(progress));
        window.location.href = window.redirectLocation;
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
    if (key in obj) {
        return obj.key;
    } else {
        return def;
    }
}

function correctAnswer(questions) {
    quizReady = false;
    $("#correct-sound").trigger('play');
    var timeOutLength = 500;
    if (firstTry) {
        timeOutLength = 2000;
        setTimeout(function () {
            $("#" + (bank.totalPoints % 40)).trigger('play');
        }, 500);
    }

    setTimeout(function() {
        const curWord = questions.quiz[questions.curQuestion].word;
        const empty = {'right': 0, 'wrong': 0};
        let curWordProgress = getOrDefault(progress.words, curWord, empty);

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
    var quiz = questions.quiz;
    var curQuestion = questions.curQuestion;
    // console.log(questions);
    var allSrcs = [];

    var question = quiz[curQuestion];
    var word = question.word;
    $("#question-word").text(word);

    var correctImage = question.answerImage;
    var answerIndex = Math.floor((Math.random() * 4));

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


    var audioFile = question.answerAudio;
    $("#answer-audio").attr("src", audioFile);

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
    localStorage.setItem('totalPoints', bank.totalPoints.toString());
    addGoldCoin();
    bank.goldCoins++;
    // if (bank.silverCoins >= 2) {
    //     $(".silver-coin").remove();
    //     bank.silverCoins = 0;
    //     addGoldCoin();
    //     bank.goldCoins++;
    // }
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
}

function secondTryBankUpdate() {
    // bank.newRight += 1;
    bank.totalPoints += 1;
    localStorage.setItem('totalPoints', bank.totalPoints.toString());
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

function getCurrentDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!

    let yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return yyyy + '/' + mm + '/' + dd;
}