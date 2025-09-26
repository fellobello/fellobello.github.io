const messages = [
    [
      "Designation:\n Steven Cochrane.",
      "I am a computer science graduate. areas of proficiency include mathematics and programming.",
      "My experiences encompass exploration of music, artistic endeavors, and game development. these activities stimulate creativity.",
      "Primary objective: problem-solving and continuous acquisition of knowledge.",
      "Location: phoenix, arizona. interests are varied. i maintain an active lifestyle. this is beneficial."
    ],
    [
      "these projects demonstrate integration of mathematical concepts and programming principles.",
      "further data is available on github: github.",
      "emphasis has been placed on code clarity and solution efficacy. it is... acceptable."
    ],
    [
      "proficiencies: java, python, html/css/javascript, c#, x86 assembly.",
      "skills: algorithm design, and a knowledge base including set theory, statistics, linear algebra, calculus.",
      "current interests: quantum and analogue computing, cellular automata, data analysis, game theory.",
      "interested in collaboration on impactful projects."
    ],
    [
      "inquiries, proposals, or collaborative opportunities are welcome.",
      "email: cochranesteven137@gmail.com",
      "github: github.com/fellobello"
    ]
  ];
  const startScreen = document.getElementById('start-screen');
  const mainWrapper = document.querySelector('.main-wrapper');
  const menuItems = document.querySelectorAll('.menu-item');
  const contentBoxes = document.querySelectorAll('.content-box');
  const pressStart = document.getElementById('press-start');
  const projectButtons = document.querySelectorAll('.read-more-project');
  const popupContainer = document.getElementById('popup-container');
  const popupOverlay = document.getElementById('popup-overlay');
  const popupTitle = document.getElementById('popup-title');
  const popupText = document.getElementById('popup-description');
  const popupClose = document.querySelector('.popup-close');
  
  let selectedIndex = 0;
  let gameStarted = false;
  let isNavigatingProjects = false;
  let selectedProjectIndex = 0;
  let currentTypewriterAbort = false;
  let currentTypewriterPromise = null;
  let timeoutId = null;
  
  // typewriter for one bubble
  async function typeWriter(element, text, delay = 15) {
    element.textContent = '';
    element.classList.add('visible');
    currentTypewriterAbort = false;
    for (let i = 0; i < text.length; i++) {
      if (currentTypewriterAbort) {
        element.textContent = text;
        return;
      }
      element.textContent += text[i];
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // render msg bubbles for active section
  async function showMessages(index) {
    const msgContainer = document.getElementById('msg-container-' + index);
    msgContainer.innerHTML = '';
    for (let i = 0; i < messages[index].length; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      msgContainer.appendChild(bubble);
      await typeWriter(bubble, messages[index][i]);
    }
    // for section 1 (projects), ensure project buttons are visible
    if (index === 1) {
      document.getElementById('project-buttons').style.display = 'flex';
    } else {
      document.getElementById('project-buttons').style.display = 'none';
    }
  }
  
  function showContent(index) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      contentBoxes.forEach(box => box.classList.remove('active'));
      contentBoxes[index].classList.add('active');
      showMessages(index);
      timeoutId = null;
    }, 150);
  }
  
  function selectMenuItem(index) {
    menuItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    selectedIndex = index;
    showContent(index);
    resetProjectButtonSelection();
    isNavigatingProjects = false;
  }
  
  function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    startScreen.style.display = 'none';
    mainWrapper.style.display = 'flex';
    selectMenuItem(selectedIndex);
  }
  
  function flashPressStart() {
    pressStart.style.opacity = (pressStart.style.opacity === '0' || pressStart.style.opacity === '') ? '1' : '0';
  }
  
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
  
  function resetProjectButtonSelection() {
    projectButtons.forEach(button => button.classList.remove('selected'));
    selectedProjectIndex = 0;
  }
  
  menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (gameStarted) selectMenuItem(index);
    });
  });
  
  // main keyboard navigation
  // space -- scroll section-description smoothly 50px per press
  // only if the message container is scrollable
  
  document.addEventListener('keydown', event => {
    if (!gameStarted) {
      startGame();
    } else {
      if (event.key === ' ') {
        event.preventDefault();
        const msgBox = document.getElementById('msg-container-' + selectedIndex);
        if (msgBox) {
          msgBox.scrollBy({ top: 50, behavior: 'smooth' });
        }
        return;
      }
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
          if (selectedButton) selectedButton.click();
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
  
  popupClose.addEventListener('click', () => {
    popupContainer.style.display = 'none';
    popupOverlay.style.display = 'none';
  });
  popupContainer.addEventListener('click', e => {
    if (e.target === popupContainer) {
      popupContainer.style.display = 'none';
      popupOverlay.style.display = 'none';
    }
  });
  projectButtons.forEach(button => {
    button.addEventListener('click', function() {
      // ...project display/loading function...
    });
  });
  
  mainWrapper.style.display = 'none';
  setInterval(flashPressStart, 500);
  