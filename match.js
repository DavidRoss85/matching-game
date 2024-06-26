const theLeftSide = document.querySelector("#leftSide");
const theRightSide = document.querySelector("#rightSide");
const theGoButton = document.getElementById("letsGo");
const theRestartButton = document.getElementById("restartButton");
const theEndButton = document.getElementById("endButton");
const theSlider = document.getElementById("diffSlide");
const timeKeeper = document.getElementById("timeKeeper");
const slideColumn = document.getElementById("slideBox");
const optionsBox = document.getElementById("optionsBox");
const boxText = document.getElementById("promptText");

const FLAG_COLOR = "red";
let imgPath = require("./img/smile.png");

let theMaxWidth = 50;
let theMaxHeight = 50;
let theImageSize = 5;

let startAmount = 1;
let numberOfFaces = startAmount;
let difficultyGain = 11;
let runTime = false;
let playerScore = 0;
let penaltyCost = 100;
let numPenalties = 0;
let startBonus = 3000;
let hintsOn = false;
let audioOn = true;
let timeLimitOn = false;
let countDownPlaying = false;

let roundNumber = 1;
let numberOfGames = 1;
let numberOfLives = 0;
let timePast = 0;
let roundTime = 0;
let hintTime = 0;
let timeLimit = 600;
let timeLeft = 1500;
let numHints = 1;
let windowFlashing = false;

window.addEventListener("load", firstLoad);
window.addEventListener("resize", setGameSize);
theGoButton.addEventListener("click", readySetGo);
theRestartButton.addEventListener("click", restartGame);
theEndButton.addEventListener("click", gameOver)
theSlider.addEventListener("change", slideUpdate)

//timer function
async function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
};

function firstLoad() {
    const mySounds = [
        require("url:/audio/clock-ticking.mp3"),
        require("url:./audio/wrong.mp3"),
        require("url:./audio/buzzer.mp3"),
        require("url:./audio/film-countdown.mp3")
    ];

    addSound(mySounds[0], "sound");
    addSound(mySounds[1], "wrong");
    addSound(mySounds[2], "timeUp");
    addSound(mySounds[3], "countSound");
    defaultValues();
    slideUpdate();
}
function readySetGo() {

    defaultValues();
    setDifficulty(parseInt(theSlider.value));

    numberOfFaces = startAmount;
    playerScore = 0;
    roundNumber = 1;
    timePast = 0;

    theGoButton.classList.add("d-none");
    theRestartButton.classList.add("d-none");
    theEndButton.classList.remove("d-none");
    slideColumn.classList.add("d-none");
    optionsBox.classList.add("d-none");

    playSound("sound", true);
    // playSound("countSound");
    updateScore()
    updateHealth(numberOfLives);
    playGame();
}

function defaultValues() {
    startBonus = 3000;
    numberOfLives = 0;
    setGameSize();
    document.getElementById("timeLeft").classList.add("d-none");
    if (document.getElementById("chkSmall").checked) {
        theImageSize = -2
    } else {
        theImageSize = 2
    }
    penaltyCost = 100
    difficultyGain = 11;
    hintsOn = document.getElementById("chkHints").checked;
    audioOn = document.getElementById("chkAudio").checked;
    timeLimitOn = document.getElementById("chkChallenge").checked;
    timeLimit = 600;
    timeLeft = timeLimit;
    numHints = 1;
}

async function playGame() {
    displayTimer(true);
    window.location.href = "#leftSide"
    generateFaces()
}

function addSound(url = "./audio/clock-ticking.mp3", idTag = "sound") {
    const theSound = new Audio(url);
    theSound.id = idTag;
    document.querySelector("h1").appendChild(theSound);
}

function playSound(itemId = "sound", loop = false, seekPoint = 0) {
    if (!audioOn) return;

    try {
        document.querySelector(`#${itemId}`).currentTime = seekPoint;
        document.querySelector(`#${itemId}`).play();
        document.querySelector(`#${itemId}`).loop = loop;
    } catch (e) {
        console.log("Failed to play sound from " + itemId);
    }

}
function stopSound(itemId = "sound") {
    try {
        document.querySelector(`#${itemId}`).pause();

    } catch (e) {
        console.log("Failed to play sound from " + itemId);
    }

}
async function displayTimer(displayOn = true) {
    runTime = displayOn;
    while (runTime) {
        await sleep(10);
        timePast += 1;
        roundTime += 1;
        hintTime += 1;

        //Cheat Codes
        //giveHint();

        let secCount = (timePast / 100) % 60;
        secCount = secCount.toFixed(2);
        let minCount = (Math.floor(timePast / 100 / 60)) % 60
        let hrCount = (Math.floor(timePast / 100 / 60 / 60)) % 60

        let tempValue = calculateBonus();
        if (tempValue > 0) tempValue = `+${tempValue}`;
        document.getElementById("timer").textContent = `${hrCount}:${minCount}:${secCount}`;
        timeKeeper.childNodes[0].textContent = tempValue;

        if (hintsOn) {
            if ((hintTime / 100) > ((roundNumber) / numHints)) {
                giveHint();
                hintTime = 0;
                numHints += 1
            }
        }
        if (timeLimitOn) {
            timeLeft -= 1
            document.getElementById("timeLeft").classList.remove("d-none");
            document.getElementById("countdown").textContent = Math.ceil(timeLeft / 100);
            if (timeLeft <= 500) {
                document.getElementById("countdown").classList.add("pulsate-text");
                if (!countDownPlaying && !!runTime) {
                    playSound("countSound");
                    countDownPlaying = true;
                }
            } else {
                document.getElementById("countdown").classList.remove("pulsate-text");
                stopSound("countSound");
                countDownPlaying = false;
            }
            if (timeLeft <= 0) {
                timeLeft = 0;
                gameOver();
            }
        } else {
            timeLeft = timeLimit;
            document.getElementById("timeLeft").classList.add("d-none");
        }

    }
    if (!displayOn) {
        document.getElementById("timer").textContent = `0:0:0`;
    }
}

