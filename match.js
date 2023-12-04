const theLeftSide = document.querySelector("#leftSide");
const theRightSide = document.querySelector("#rightSide");
const theGoButton = document.getElementById("letsGo");
const theRestartButton = document.getElementById("restartButton");
const theEndButton = document.getElementById("endButton");
const theSlider = document.getElementById("diffSlide");
const timeKeeper = document.getElementById("timeKeeper");
const slideColumn = document.getElementById("slideBox");
const optionsBox = document.getElementById("optionsBox");

const FLAG_COLOR = "red";
let imgPath = "./img/smile.png"

let theGameSize = 40;
let theImageSize = 5;
let rightSidePositon = (50 - theGameSize);

let startAmount = 1;
let numberOfFaces = startAmount;
let difficultyGain = 1;
let startLives = 0;
let runTime = false;
let playerScore = 0;
let penaltyCost = 100;
let numPenalties = 0;
let startBonus = 3000;
let hintsOn = false;
let audioOn = true;
let timeLimitOn = false;

let roundNumber = 1;
let numberOfGames = 1;
let numberOfLives = startLives;
let timePast = 0;
let roundTime = 0;
let hintTime = 0;
let windowFlashing = false;

window.addEventListener("load", firstLoad);
theGoButton.addEventListener("click", readySetGo);
theRestartButton.addEventListener("click", restartGame);
theEndButton.addEventListener("click", gameOver)
theSlider.addEventListener("change", slideUpdate)

//timer function
async function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
};

function firstLoad() {
    addSound("./audio/clock-ticking.mp3", "sound");
    addSound("./audio/wrong.mp3", "wrong");
    addSound("./audio/buzzer.mp3", "timeUp");
    defaultValues();
    slideUpdate();
}
function readySetGo() {

    defaultValues();
    setDifficulty(parseInt(theSlider.value));

    numberOfFaces = startAmount;
    numberOfLives = startLives;
    playerScore = 0;
    roundNumber = 1;
    timePast = 0;

    theGoButton.classList.add("d-none");
    theRestartButton.classList.add("d-none");
    theEndButton.classList.remove("d-none");
    slideColumn.classList.add("d-none");
    optionsBox.classList.add("d-none");

    playSound("sound", true);
    updateScore()
    updateHealth(numberOfLives);
    playGame();
}

function defaultValues() {
    startBonus = 3000;
    numberOfLives = 10;
    theGameSize = 40;
    if (document.getElementById("chkSmall").checked) {
        theImageSize = 0
    } else {
        theImageSize = 2
    }
    penaltyCost = 100
    difficultyGain = 7;
    hintsOn = document.getElementById("chkHints").checked;
    audioOn = document.getElementById("chkAudio").checked;
    timeLimitOn = document.getElementById("chkChallenge").checked;
}

async function playGame() {
    displayTimer(true);
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

        let secCount = (timePast / 100) % 100;
        let minCount = (Math.floor(secCount / 60)) % 60
        let hrCount = (Math.floor(minCount / 60)) % 60

        let tempValue = calculateBonus();
        if (tempValue > 0) tempValue = `+${tempValue}`;
        document.getElementById("timer").textContent = `${hrCount}:${minCount}:${secCount}`;
        timeKeeper.childNodes[0].textContent = tempValue;

        if (hintsOn) {
            if ((hintTime / 100) > roundNumber * difficultyGain) {
                giveHint();
                hintTime = 0;
            }
        }
    }
    if (!displayOn) {
        document.getElementById("timer").textContent = `0:0:0`;
    }
}

