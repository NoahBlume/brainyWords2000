const express = require('express');
const router = express.Router();


const path = require('path');

const fs = require('fs');

function textCleanup(string) {
    if (string.match(/[a-z]/i)) {
        //if regular element
        return string.replace(/^[0-9]+/, '').replace(/_/g, ' ');
    } else if(string.match(/[[=]|[+]]/) && string.match(/_/)){
        //if addition element
        return string.replace(/^[0-9]+/, '').replace(/_/g, '');
    } else {
        //if number element
        return string.replace(/^0+/, '').replace(/_/g, ' ');
    }
}

function generateQuiz(categoryNum, category, subCategory, secondSubCategory, hasSubcategory, hasSecondSubcategory) {
    let audioPath;
    let imagePath;
    let imageFiles;
    let audioFiles;

    let additionQuiz = false;
    if(hasSubcategory && hasSecondSubcategory) {
        audioPath = path.join(__dirname, '..', 'public/audio/categories/', categoryNum, category, subCategory, secondSubCategory);
        imagePath = path.join(__dirname, '..', 'public/images/categories/', categoryNum, category, subCategory, secondSubCategory);

        publicImagePath = '/images/categories/' + categoryNum + '/' + category + '/' + subCategory + '/' + secondSubCategory;
        publicAudioPath = '/audio/categories/' + categoryNum + '/' + category + '/' + subCategory + '/' + secondSubCategory;
    } else if(hasSubcategory) {
        if(subCategory === 'addition') {
            subCategory = 'addition/addition_quiz';
            additionQuiz = true;
        } else if (subCategory === 'alphabet letters') {
            subCategory = 'alphabet letters/alphabet_quiz';
        }
        audioPath = path.join(__dirname, '..', 'public/audio/categories/', categoryNum, category, subCategory);
        imagePath = path.join(__dirname, '..', 'public/images/categories/', categoryNum, category, subCategory);

        publicImagePath = '/images/categories/' + categoryNum + '/' + category + '/' + subCategory;
        publicAudioPath = '/audio/categories/' + categoryNum + '/' + category + '/' + subCategory;
    } else {
        audioPath = path.join(__dirname, '..', 'public/audio/categories/', categoryNum, category);
        imagePath = path.join(__dirname, '..', 'public/images/categories/', categoryNum, category);

        publicImagePath = '/images/categories/' + categoryNum + '/' + category;
        publicAudioPath = '/audio/categories/' + categoryNum + '/' + category;
    }
    // var audioFiles = fs.readdirSync(audioPath);
    imageFiles = fs.readdirSync(imagePath);
    audioFiles = fs.readdirSync(audioPath);


    const jsonData = {};
    jsonData.quiz = [];

    const allWords = {};
    const wordList = [];

    if(additionQuiz === false) {
        //add links to the image corresponding to each word
        imageFiles.forEach(function(wordImage) {
            const word = wordImage.split('.')[0];
            wordList.push(word);

            let wordObj = {};

            if (word in allWords) {
                wordObj = allWords[word];
            }

            wordObj['imagePath'] = publicImagePath + '/' + wordImage;
            allWords[word] = wordObj;
        });
    }


    //add links to the audio file corresponding to each word
    audioFiles.forEach(function(wordAudio) {
        let word = wordAudio.split('.')[0];

        let wordAnswer = null;
        if(additionQuiz === true) {
            wordList.push(word);
            wordAnswer = word.split('=')[1];
        }

        let wordObj = {};

        if (word in allWords) {
            wordObj = allWords[word];

        }
        wordObj['audioPath'] = publicAudioPath + '/' + wordAudio;
        if (additionQuiz === true) {
            wordObj['imagePath'] = publicImagePath + '/' + wordAnswer + '.png';
        }
        allWords[word] = wordObj;
    });

    //set remain words to be a shallow copy of wordList
    const remainingWords = wordList.slice();

    //randomly generate 5 quiz questions
    for(let i = 0; i < wordList.length; i++) {
        const quizObj = {};

        const correctWordIndex = Math.floor(Math.random() * remainingWords.length);
        const correctWord = remainingWords[correctWordIndex]; //randomly chooses a word for the question
        remainingWords.splice(correctWordIndex, 1); //remove the word from remaining words

        if (additionQuiz) {
            quizObj.word = textCleanup(correctWord.split('=')[0] + '=');
        } else {
            quizObj.word = textCleanup(correctWord);
        }
        quizObj.answerImage = allWords[correctWord].imagePath;
        quizObj.answerAudio = allWords[correctWord].audioPath;

        const incorrectImages = [];
        let allOtherWords = wordList.slice(); //makes shallow copy of wordList
        allOtherWords.splice(allOtherWords.indexOf(correctWord), 1);

        let wrongAnswers = [];

        //randomly chooses 3 other words as incorrect options
        for (let j = 0; j < 3 && j < wordList.length - 1; j++) {
            // randomly select incorrect word options
            if(additionQuiz === false) {
                const wrongWordIndex = Math.floor(Math.random() * allOtherWords.length);
                const wrongWord = allOtherWords[wrongWordIndex];
                allOtherWords.splice(wrongWordIndex, 1);

                incorrectImages.push(allWords[wrongWord].imagePath);
            } else {

                let foundDifferentOption = false;
                let wrongWordIndex;
                let wrongWord;
                let wrongAnswer;
                while (!foundDifferentOption) {
                    wrongWordIndex = Math.floor(Math.random() * allOtherWords.length);
                    wrongWord = allOtherWords[wrongWordIndex];
                    wrongAnswer = wrongWord.split('=')[1];
                    if (wrongAnswer !== correctWord.split('=')[1] && !wrongAnswers.includes(wrongAnswer)) {
                        foundDifferentOption = true;
                    }
                    allOtherWords.splice(wrongWordIndex, 1);
                }
                allOtherWords.splice(wrongWordIndex, 1);

                wrongAnswers.push(wrongAnswer);
                incorrectImages.push(allWords[wrongWord].imagePath);
            }

        }

        quizObj.incorrectImages = incorrectImages;
        jsonData.quiz.push(quizObj);
    }

    return jsonData;
}

