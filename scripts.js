let timerTimeout; // Timer timeout
let durationInSeconds = 0; // Total duration in seconds
let totalPixels; // Total number of pixel blocks
let activePixels = 0; // Number of active pixel blocks
let intervalTime; // Time interval between pixel updates
let startTime; // Start time of the timer
let nextActivationTime; // Time when the next pixel should activate
let activeDots = new Set(); // Set to store active dots
let displayRemaining = true; // Set to true to ensure the number timer displays by default
let resizeTimeout; // Timeout for debouncing the resize event
let glowInterval; // Interval for glowing pixels

// Function to initialize the timer display
function initializeTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.innerHTML = ''; // Clear existing pixels

    // Fixed dot size
    const pixelSize = 6; // Set a fixed size for the dots (6px by 6px)

    // Calculate the number of dots based on the screen size
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight; // Keep height within 90% to maintain margin
    const columns = Math.floor(displayWidth / (pixelSize + 3)); // Include gap size
    const rows = Math.floor(displayHeight / (pixelSize + 3)); // Include gap size
    totalPixels = columns * rows; // Total number of pixels based on screen size

    // Set CSS grid properties dynamically
    timerDisplay.style.gridTemplateColumns = `repeat(${columns}, ${pixelSize}px)`;
    timerDisplay.style.gridTemplateRows = `repeat(${rows}, ${pixelSize}px)`;

    // Create pixel blocks
    for (let i = 0; i < totalPixels; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');

        // If this pixel was active before, keep it active
        if (activeDots.has(i)) {
            pixel.classList.add('active');
        }

        timerDisplay.appendChild(pixel);
    }

    if (displayRemaining) {
        updateRemainingTime(); // Ensure the time is updated after resizing
    }
}

// Function to debounce the window resize event
function debounceResize() {
    clearTimeout(resizeTimeout); // Clear the previous timeout
    resizeTimeout = setTimeout(() => {
        initializeTimer();
        if (activePixels < totalPixels) {
            startTimer(); // Restart the timer to resume countdown
        }
    }, 200); // Reinitialize after 200ms delay
}

// Function to start the timer
function startTimer() {
    cancelAnimationFrame(timerTimeout); // Cancel any ongoing animation frames to avoid conflicts
    activePixels = 0; // Reset pixel counter

    // Get the user-defined duration from the input fields
    const hours = parseInt(document.getElementById('hoursInput').value) || 0;
    const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
    const seconds = parseInt(document.getElementById('secondsInput').value) || 0;

    // Calculate the total duration in seconds
    durationInSeconds = hours * 3600 + minutes * 60 + seconds + 0.5;

    // Ensure the duration is at least 1 second
    if (durationInSeconds <= 0) {
        alert("Please enter a time greater than 0.");
        return;
    }

    // Hide the title and GitHub button when the timer starts
    document.getElementById('appTitle').style.display = 'none';
    document.getElementById('githubFooter').style.display = 'none';

    // Set display flags and show elements
    displayRemaining = true; // Ensure the number timer is displayed by default
    document.getElementById('timeDisplay').style.display = 'flex'; 
    document.getElementById('resetButton').style.display = 'block';

    // Hide settings and show timer display
    document.getElementById('settingsContainer').style.display = 'none';
    document.getElementById('timerContainer').style.display = 'flex';

    // Adjust duration to add an extra second for the dot activation
    const adjustedDuration = durationInSeconds - 0.5;

    // Calculate the interval time for each pixel to turn active
    intervalTime = (adjustedDuration * 1000) / totalPixels;

    // Record the start time and the time for the next activation
    startTime = performance.now();
    nextActivationTime = startTime + intervalTime;

    // Start the timer with immediate pixel update
    updatePixel();
    updateRemainingTime(); // Start updating the remaining time
}

// Function to update each pixel
function updatePixel() {
    const currentTime = performance.now();

    // Calculate how many pixels should be activated based on the elapsed time
    const elapsedTime = (currentTime - startTime) / 1000; // Elapsed time in seconds
    const pixelsToActivate = Math.floor((elapsedTime / (durationInSeconds - 0.5)) * totalPixels); // Adjusted duration for the extra second

    // Activate the pixels up to the calculated number
    while (activePixels < pixelsToActivate && activePixels < totalPixels) {
        document.getElementsByClassName('pixel')[activePixels].classList.add('active');
        activeDots.add(activePixels); // Store the index of active pixels
        activePixels++;
    }

    // Continue the animation loop
    if (activePixels < totalPixels) {
        timerTimeout = requestAnimationFrame(updatePixel); // Use requestAnimationFrame for the next update
    } else {
        playAlarm();
    }
}

