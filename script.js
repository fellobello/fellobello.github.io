// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const menuWrapper = document.querySelector('.menu-wrapper');
const contentContainer = document.querySelector('.content-container');
const menuItems = document.querySelectorAll('.menu-item');
const contentBoxes = document.querySelectorAll('.content-box');
const pressStart = document.getElementById('press-start');
//const readMoreButton = document.getElementById('read-more');
const popupContainer = document.getElementById('popup-container');
const popupText = document.getElementById('popup-description');
const popupTitle = document.getElementById('popup-title');
const popupDescription = document.getElementById('popup-description');

// --- State Variables ---
let selectedIndex = 0;
let gameStarted = false;
let currentTypewriterAbort = false;
let timeoutId;
let currentTypewriterPromise;

// --- Utility Functions ---

/**
 * Types out text in an element with a typewriter effect.
 *
 * @param {HTMLElement} element - The element to type into.
 * @param {string} text - The text to type.
 * @param {number} [delay=20] - The delay between characters in milliseconds.
 * @returns {Promise<void>}
 */
async function typeWriter(element, text, delay = 20) {
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
            popupText.innerHTML = project.text.replace(/\n\n/g, '<p></p>'); // Handle paragraphs

            if (project.images && project.images.length > 0) {
                const imageContainer = document.createElement('div'); // Create a div
                imageContainer.classList.add('gif-container'); // Add the gif-container class

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

// --- Event Listeners ---

// Menu item click handler
menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (gameStarted) {
            selectMenuItem(index);
        }
    });
});

// Keydown event handler
document.addEventListener('keydown', event => {
    if (!gameStarted) {
        startGame();
    } else {
        if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
            selectedIndex = (selectedIndex + 1) % menuItems.length;
        } else if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
            selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
        }
        selectMenuItem(selectedIndex);
    }
});

// "Read More" button click handler
//readMoreButton.addEventListener('click', () => {
//    popupContainer.style.display = 'block';
//});

// Popup click handler
popupContainer.addEventListener('click', () => {
    popupContainer.style.display = 'none';
});

// Project button click handlers
const projectButtons = document.querySelectorAll('.read-more-project');
projectButtons.forEach(button => {
    button.addEventListener('click', function() {
        const projectKey = this.dataset.projectKey;
        loadAndShowProject(projectKey);
    });
});

// --- Initialization ---

// Hide menu and content initially
menuWrapper.style.display = 'none';
contentContainer.style.display = 'none';

// Start flashing "Press Start" text
setInterval(flashPressStart, 500);