// GET route for welcome screen
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Welcome!'});
});

// GET route for main street screen
router.get('/street', function (req, res, next) {
    let store = req.query.store;
    if(!store) {
        store = 0;
    }
    res.render('street', {
        layout: "streetLayout.hbs",
        title: 'Street',
        store: store,
        zoom: false
    });
});


// GET route for progress screen
router.get('/progress', function (req, res, next) {
    const email = "example email";
    const name = "example name";

    res.render('progress', {
        title: 'progress',
        stat1: '42',
        stat2: 'another statistic',
        userName: name,
        accountEmail: email
    });
});

// GET route for zoomed in street areas
router.get('/street/:closestStore/:location', function (req, res, next) {
    const categoryNum = req.params.closestStore;
    const location = req.params.location;
    //TODO: handle errors where page is not found (try catch + 404)
    res.render('zoomedIn/' + location, { layout: "streetLayout.hbs", store: categoryNum, zoom: true, title: 'Street'});
});

// GET route for zoomed in ZOO areas
router.get('/street/18/zoo/:location', function (req, res, next) {
    // const categoryNum = req.params.closestStore;
    const location = req.params.location;
    //TODO: handle errors where page is not found (try catch + 404)
    res.render('zoomedIn/' + location, { layout: "zooLayout.hbs", zoom: true, title: 'Street'});
});