function setGameSize() {
    //If window width is greater than height size according to height and vice versa
    if (document.body.clientHeight < document.body.clientWidth) {
        theMaxWidth = 40;
        theMaxHeight = 80;
    } else {
        theMaxWidth = 100;
        theMaxHeight = 40;

    }

    //set the game size
    document.documentElement.style.setProperty("--game-max-width", `${theMaxWidth}vw`);
    document.documentElement.style.setProperty("--game-max-height", `${theMaxHeight}vh`);
    document.documentElement.style.setProperty("--image-size", `${theImageSize}px`);

}
function generateFaces() {
    setGameSize();

    for (let i = 0; i < numberOfFaces; i++) {
        const face = document.createElement("img");
        face.src = imgPath;
        //theImageSize is an integer that represents a percentage value
        //This multiplies it by the width of the box to get a pixel value
        face.style.width = ((theImageSize / 100) * theLeftSide.clientWidth) + "px"
        face.style.height = ((theImageSize / 100) * theLeftSide.clientWidth) + "px"

        let randomTop = Math.floor((Math.random() * 100) + 1);
        let randomLeft = Math.floor((Math.random() * 100) + 1);

        randomLeft -= theImageSize;
        randomLeft = randomLeft < 1 ? 1 : randomLeft

        randomTop -= theImageSize;
        randomTop = randomTop < 1 ? 1 : randomTop

        face.style.top = randomTop + "%";//theGameSizeUnit;
        face.style.left = randomLeft + "%";// theGameSizeUnit;

        theLeftSide.appendChild(face);
        theLeftSide.childNodes[i].addEventListener("click", wrongAnswer);
    }
    const leftSideImages = theLeftSide.cloneNode(true);

    leftSideImages.removeChild(leftSideImages.lastChild);

    for (let node of leftSideImages.childNodes) {
        theRightSide.appendChild(node.cloneNode());
    }

    theLeftSide.lastElementChild.addEventListener('click', nextLevel);
    theLeftSide.lastElementChild.removeEventListener('click', wrongAnswer);
    //console.log(numberOfFaces);

    //Skip to lvl 100 (For testing)
    // if (roundNumber < 100){
    //     nextLevel();
    // }

}

function nextLevel(event) {

    event.stopPropagation();
    clearTheScreen();
    addRoundTimeRecord(roundTime);
    playerScore += calculateBonus();
    numberOfFaces += difficultyGain;
    roundNumber += 1;
    updateScore();
    roundTime = 0;
    numPenalties = 0;
    numHints = 1;
    timeLeft = timeLimit;
    generateFaces();
    boxText.textContent = "Round: " + roundNumber
}

function wrongAnswer(event) {
    event.stopPropagation();
    if (!windowFlashing) {
        flashItem(theLeftSide);
        flashItem(theRightSide);
    }
    playSound("wrong");
    numberOfLives -= 1;
    numPenalties += 1;
    updateHealth(numberOfLives);
    if (numberOfLives === 0) gameOver();
}

function updateHealth(heartCount = 5) {
    const heartRow = document.getElementById("heartsRow");
    while (heartRow.firstChild) {
        heartRow.removeChild(heartRow.firstChild);
    }

    for (let i = 0; i < heartCount; i++) {
        const heartCol = document.createElement("div");
        const heartIcon = document.createElement("i");

        heartCol.setAttribute("class", "col heart-icon");
        heartIcon.setAttribute("class", "fa-solid fa-heart");

        heartCol.appendChild(heartIcon);
        heartRow.appendChild(heartCol);
    }

}

function updateScore() {
    document.getElementById("playerScore").textContent = playerScore;
}

