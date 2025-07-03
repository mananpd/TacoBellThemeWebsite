// js/app.js

// Function to load HTML content into a placeholder
async function loadHTML(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Could not load ${url}:`, error);
    }
}

// Script for the Food Items Slider functionality (mobile only)
let foodSlides;
let foodNavBtns;
let currentFoodSlide = 0;
let foodSlideInterval;

// Function to load a specific image
function loadImage(slideElement) {
    const img = slideElement.querySelector('.photo');
    if (!img) return; // Exit if no image found

    // If image has data-src and hasn't been loaded yet, load it from data-src
    if (img.dataset.src && img.src !== img.dataset.src) {
        img.src = img.dataset.src;
        img.onload = () => {
            slideElement.classList.add('image-loaded');
        };
        img.onerror = () => {
            console.error('Failed to load image:', img.dataset.src);
            img.src = 'https://placehold.co/288x288/CCCCCC/333333?text=Error';
        };
    } else if (!img.dataset.src) {
        // This branch handles images that have their src directly set (like the first one)
        // Ensure the 'image-loaded' class is applied if it's already complete
        if (img.complete && img.naturalHeight !== 0) {
            slideElement.classList.add('image-loaded');
        } else {
            // If not yet complete, wait for it to load
            img.onload = () => {
                slideElement.classList.add('image-loaded');
            };
            img.onerror = () => {
                console.error('Failed to load eager image:', img.src);
                img.src = 'https://placehold.co/288x288/CCCCCC/333333?text=Error';
            };
        }
    }
}


function initializeFoodSlider() {
    foodSlides = document.querySelectorAll('.food-slide');
    foodNavBtns = document.querySelectorAll('.food-nav-btn');

    if (foodSlides.length === 0) {
        console.warn("Food slider elements not found. Skipping slider initialization.");
        return;
    }

    // --- IMPORTANT FIX FOR FIRST IMAGE ---
    // Always ensure the initial active slide (index 0) is immediately visible and 'image-loaded'
    // regardless of mobile/desktop.
    const firstSlide = foodSlides[0];
    const firstImg = firstSlide.querySelector('.photo');
    if (firstImg) {
        // If the image is already complete (browser loaded it eagerly), apply the class.
        // Otherwise, make sure the onload listener adds the class.
        if (firstImg.complete && firstImg.naturalHeight !== 0) {
            firstSlide.classList.add('image-loaded');
        } else {
            firstImg.onload = () => {
                firstSlide.classList.add('image-loaded');
            };
            firstImg.onerror = () => {
                console.error('Failed to load eager image:', firstImg.src);
                firstImg.src = 'https://placehold.co/288x288/CCCCCC/333333?text=Error';
            };
        }
    }
    // --- END FIX ---


    if (window.innerWidth < 768) { // md breakpoint is 768px
        // Ensure only the active slide is visible on mobile and load its image
        foodSlides.forEach((slide, index) => {
            slide.style.display = (index === currentFoodSlide) ? 'flex' : 'none';
        });
        foodNavBtns.forEach((btn, index) => {
            btn.classList.toggle('active', index === currentFoodSlide);
        });
        startFoodSlider(); // Start auto-play
    } else {
        // On desktop, ensure all slides are visible and load all their images
        foodSlides.forEach(slide => {
            slide.style.display = 'flex'; // Ensure all are visible
            loadImage(slide); // Load image for each desktop slide (lazy ones will load from data-src)
        });
        if (foodSlideInterval) {
            clearInterval(foodSlideInterval);
        }
    }
}


function playFoodSlide(index) {
    // Only apply slide logic if on mobile
    if (window.innerWidth < 768) {
        foodSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            slide.style.display = 'none'; // Explicitly hide non-active
        });
        foodNavBtns.forEach(btn => btn.classList.remove('active'));

        foodSlides[index].classList.add('active');
        foodSlides[index].style.display = 'flex'; // Explicitly show active
        foodNavBtns[index].classList.add('active');
        loadImage(foodSlides[index]); // Load image for the newly active slide
    }
}

function nextFoodSlide() {
    currentFoodSlide = (currentFoodSlide + 1) % foodSlides.length;
    playFoodSlide(currentFoodSlide);
}

function startFoodSlider() {
    if (foodSlideInterval) {
        clearInterval(foodSlideInterval);
    }
    foodSlideInterval = setInterval(nextFoodSlide, 5000); // Change slide every 5 seconds
}

// Event listeners for food slider navigation buttons
// Attach after elements are loaded
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('food-nav-btn')) {
        const index = Array.from(foodNavBtns).indexOf(event.target);
        if (index !== -1) {
            currentFoodSlide = index;
            playFoodSlide(currentFoodSlide);
            startFoodSlider(); // Restart interval on manual navigation
        }
    }
});

// Re-initialize slider on window resize to switch between desktop/mobile behavior
window.addEventListener('resize', () => {
    initializeFoodSlider();
});


// Load header and footer when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Load header first
    await loadHTML('header.html', 'header-placeholder');

    // Now that the header is loaded, run its associated script logic
    const pageSelect = document.getElementById('page-select');
    const desktopLinks = document.querySelectorAll('.desktop-nav-link');

    // Get the current page filename (e.g., "index", "first-time-visit")
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    // --- Handle Mobile Dropdown ---
    if (pageSelect) {
        // Set the selected option in the dropdown for mobile
        if (currentPage) {
            pageSelect.value = currentPage;
        }
        // Add the event listener for mobile navigation
        pageSelect.addEventListener('change', function() {
            window.location.href = this.value + '.html';
        });
    }

    // --- Handle Desktop Links ---
    desktopLinks.forEach(link => {
        // Check if the link's data-page attribute matches the current page
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('font-bold', 'text-purple-100', 'underline', 'underline-offset-4'); // Highlight active link
        }
        // Add click listener for desktop links (though href handles it, this is for consistency)
        link.addEventListener('click', function(event) {
            // Prevent default if you want to add more logic, otherwise href works directly
            // event.preventDefault();
            // window.location.href = this.href;
        });
    });

    // Initialize the food slider after header and content are loaded
    // This is called here because the slider elements are part of the main content
    // and need to be present before initialization.
    initializeFoodSlider();

    // Finally, load the footer
    await loadHTML('footer.html', 'footer-placeholder');
});
