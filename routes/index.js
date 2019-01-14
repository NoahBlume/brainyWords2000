const express = require('express');
const router = express.Router();


const path = require('path');

const fs = require('fs');

// GET route for welcome screen
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Welcome!'});
});

// GET route for main street screen
router.get('/street', function (req, res, next) {
    res.render('street', { layout: "streetLayout.hbs", title: 'Street'});
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

// GET route for viewing a category
router.get('/category/:category', function (req, res, next) {
    const category = req.params.category;

    try {
        // const audioPath = path.join(__dirname, '..', 'public/audio/categories/', category);
        const imagePath = path.join(__dirname, '..', 'public/images/categories/', category);

        const publicImagePath = '/images/categories/' + category;
        const publicAudioPath = '/audio/categories/' + category;

        // var audioFiles = fs.readdirSync(audioPath);
        const imageFiles = fs.readdirSync(imagePath);

        const categoryData = {};

        imageFiles.forEach(function(subCategory) {
            let subCatObject;
            if (subCategory.endsWith(".png") || subCategory.endsWith(".jpg")) {
                const trimmedSubCat = subCategory.split('.')[0];

                subCatObject = {
                    imageDirectory: publicImagePath + '/' + trimmedSubCat,
                    audioDirectory: publicAudioPath + '/' + trimmedSubCat,
                    imageFile: publicImagePath + '/' + subCategory
                };

                categoryData[trimmedSubCat] = subCatObject;
            }
        });

        res.render('category', { 
            title: category.charAt(0).toUpperCase() + category.slice(1),
            category: category,
            subCategories: categoryData
        });
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Category does not exist!');
        err.status = 404;
        return next(err);
    }
});


// GET route for viewing a subcategory
router.get('/category/:category/:subCategory', function (req, res, next) {
    // console.log("subcategory page hit!!!");
    const category = req.params.category;
    const subCategory = req.params.subCategory;

    try {
        const audioPath = path.join(__dirname, '..', 'public/audio/categories/', category, subCategory);
        const imagePath = path.join(__dirname, '..', 'public/images/categories/', category, subCategory);

        const publicImagePath = '/images/categories/' + category + '/' + subCategory;
        const publicAudioPath = '/audio/categories/' + category + '/' + subCategory;


        // var audioFiles = fs.readdirSync(audioPath);
        const imageFiles = fs.readdirSync(imagePath);
        const audioFiles = fs.readdirSync(audioPath);

        const subCategoryData = {};

        imageFiles.forEach(function(subCatImage) {
            const subCatName = subCatImage.split('.')[0];

            let subCatObj = {};

            if (subCatName in subCategoryData) {
                subCatObj = subCategoryData[subCatName];
                
            } 
            subCatObj['image'] = publicImagePath + '/' + subCatImage;
            subCategoryData[subCatName] = subCatObj; 
        });

        audioFiles.forEach(function(subCatAudio) {
            const subCatName = subCatAudio.split('.')[0];

            let subCatObj = {};

            if (subCatName in subCategoryData) {
                subCatObj = subCategoryData[subCatName];
                
            } 
            subCatObj['audio'] = publicAudioPath + '/' + subCatAudio;
            subCategoryData[subCatName] = subCatObj; 
        });

        res.render('subCategory', { 
            title: category.charAt(0).toUpperCase() + category.slice(1),
            category: category,
            subCategory: subCategory,
            words: subCategoryData
        });
    } catch(error) {
        console.log(error);
        // TODO: figure out the correct way to handle this
        const err = new Error('Subcategory does not exist!');
        err.status = 404;
        return next(err);
    }
});


// GET route for taking a quiz
router.get('/category/:category/:subCategory/quiz', function (req, res, next) {
    // console.log("quiz page hit!!!");
    const category = req.params.category;
    const subCategory = req.params.subCategory;

    try {
        // TODO - get all of the subcategory data and construct a quiz
        const audioPath = path.join(__dirname, '..', 'public/audio/categories/', category, subCategory);
        const imagePath = path.join(__dirname, '..', 'public/images/categories/', category, subCategory);

        const publicImagePath = '/images/categories/' + category + '/' + subCategory;
        const publicAudioPath = '/audio/categories/' + category + '/' + subCategory;

        // var audioFiles = fs.readdirSync(audioPath);
        const imageFiles = fs.readdirSync(imagePath);
        const audioFiles = fs.readdirSync(audioPath);

        const jsonData = {testing: "test success"};
        jsonData.quiz = [];

        const allWords = {};
        const wordList = [];

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

        audioFiles.forEach(function(wordAudio) {
            const word = wordAudio.split('.')[0];

            let wordObj = {};

            if (word in allWords) {
                wordObj = allWords[word];
                
            } 
            wordObj['audioPath'] = publicAudioPath + '/' + wordAudio;
            allWords[word] = wordObj; 
        });


        const remainingWords = wordList.slice();

        for(let i = 0; i < 5 && i < wordList.length; i++) {
            const quizObj = {};

            const correctWordIndex = Math.floor(Math.random() * remainingWords.length);
            const correctWord = remainingWords[correctWordIndex];
            remainingWords.splice(correctWordIndex, 1); //remove the word from remaining words

            quizObj.word = correctWord;
            quizObj.answerImage = allWords[correctWord].imagePath;
            quizObj.answerAudio = allWords[correctWord].audioPath;

            const incorrectImages = [];
            const allOtherWords = wordList.slice();
            allOtherWords.splice(allOtherWords.indexOf(correctWord), 1);

            for (let j = 0; j < 3 && j < wordList.length - 1; j++) {
                // randomly select incorrect word options
                const wrongWordIndex = Math.floor(Math.random() * allOtherWords.length);
                const wrongWord = allOtherWords[wrongWordIndex];
                allOtherWords.splice(wrongWordIndex, 1); 

                incorrectImages.push(allWords[wrongWord].imagePath);
            }

            quizObj.incorrectImages = incorrectImages;
            jsonData.quiz.push(quizObj);

        }

        res.render('quiz', { 
            title: "Quiz",
            encodedJson : encodeURIComponent(JSON.stringify(jsonData)),
            layout: 'quizLayout.hbs',
            subCategoryLocation: '/category/' + category + '/' + subCategory
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