function gameOver() {
    theEndButton.classList.add("d-none");
    theRestartButton.classList.remove("d-none");
    theGoButton.classList.add("d-none");
    slideColumn.classList.add("d-none");
    optionsBox.classList.add("d-none");

    runTime = false;
    stopSound();
    stopSound("countSound");
    countDownPlaying = false;
    playSound("timeUp", false, 1);
    clearTheScreen();
    document.getElementById("promptText").textContent = "GAME OVER";

}

function clearTheScreen() {
    while (theLeftSide.firstChild) {
        theLeftSide.removeChild(theLeftSide.firstChild);
    }
    while (theRightSide.firstChild) {
        theRightSide.removeChild(theRightSide.firstChild);
    }
}
function clearTheTimerBoard() {
    while (timeKeeper.firstElementChild) {
        timeKeeper.removeChild(timeKeeper.firstElementChild);
    }
}

function restartGame(event) {
    event.stopPropagation();
    clearTheScreen();
    clearTheTimerBoard();
    defaultValues();

    theEndButton.classList.add("d-none");
    theRestartButton.classList.add("d-none");
    theGoButton.classList.remove("d-none");
    slideColumn.classList.remove("d-none");
    optionsBox.classList.remove("d-none");

    // theSlider.value = 1;
    slideUpdate();
    playerScore = 0;
    updateScore();
    // numberOfLives = 10;
    // updateHealth(numberOfLives);
    displayTimer(false);

}


async function flashItem(item, flashColor = FLAG_COLOR) {
    windowFlashing = true;
    item.classList.add("earthquake");
    const oldStyle = item.style.background
    const t = 50;
    for (let i = 0; i < 3; i++) {
        item.style.background = flashColor;
        await sleep(t);
        item.style.background = oldStyle;
        await sleep(t);
    }
    item.classList.remove("earthquake");
    windowFlashing = false;

}

function setDifficulty(level = 1) {
    //harder for each level
    for (let i = level; i < 11; i++) {
        numberOfLives += 1;
        startBonus -= 200;
        theImageSize += 1.5;
        difficultyGain -= 1;
        timeLimit += 100;
        timeLeft += 100;
    }
    if (theImageSize <= 0) theImageSize = .5;
}

function calculateBonus() {
    return Math.floor(startBonus - (roundTime - 500) - (numPenalties * penaltyCost));
}

function addRoundTimeRecord(time) {
    const scoreRow = document.createElement("div");
    const scoreCol = document.createElement("div");

    scoreRow.setAttribute("class", "row slide-in");
    scoreCol.setAttribute("class", "col small-text text-truncate");

    scoreCol.innerHTML = `${time / 100}s<br>+${calculateBonus()}pts`;

    scoreRow.appendChild(scoreCol);
    if (timeKeeper.childNodes.length > 4) timeKeeper.removeChild(timeKeeper.firstElementChild);
    timeKeeper.appendChild(scoreRow);

}

function slideUpdate() {

    let tempText = "";
    let smileySrc = require("./img/smile.png");

    switch (parseInt(theSlider.value)) {
        case 1:
            tempText = "Psshhh... EASY!";
            smileySrc = require("./img/Emoji-Drool.png");
            break;
        case 2:
            tempText = "Stepping it up I see...";
            smileySrc = require("./img/Emoji-Nap.png");
            break;
        case 3:
            tempText = "Okay, not bad.";
            smileySrc = require("./img/Emoji-Chill.png");
            break;
        case 4:
            tempText = "Hmmm... is it time to pay attention?.";
            smileySrc = require("./img/Emoji-Perturbed.png");
            break;
        case 5:
            tempText = "Hold on...";
            smileySrc = require("./img/Emoji-Concerned.png");
            break;
        case 6:
            tempText = "Oh? looks like a challenge!";
            smileySrc = require("./img/Emoji-Gasp.png");
            break;
        case 7:
            tempText = "Things are getting a bit crazy.";
            smileySrc = require("./img/Emoji-Shocked.png");
            break;
        case 8:
            tempText = "You really should reconsider...";
            smileySrc = require("./img/Emoji-Angry.png");
            break;
        case 9:
            tempText = "Stop! Are you insane??";
            smileySrc = require("./img/Emoji-More-Angry.png");
            break;
        case 10:
            tempText = "HOLY $%^&#@! Call the police!";
            smileySrc = require("./img/Emoji-On-Fire.png");
            break;

    }

    defaultValues();
    setDifficulty(parseInt(theSlider.value));
    updateHealth(numberOfLives);

    const bgColorMath = (20 * parseInt(theSlider.value))
    document.documentElement.style.setProperty("--background-color-var", `${bgColorMath}`)
    document.getElementById("diffHead").textContent = "Difficulty: " + parseInt(theSlider.value);
    document.getElementById("smiley1").src = smileySrc;
    document.getElementById("smiley2").setAttribute("src", smileySrc);
    imgPath = smileySrc;
    boxText.textContent = tempText;
}

function giveHint() {
    flashItem(theLeftSide.lastElementChild, "green");
}