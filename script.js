// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const menuWrapper = document.querySelector('.menu-wrapper');
const contentContainer = document.querySelector('.content-container');
const menuItems = document.querySelectorAll('.menu-item');
const contentBoxes = document.querySelectorAll('.content-box');
const pressStart = document.getElementById('press-start');
const popupContainer = document.getElementById('popup-container');
const popupTitle = document.getElementById('popup-title');
const popupText = document.getElementById('popup-description');
const projectButtons = document.querySelectorAll('.read-more-project');

// --- State Variables ---
let selectedIndex = 0;
let gameStarted = false;
let currentTypewriterAbort = false;
let timeoutId;
let currentTypewriterPromise;
let isNavigatingProjects = false;
let selectedProjectIndex = 0;

// --- Utility Functions ---

/**
 * Types out text in an element with a typewriter effect.
 *
 * @param {HTMLElement} element - The element to type into.
 * @param {string} text - The text to type.
 * @param {number} [delay=15] - The delay between characters in milliseconds.
 * @returns {Promise<void>}
 */
async function typeWriter(element, text, delay = 15) {
    element.innerHTML = '';
    currentTypewriterAbort = false;
    let writtenText = '';

    for (let i = 0; i < text.length; i++) {
        if (currentTypewriterAbort) {
            element.innerHTML = writtenText + text.substring(i);
            return;
        }
        writtenText += text.charAt(i);
        element.innerHTML += text.charAt(i);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

/**
 * Shows the content box at the given index with a typewriter effect.
 *
 * @param {number} index - The index of the content box to show.
 */
function showContent(index) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
        contentBoxes.forEach(box => box.classList.remove('active'));
        const activeBox = contentBoxes[index];
        activeBox.classList.add('active');

        const sectionDescription = activeBox.querySelector('.section-description');
        const paragraphs = sectionDescription.querySelectorAll('p');

        for (const paragraph of paragraphs) {
            currentTypewriterAbort = true;
            if (currentTypewriterPromise) {
                await currentTypewriterPromise;
            }
            currentTypewriterPromise = typeWriter(paragraph, paragraph.textContent);
            await currentTypewriterPromise;
        }
        timeoutId = null;
    }, 500);
}

/**
 * Selects the menu item at the given index and updates the UI.
 *
 * @param {number} index - The index of the menu item to select.
 */
function selectMenuItem(index) {
    menuItems.forEach((item, i) => {
        const arrow = item.querySelector('.arrow');
        if (i === index) {
            item.classList.add('selected');
            arrow.textContent = '>';
        } else {
            item.classList.remove('selected');
            arrow.textContent = '';
        }
    });
    selectedIndex = index;
    showContent(index);
    resetProjectButtonSelection();
    isNavigatingProjects = false;
}

/**
 * Starts the game by hiding the start screen and showing the menu and content.
 */
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    startScreen.style.display = 'none';
    menuWrapper.style.display = 'flex';
    contentContainer.style.display = 'flex';
    selectMenuItem(selectedIndex);
}

/**
 * Flashes the "Press Start" text.
 */
function flashPressStart() {
    pressStart.style.opacity = (pressStart.style.opacity === '0' || pressStart.style.opacity === '') ? '1' : '0';
}

/**
 * Fetches project data from JSON and populates the popup.
 *
 * @param {string} projectKey - The key of the project in the JSON file.
 */
async function loadAndShowProject(projectKey) {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();

        if (data[projectKey]) {
            const project = data[projectKey];

            popupTitle.textContent = project.title;
            popupText.innerHTML = project.text.replace(/\n\n/g, '<p></p>');

            if (project.images && project.images.length > 0) {
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('gif-container');

                project.images.forEach(imagePath => {
                    const img = document.createElement('img');
                    img.src = imagePath;
                    imageContainer.appendChild(img);
                });

                popupText.appendChild(imageContainer);
            }

            popupContainer.style.display = 'block';
        } else {
            console.error('Project not found:', projectKey);
            alert('Project details not found.');
        }
    } catch (error) {
        console.error('Error loading project data:', error);
        alert('Error loading project details.');
    }
}

/**
 * Selects a project button.
 *
 * @param {number} index - The index of the project button to select.
 */
function selectProjectButton(index) {
    projectButtons.forEach((button, i) => {
        if (i === index) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
    selectedProjectIndex = index;
}

/**
 * Resets the selection of project buttons.
 */
function resetProjectButtonSelection() {
    projectButtons.forEach(button => button.classList.remove('selected'));
    selectedProjectIndex = 0;
}

// --- Event Listeners ---

menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (gameStarted) {
            selectMenuItem(index);
        }
    });
});

document.addEventListener('keydown', event => {
    if (!gameStarted) {
        startGame();
    } else {
        if (isNavigatingProjects) {
            const projectCount = projectButtons.length;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
                selectedProjectIndex = (selectedProjectIndex + 1) % projectCount;
                selectProjectButton(selectedProjectIndex);
            } else if ((event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') && selectedProjectIndex === 0) {
                isNavigatingProjects = false;
                resetProjectButtonSelection();
            } else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
                selectedProjectIndex = (selectedProjectIndex - 1 + projectCount) % projectCount;
                selectProjectButton(selectedProjectIndex);
            } else if (event.key === ' ') {
                const selectedButton = projectButtons[selectedProjectIndex];
                if (selectedButton) {
                    selectedButton.click();
                }
            }
        } else {
            const menuCount = menuItems.length;
            if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
                selectedIndex = (selectedIndex + 1) % menuCount;
                selectMenuItem(selectedIndex);
            } else if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
                selectedIndex = (selectedIndex - 1 + menuCount) % menuCount;
                selectMenuItem(selectedIndex);
            } else if ((event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') && selectedIndex === 1) {
                isNavigatingProjects = true;
                selectProjectButton(selectedProjectIndex);
            }
        }
    }
});

popupContainer.addEventListener('click', () => {
    popupContainer.style.display = 'none';
});

projectButtons.forEach(button => {
    button.addEventListener('click', function() {
        const projectKey = this.dataset.projectKey;
        loadAndShowProject(projectKey);
    });
});

// --- Initialization ---

menuWrapper.style.display = 'none';
contentContainer.style.display = 'none';

setInterval(flashPressStart, 500);