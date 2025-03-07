const menuWrapper = document.querySelector('.menu-wrapper');
const contentContainer = document.querySelector('.content-container');
const menuItems = document.querySelectorAll('.menu-item');
const contentBoxes = document.querySelectorAll('.content-box');
let selectedIndex = 0;
let gameStarted = false;
let isAnimating = false;
let currentAnimation;
let animationTimer;
let isInsideContent = false; // Flag to track if we're in content

// --- ADDED: Object to store hasBeenTyped flags ---
const hasBeenTyped = {};

// Initialize hasBeenTyped for each content box
contentBoxes.forEach((box, index) => {
  hasBeenTyped[index] = false;
});

const animationDelay = 500;

function typeWriter(element, text, i = 0) {
    return new Promise(resolve => {
        function animate() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                currentAnimation = setTimeout(animate, 20);
            } else {
                resolve();
            }
        }
        animate();
    });
}

// --- MODIFIED showContent FUNCTION ---
async function showContent(index) {
    if (currentAnimation) {
        clearTimeout(currentAnimation);
    }
    isAnimating = true;

    contentBoxes.forEach(box => {
        box.classList.remove('active');
    });

    const activeBox = contentBoxes[index];
    activeBox.classList.add('active');

    const sectionDescription = activeBox.querySelector('.section-description');
    const paragraphs = sectionDescription.querySelectorAll('p');

    // --- CHECK hasBeenTyped FLAG ---
    if (hasBeenTyped[index]) {
        // Content has already been typed, just display it
        paragraphs.forEach(paragraph => {
            paragraph.innerHTML = paragraph.getAttribute('data-original-text'); // Restore original text

        });
    } else {
        // Content hasn't been typed, run typewriter effect

        for (const paragraph of paragraphs) {
            const text = paragraph.textContent;
            //store the original text
            paragraph.setAttribute('data-original-text', text);
            paragraph.textContent = '';
            await typeWriter(paragraph, text);
        }

        // Set hasBeenTyped to true for this content box
        hasBeenTyped[index] = true;
    }

    isAnimating = false;
}

function selectItem(index) {
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

    if (animationTimer) {
        clearTimeout(animationTimer);
    }

    animationTimer = setTimeout(() => {
        showContent(index);
        animationTimer = null;
    }, animationDelay);
}

function startGame() {
    gameStarted = true;
    document.getElementById('start-screen').style.display = 'none';
    menuWrapper.style.display = 'flex';
    contentContainer.style.display = 'flex';
    selectItem(selectedIndex);
}

menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (gameStarted) {
            selectItem(index);
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (!gameStarted) {
        startGame();
    } else {
        if (!isInsideContent) {
            // Main menu navigation (up/down)
            if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
                selectedIndex = (selectedIndex + 1) % menuItems.length;
            } else if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
                selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
            }
            selectItem(selectedIndex);

            // Entering content section (right arrow)
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
                const activeContentBox = contentBoxes[selectedIndex];
                const firstReadMoreButton = activeContentBox.querySelector('button[id^="read-more-"]');
                if (firstReadMoreButton) {
                    firstReadMoreButton.focus();
                    isInsideContent = true;
                    event.preventDefault(); // Prevent scrolling
                }
            }
        } else {
            // Inside content navigation (up/down/left/right)
            const activeContentBox = contentBoxes[selectedIndex];
            const readMoreButtons = activeContentBox.querySelectorAll('button[id^="read-more-"]');
            const currentButtonIndex = Array.from(readMoreButtons).indexOf(document.activeElement);

            if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
                if (currentButtonIndex < readMoreButtons.length - 1) {
                    readMoreButtons[currentButtonIndex + 1].focus();
                    event.preventDefault();
                }
            } else if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
                if (currentButtonIndex > 0) {
                    readMoreButtons[currentButtonIndex - 1].focus();
                    event.preventDefault();
                }
            } else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
                // Return to main menu
                menuItems[selectedIndex].focus();
                isInsideContent = false;
                event.preventDefault();
            } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd' || event.key === ' ' || event.key === 'Enter') {
                // --- ADDED: Trigger button click on Right Arrow/Space/Enter ---
                if (document.activeElement.id.startsWith('read-more-')) {
                    document.activeElement.click(); // Simulate a click
                }
            }
        }
    }
});

// --- ADDED READ MORE BUTTON CLICK HANDLER ---
const readMoreButton = document.getElementById('read-more-projects');
const popupContainer = document.getElementById('popup-container');

readMoreButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent menu item click
    popupContainer.style.display = 'block'; // Show the pop-up
    document.addEventListener('keydown', handleAnyKey);
    document.addEventListener('click', handleAnyClick);
    isInsideContent = false; //we want to be on the regular menu now
});

function handleAnyKey(event){
    popupContainer.style.display = 'none';
    document.removeEventListener('keydown', handleAnyKey); // cleanup
    selectItem(selectedIndex)
}
function handleAnyClick(event){
    popupContainer.style.display = 'none';
    document.removeEventListener('click', handleAnyClick);
}

// initially hide menu and content
menuWrapper.style.display = 'none';
contentContainer.style.display = 'none';

function flashPressStart() {
    const pressStart = document.getElementById('press-start');
    pressStart.style.opacity = (pressStart.style.opacity === '0' || pressStart.style.opacity === '') ? '1' : '0';
}

setInterval(flashPressStart, 500); // flash speed (milliseconds)