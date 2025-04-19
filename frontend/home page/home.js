document.addEventListener('DOMContentLoaded', function() {
    const exploreBtn = document.querySelector('.explore-btn');
    const pageTransition = document.querySelector('.page-transition');
    
    exploreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Activate the transition overlay
        pageTransition.classList.add('active');
        
        // After transition completes, redirect to map.html
        setTimeout(function() {
            // Store a flag in sessionStorage to indicate we're coming from a transition
            sessionStorage.setItem('pageTransition', 'true');
            window.location.href = 'map.html';
        }, 600); // Match this to the transition duration in CSS
    });
});