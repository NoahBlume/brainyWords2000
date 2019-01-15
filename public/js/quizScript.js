var correctOnFirstTry = 0;
var firstTry = true;
var totalNumQuestions = 0;

// Get the modal
var modal = document.getElementById('myModal');
// modal.style.display = "block";
// var correctSound = $("#correct-sound");
// var incorrectSound = $("#incorrect-sound").trigger('play');
var startModal = document.getElementById('startModal');

const green = "#22bc00";
const questions = {};
let quizReady = false;
questions['answerIndex'] = -1;
questions['numQuestions'] = -1;
questions['curQuestion'] = 0;
let firstQuestion = true;


$( document ).ready(function() {
    const testing = window.sharedInfo;
    // console.log(testing);
    questions['quiz'] = testing.quiz;

    questions.numQuestions = questions.quiz.length;
    totalNumQuestions = questions.numQuestions;
    SetupQuiz(questions);
    quizReady = true;



    $("#begin-quiz").click(function() {
        startModal.style.display = "none";

        setTimeout(function() {
            $("#answer-audio").trigger('play');
        }, 500);
    });


    // get the button that closes the quiz complete modal
    const quizDoneButton = document.getElementById("quiz-complete-button");

    // When the user clicks the done button, return to the subcategory
    quizDoneButton.onclick = function() {
        window.location.href = window.redirectLocation;
    };

    $("#top-left").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 0) {
                ResetColors();
                $("#top-left").css('background-color', green);
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                // alert("Wrong Answer");
                $("#top-left").css('background-color', 'red');
                firstTry = false;
                $("#incorrect-sound").trigger('play');
            }
        }
    });

    $("#top-right").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 1) {
                ResetColors();
                $("#top-right").css('background-color', green);
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                // alert("Wrong Answer");
                $("#top-right").css('background-color', 'red');
                firstTry = false;
                $("#incorrect-sound").trigger('play');
            }
        }
    });

    $("#bottom-left").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 2) {
                ResetColors();
                $("#bottom-left").css('background-color', green);
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                // alert("Wrong Answer");
                $("#bottom-left").css('background-color', 'red');
                firstTry = false;
                $("#incorrect-sound").trigger('play');
            }
        }
    });

    $("#bottom-right").click(function() {
        if(quizReady === true) {
            if(questions.answerIndex === 3) {
                ResetColors();
                $("#bottom-right").css('background-color', green);
                // alert("Correct!");
                correctAnswer(questions);
            } else {
                $("#bottom-right").css('background-color', 'red');
                firstTry = false;
                $("#incorrect-sound").trigger('play');
                // alert("Wrong Answer");
            }
        }
    });


});

function ResetColors() {
    $("#top-left").css('background-color', "");
    $("#top-right").css('background-color', "");
    $("#bottom-left").css('background-color', "");
    $("#bottom-right").css('background-color', "");
}

function QuizComplete(questions) {
    // alert("You finished the quiz!");
    $("#numRight").text(correctOnFirstTry + "/" + totalNumQuestions);
    modal.style.display = "block";
}

function correctAnswer(questions) {
    quizReady = false;
    $("#correct-sound").trigger('play');

    setTimeout(function() {
        if (firstTry) {
            correctOnFirstTry++;
        }
        firstTry = true;
        console.log("correct on first try " + correctOnFirstTry);

        questions.curQuestion++;

        ResetColors();

        if(questions.numQuestions <= questions.curQuestion) {
            QuizComplete(questions);
        } else {
            SetupQuiz(questions);
        }
    }, 500);

}

function SetupQuiz(questions) {
    var quiz = questions.quiz;
    var curQuestion = questions.curQuestion;
    console.log(questions);
    var allSrcs = [];

    var question = quiz[curQuestion];
    var word = question.word;
    $("#question-word").text(word);

    var correctImage = question.answerImage;
    var answerIndex = Math.floor((Math.random() * 4));

    $.each(question.incorrectImages, function(index, value) {
        allSrcs.push(value);
    });

    if(answerIndex == 4) {
        allSrcs.push(correctImage);
    } else {
        allSrcs.splice(answerIndex, 0, correctImage);
    }
    console.log(allSrcs);
    console.log(answerIndex);

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