function generateFaces() {
    //set the game size
    document.documentElement.style.setProperty("--game-size", `${theGameSize}vw`);
    document.documentElement.style.setProperty("--image-size", `${theImageSize}vw`);
    document.documentElement.style.setProperty("--right-position", `${rightSidePositon}vw`);

    for (i = 0; i < numberOfFaces; i++) {
        const face = document.createElement("img");
        face.src = imgPath;

        let randomTop = Math.floor((Math.random() * (theGameSize - theImageSize)) + 1);
        let randomLeft = Math.floor((Math.random() * (theGameSize - theImageSize)) + 1);

        face.style.top = randomTop + "vw";
        face.style.left = randomLeft + "vw";

        theLeftSide.appendChild(face);
        theLeftSide.childNodes[i].addEventListener("click", wrongAnswer);
    }
    const leftSideImages = theLeftSide.cloneNode(true);

    leftSideImages.removeChild(leftSideImages.lastChild);
    //alert(leftSideImages.childNodes.length)
    for (let node of leftSideImages.childNodes) {
        theRightSide.appendChild(node.cloneNode());
    }

    theLeftSide.lastElementChild.addEventListener('click', nextLevel);
    theLeftSide.lastElementChild.removeEventListener('click', wrongAnswer);

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
    generateFaces();
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

    stopSound();
    playSound("timeUp", false, 1);
    clearTheScreen();
    runTime = false;
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

    theSlider.value = 1;
    slideUpdate();
    playerScore = 0;
    updateScore();
    numberOfLives = 10;
    updateHealth(numberOfLives);
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
    startLives = 0;

    switch (level) {
        case 1:
            startLives += 1;
            theImageSize += 1;
            difficultyGain -= 1;
        case 2:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
        case 3:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
            difficultyGain -= 1;
        case 4:
            startLives += 1;
            startBonus -= 200;
        case 5:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
            difficultyGain -= 1;
        case 6:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
        case 7:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
            difficultyGain -= 1;
        case 8:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
        case 9:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
            difficultyGain -= 1;
        case 10:
            startLives += 1;
            startBonus -= 200;
            theImageSize += 1;
            difficultyGain -= 1;

    }
    if (theImageSize <= 0) theImageSize = 2;
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
    const boxText = document.getElementById("promptText");
    let tempText = "";
    let smileySrc = "./img/smile.png";
    switch (parseInt(theSlider.value)) {
        case 1:
            tempText = "Psshhh... EASY!";
            smileySrc = "./img/Emoji-Nap.png";
            break;
        case 2:
            tempText = "Stepping it up I see...";
            smileySrc = "./img/Emoji-Nap.png";
            break;
        case 3:
            tempText = "Okay, not bad.";
            smileySrc = "./img/Emoji-Chill.png";
            break;
        case 4:
            tempText = "Hmmm... is it time to pay attention?.";
            smileySrc = "./img/Emoji-Perturbed.png";
            break;
        case 5:
            tempText = "Hold on...";
            smileySrc = "./img/Emoji-Perturbed.png";
            break;
        case 6:
            tempText = "Oh? looks like a challenge!";
            smileySrc = "./img/Emoji-Concerned.png";
            break;
        case 7:
            tempText = "Things are getting a bit crazy.";
            smileySrc = "./img/Emoji-Shocked.png";
            break;
        case 8:
            tempText = "You really should reconsider...";
            smileySrc = "./img/Emoji-Angry.png";
            break;
        case 9:
            tempText = "Stop! Are you insane??";
            smileySrc = "./img/Emoji-More-Angry.png";
            break;
        case 10:
            tempText = "HOLY $%^&#@! Call the police!";
            smileySrc = "./img/Emoji-On-Fire.png";
            break;

    }
    const bgColorMath = (20 * parseInt(theSlider.value))
    document.documentElement.style.setProperty("--background-color-var", `${bgColorMath}`)
    document.getElementById("diffHead").textContent = "Difficulty: " + parseInt(theSlider.value);
    document.getElementById("smiley1").setAttribute("src", smileySrc);
    document.getElementById("smiley2").setAttribute("src", smileySrc);
    imgPath = smileySrc;
    boxText.textContent = tempText;
}

function giveHint() {
    flashItem(theLeftSide.lastElementChild, "green");
}