// Function to update the remaining time continuously
function updateRemainingTime() {
    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
    const remainingTimeInSeconds = Math.max(durationInSeconds - elapsedTime, 0); // Calculate remaining time

    const hours = Math.floor(remainingTimeInSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(remainingTimeInSeconds % 60).toString().padStart(2, '0');

    document.getElementById('remainingTime').textContent = `${hours}:${minutes}:${seconds}`;

    if (activePixels < totalPixels) {
        requestAnimationFrame(updateRemainingTime); // Continue updating the time display
    }
}

// Function to reset the timer
function resetTimer() {
    cancelAnimationFrame(timerTimeout); // Cancel any ongoing animation frames
    clearInterval(glowInterval); // Stop glowing when reset
    activePixels = 0;
    activeDots.clear(); // Clear the active dots

    // Show the title and GitHub button again when resetting
    document.getElementById('appTitle').style.display = 'block';
    document.getElementById('githubFooter').style.display = 'block';

    // Set display flags correctly
    displayRemaining = true; // Ensure the number timer will be displayed after reset

    // Show settings and hide timer display
    document.getElementById('settingsContainer').style.display = 'flex';
    document.getElementById('timerContainer').style.display = 'none';
    document.getElementById('timeDisplay').style.display = 'none'; // Hide time display
    document.getElementById('resetButton').style.display = 'none'; // Hide reset button

    initializeTimer();
}

// Function to play an alarm sound and trigger glowing pixels
function playAlarm() {
    const audio = new Audio('alarm.mp3');
    audio.play();
    glowRandomPixels(); // Start glowing random pixels
}

// Function to glow and fade of the pixels
// Function to gradually increase the percentage of glowing pixels from 10% to 50%
// Function to gradually increase the percentage of glowing pixels from 10% to 50% and maintain it
function glowRandomPixels() {
    const pixels = document.getElementsByClassName('pixel');
    const totalPixels = pixels.length;
    let glowPercentage = 0.1; // Start with 10%
    const maxGlowPercentage = 0.5; // Maximum of 50%
    const duration = 10000; // 10 seconds to reach 50%
    const steps = 10; // Number of steps to reach the maximum
    const stepDuration = duration / steps; // Duration for each step

    // Interval to gradually increase the percentage
    glowInterval = setInterval(() => {
        // Calculate the current number of pixels to glow
        const glowCount = Math.floor(totalPixels * glowPercentage);

        // Randomly select pixels to glow
        const randomIndices = new Set();
        while (randomIndices.size < glowCount) {
            randomIndices.add(Math.floor(Math.random() * totalPixels));
        }

        // Glow selected pixels with random delays
        randomIndices.forEach(index => {
            const pixel = pixels[index];
            const randomColor = getRandomColor();

            // Set a random delay for each pixel to start glowing
            setTimeout(() => {
                pixel.style.transition = 'background-color 1s ease-in-out'; // Smooth transition for 1 second
                pixel.style.backgroundColor = randomColor; // Set random color

                // Fade out after 1 second
                setTimeout(() => {
                    pixel.style.transition = 'background-color 1s ease-in-out';
                    pixel.style.backgroundColor = ''; // Fade out to default color
                }, 1000);
            }, Math.random() * 1000); // Random delay between 0 and 1 second
        });

        // Increase the percentage gradually
        if (glowPercentage < maxGlowPercentage) {
            glowPercentage += (maxGlowPercentage - 0.1) / steps; // Increment percentage to reach 50% over 10 seconds
        } else {
            glowPercentage = maxGlowPercentage; // Maintain 50% glowing indefinitely
        }
    }, stepDuration); // Repeat every step duration
}



// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Initialize the timer display on page load
window.onload = initializeTimer;
window.addEventListener('resize', debounceResize); // Use debounced resize event

// Event listener to toggle display on click
document.body.addEventListener('click', () => {
    if (document.getElementById('timerContainer').style.display === 'flex') {
        toggleDisplay();
    }
});

// Function to toggle remaining time display and "Reset" button visibility
function toggleDisplay() {
    displayRemaining = !displayRemaining; // Toggle the display flag

    if (displayRemaining) {
        document.getElementById('timeDisplay').style.display = 'flex'; // Show time display
    } else {
        document.getElementById('timeDisplay').style.display = 'none'; // Hide time display
    }
}