// GET route for taking a quiz without a subcategory
router.get('/category/:categoryNum/:category/quiz', function (req, res, next) {
    // console.log("quiz page hit!!!");
    // console.log("trying to take a quiz");
    const categoryNum = req.params.categoryNum;
    const category = req.params.category;
    // const subCategory = req.params.subCategory;

    try {
        // TODO - get all of the subcategory data and construct a quiz
        const jsonData = generateQuiz(categoryNum, category, null, null,false, false);
        res.render('quiz', {
            title: "Quiz",
            encodedJson : encodeURIComponent(JSON.stringify(jsonData)),
            layout: 'quizLayout.hbs',
            subcategory: category,
            parentCategory: null,
            categoryNum: categoryNum,
            subCategoryLocation: '/category/' + categoryNum + '/' + category
        });
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});


// GET route for refreshing a quiz without a subcategory
router.get('/category/:categoryNum/:category/quizRefresh', function (req, res, next) {
    // console.log("trying to refresh a quiz");
    const categoryNum = req.params.categoryNum;
    const category = req.params.category;
    // const subCategory = req.params.subCategory;

    try {
        // TODO - get all of the subcategory data and construct a quiz
        const jsonData = generateQuiz(categoryNum, category, null, null, false, false);
        res.json(jsonData);
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});

// GET route for viewing a category
router.get('/category/:categoryNum/:category', function (req, res, next) {
    const categoryNum = req.params.categoryNum;
    const category = req.params.category;
    try {
        // const audioPath = path.join(__dirname, '..', 'public/audio/categories/', category);
        // const categoryPath = path.join(__dirname, '..', 'public/images/categories/', categoryNum);
        // const categoryNameList = fs.readdirSync(categoryPath);
        // const category = categoryNameList[0];

        const imagePath = path.join(__dirname, '..', 'public/images/categories/', categoryNum, category);

        const publicImagePath = '/images/categories/' + categoryNum + '/' + category;
        const publicAudioPath = '/audio/categories/' + categoryNum + '/' + category;

        // var audioFiles = fs.readdirSync(audioPath);
        const imageFiles = fs.readdirSync(imagePath);

        const categoryData = {};

        let subCategoryFound = false;

        imageFiles.forEach(function(subCategory) {
            let subCatObject;
            if (subCategory.endsWith(".png") || subCategory.endsWith(".jpg")) {
                const trimmedSubCat = subCategory.split('.')[0];

                subCatObject = {
                    imageDirectory: publicImagePath + '/' + trimmedSubCat,
                    audioDirectory: publicAudioPath + '/' + trimmedSubCat,
                    imageFile: publicImagePath + '/' + subCategory,
                    subCatName: trimmedSubCat
                };

                categoryData[trimmedSubCat] = subCatObject;
            } else if (!subCategory.includes('.')) {
                subCategoryFound = true;
            }
        });

        if (subCategoryFound) {
            res.render('category', {
                title: category,
                layout: 'categoryLayout.hbs',
                store: categoryNum,
                category: category,
                subCategories: categoryData
            });
        } else {
            //No subcategories - go straight to the words page
            const subCategoryData = {};

            imageFiles.forEach(function(subCatImage) {
                if(subCatImage.includes('.')) {
                    const subCatName = subCatImage.split('.')[0];

                    let subCatObj = {};

                    if (subCatName in subCategoryData) {
                        subCatObj = subCategoryData[subCatName];

                    }
                    subCatObj['image'] = publicImagePath + '/' + subCatImage;
                    subCatObj['name'] = textCleanup(subCatName);
                    subCategoryData[subCatName] = subCatObj;
                }
            });

            const audioPath = path.join(__dirname, '..', 'public/audio/categories/', categoryNum, category);
            const publicAudioPath = '/audio/categories/' + categoryNum + '/' + category;
            const audioFiles = fs.readdirSync(audioPath);
            audioFiles.forEach(function(subCatAudio) {
                if(subCatAudio.includes('.')) {
                    const subCatName = subCatAudio.split('.')[0];

                    let subCatObj = {};

                    if (subCatName in subCategoryData) {
                        subCatObj = subCategoryData[subCatName];

                    }
                    subCatObj['audio'] = publicAudioPath + '/' + subCatAudio;
                    subCategoryData[subCatName] = subCatObj;
                }
            });

            res.render('subCategory', {
                title: category,
                layout: 'categoryLayout.hbs',
                categoryNum: categoryNum,
                category: category,
                subCategory: category,
                words: subCategoryData,
                hasParentCategory: false
            });
        }

    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Category does not exist!');
        err.status = 404;
        return next(err);
    }
});

// GET route for viewing Zoo category
router.get('/street/18/zoo/category/:category', function (req, res, next) {
    const categoryNum = '18';
    const category = req.params.category;
    try {
        // const audioPath = path.join(__dirname, '..', 'public/audio/categories/', category);
        // const categoryPath = path.join(__dirname, '..', 'public/images/categories/', categoryNum);
        // const categoryNameList = fs.readdirSync(categoryPath);
        // const category = categoryNameList[0];

        const imagePath = path.join(__dirname, '..', 'public/images/categories/', categoryNum, category);

        const publicImagePath = '/images/categories/' + categoryNum + '/' + category;
        const publicAudioPath = '/audio/categories/' + categoryNum + '/' + category;

        // var audioFiles = fs.readdirSync(audioPath);
        const imageFiles = fs.readdirSync(imagePath);

        const categoryData = {};

        let subCategoryFound = false;

        imageFiles.forEach(function(subCategory) {
            let subCatObject;
            if (subCategory.endsWith(".png") || subCategory.endsWith(".jpg")) {
                const trimmedSubCat = subCategory.split('.')[0];

                subCatObject = {
                    imageDirectory: publicImagePath + '/' + trimmedSubCat,
                    audioDirectory: publicAudioPath + '/' + trimmedSubCat,
                    imageFile: publicImagePath + '/' + subCategory,
                    subCatName: trimmedSubCat
                };

                categoryData[trimmedSubCat] = subCatObject;
            } else if (!subCategory.includes('.')) {
                subCategoryFound = true;
            }
        });

        if (subCategoryFound) {
            res.render('zooCategory', {
                title: category,
                layout: 'categoryLayout.hbs',
                store: categoryNum,
                category: category,
                subCategories: categoryData
            });
        } else {
            //No subcategories - go straight to the words page
            const subCategoryData = {};

            imageFiles.forEach(function(subCatImage) {
                if(subCatImage.includes('.')) {
                    const subCatName = subCatImage.split('.')[0];

                    let subCatObj = {};

                    if (subCatName in subCategoryData) {
                        subCatObj = subCategoryData[subCatName];

                    }
                    subCatObj['image'] = publicImagePath + '/' + subCatImage;
                    subCatObj['name'] = textCleanup(subCatName);
                    subCategoryData[subCatName] = subCatObj;
                }
            });

            const audioPath = path.join(__dirname, '..', 'public/audio/categories/', categoryNum, category);
            const publicAudioPath = '/audio/categories/' + categoryNum + '/' + category;
            const audioFiles = fs.readdirSync(audioPath);
            audioFiles.forEach(function(subCatAudio) {
                if(subCatAudio.includes('.')) {
                    const subCatName = subCatAudio.split('.')[0];

                    let subCatObj = {};

                    if (subCatName in subCategoryData) {
                        subCatObj = subCategoryData[subCatName];

                    }
                    subCatObj['audio'] = publicAudioPath + '/' + subCatAudio;
                    subCategoryData[subCatName] = subCatObj;
                }
            });

            res.render('zooCategory', {
                title: category,
                layout: 'categoryLayout.hbs',
                categoryNum: categoryNum,
                category: category,
                subCategory: category,
                words: subCategoryData,
                hasParentCategory: false
            });
        }

    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Category does not exist!');
        err.status = 404;
        return next(err);
    }
});



// GET route for viewing a subcategory
router.get('/category/:categoryNum/:category/:subCategory', function (req, res, next) {
    const category = req.params.category;
    const categoryNum = req.params.categoryNum;
    const subCategory = req.params.subCategory;

    if(subCategory === "Pediatrician Doctor Exam") {
        console.log("check worked");
        res.render('zoomedIn/pediatricianDoctorExam', {
            layout: "streetLayout.hbs",
            title: 'Pediatrician Doctor Exam',
        });
        return;
    }

    try {
        // const categoryPath = path.join(__dirname, '..', 'public/images/categories/', categoryNum);
        // const categoryNameList = fs.readdirSync(categoryPath);
        // const category = categoryNameList[0];


        const audioPath = path.join(__dirname, '..', 'public/audio/categories/', categoryNum, category, subCategory);
        const imagePath = path.join(__dirname, '..', 'public/images/categories/', categoryNum, category, subCategory);

        const publicImagePath = '/images/categories/' + categoryNum + '/' + category + '/' + subCategory;
        const publicAudioPath = '/audio/categories/' + categoryNum + '/' + category + '/' + subCategory;


        // var audioFiles = fs.readdirSync(audioPath);
        const imageFiles = fs.readdirSync(imagePath);
        const audioFiles = fs.readdirSync(audioPath);

        const subCategoryData = {};

        imageFiles.forEach(function(subCatImage) {
            if(subCatImage.includes('.')) {
                const subCatName = subCatImage.split('.')[0];

                let subCatObj = {};

                if (subCatName in subCategoryData) {
                    subCatObj = subCategoryData[subCatName];

                }
                subCatObj['image'] = publicImagePath + '/' + subCatImage;
                subCatObj['name'] = textCleanup(subCatName);
                subCategoryData[subCatName] = subCatObj;
            }

        });

        audioFiles.forEach(function(subCatAudio) {
            if(subCatAudio.includes('.')) {
                const subCatName = subCatAudio.split('.')[0];

                let subCatObj = {};

                if (subCatName in subCategoryData) {
                    subCatObj = subCategoryData[subCatName];

                }
                subCatObj['audio'] = publicAudioPath + '/' + subCatAudio;
                subCategoryData[subCatName] = subCatObj;
            }
        });

        res.render('subCategory', { 
            title: category,
            layout: 'categoryLayout.hbs',
            categoryNum: categoryNum,
            category: category,
            subCategory: subCategory,
            words: subCategoryData,
            hasParentCategory: true
        });
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});


// GET route for viewing the pediatrician doctor exam subcategories
router.get('/category/:categoryNum/:category/:subCategory/:secondSubcategory', function (req, res, next) {
    const category = req.params.category;
    const categoryNum = req.params.categoryNum;
    const subCategory = req.params.subCategory;
    const secondSubCategory = req.params.secondSubcategory;

    if (subCategory !== "Pediatrician Doctor Exam") {
        return next();
    }

    console.log("got where we wanted" + categoryNum + category + subCategory + secondSubCategory);
    try {
        // const categoryPath = path.join(__dirname, '..', 'public/images/categories/', categoryNum);
        // const categoryNameList = fs.readdirSync(categoryPath);
        // const category = categoryNameList[0];


        const audioPath = path.join(__dirname, '..', 'public/audio/categories/', categoryNum, category, subCategory, secondSubCategory);
        const imagePath = path.join(__dirname, '..', 'public/images/categories/', categoryNum, category, subCategory, secondSubCategory);

        const publicImagePath = '/images/categories/' + categoryNum + '/' + category + '/' + subCategory + '/' + secondSubCategory;
        const publicAudioPath = '/audio/categories/' + categoryNum + '/' + category + '/' + subCategory + '/' + secondSubCategory;


        // var audioFiles = fs.readdirSync(audioPath);
        const imageFiles = fs.readdirSync(imagePath);
        const audioFiles = fs.readdirSync(audioPath);

        const subCategoryData = {};

        imageFiles.forEach(function(subCatImage) {
            if(subCatImage.includes('.')) {
                const subCatName = subCatImage.split('.')[0];

                let subCatObj = {};

                if (subCatName in subCategoryData) {
                    subCatObj = subCategoryData[subCatName];

                }
                subCatObj['image'] = publicImagePath + '/' + subCatImage;
                subCatObj['name'] = textCleanup(subCatName);
                subCategoryData[subCatName] = subCatObj;
            }

        });

        audioFiles.forEach(function(subCatAudio) {
            if(subCatAudio.includes('.')) {
                const subCatName = subCatAudio.split('.')[0];

                let subCatObj = {};

                if (subCatName in subCategoryData) {
                    subCatObj = subCategoryData[subCatName];

                }
                subCatObj['audio'] = publicAudioPath + '/' + subCatAudio;
                subCategoryData[subCatName] = subCatObj;
            }
        });

        res.render('subCategory', {
            title: category,
            layout: 'categoryLayout.hbs',
            categoryNum: categoryNum,
            category: category,
            subCategory: secondSubCategory,
            words: subCategoryData,
            hasParentCategory: true
        });
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});


// GET route for refreshing a quiz with a subcategory
router.get('/category/:categoryNum/:category/:subCategory/quizRefresh', function (req, res, next) {
    const categoryNum = req.params.categoryNum;
    const category = req.params.category;
    const subCategory = req.params.subCategory;

    try {
        // TODO - get all of the subcategory data and construct a quiz
        const jsonData = generateQuiz(categoryNum, category, subCategory, null, true, false);
        res.json(jsonData);
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});

// GET route for taking a quiz with a subcategory
router.get('/category/:categoryNum/:category/:subCategory/quiz', function (req, res, next) {
    const categoryNum = req.params.categoryNum;
    const category = req.params.category;
    const subCategory = req.params.subCategory;

    try {
        // TODO - get all of the subcategory data and construct a quiz
        const jsonData = generateQuiz(categoryNum, category, subCategory, null,true, false);
        res.render('quiz', {
            title: "Quiz",
            encodedJson : encodeURIComponent(JSON.stringify(jsonData)),
            layout: 'quizLayout.hbs',
            subcategory: subCategory,
            parentCategory: category,
            categoryNum: categoryNum,
            subCategoryLocation: '/category/' + categoryNum + '/' + category + '/' + subCategory
        });
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});




// GET route for taking a quiz with a subcategory within a subcategory
router.get('/category/:categoryNum/:category/:subCategory/:secondSubcategory/quiz', function (req, res, next) {
    const categoryNum = req.params.categoryNum;
    const category = req.params.category;
    const subCategory = req.params.subCategory;
    const secondSubCategory = req.params.secondSubcategory;

    try {
        // TODO - get all of the subcategory data and construct a quiz
        const jsonData = generateQuiz(categoryNum, category, subCategory, secondSubCategory, true, true);
        res.render('quiz', {
            title: "Quiz",
            encodedJson : encodeURIComponent(JSON.stringify(jsonData)),
            layout: 'quizLayout.hbs',
            subcategory: secondSubCategory,
            parentCategory: category,
            categoryNum: categoryNum,
            subCategoryLocation: '/category/' + categoryNum + '/' + category + '/' + subCategory + '/' + secondSubCategory
        });
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});

module.exports = router;