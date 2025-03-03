document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to exercise links
    const exerciseLinks = document.querySelectorAll('.exercise-link');

    exerciseLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior

            // Get the exercise ID from the data attribute
            const exerciseId = this.getAttribute('data-exercise-id');

            // Make an AJAX request to fetch exercise details
            fetch(`/exercise/${exerciseId}/details/`)
                .then(response => response.json())
                .then(data => {
                    // Check if the response contains an error
                    if (data.error) {
                        alert(data.error);
                        return;
                    }

                    // Update the exercise details on the page
                    document.getElementById('exercise-name').textContent = data.name;
                    document.getElementById('exercise-description').textContent = data.description;
                    document.getElementById('exercise-muscles').textContent = data.muscles.join(', ');

                    // Update exercise video (if available)
                    if (data.video_url) {
                        document.getElementById('exercise-video').innerHTML = `<video width="100%" controls><source src="${data.video_url}" type="video/mp4"></video>`;
                    } else {
                        document.getElementById('exercise-video').innerHTML = '<p>No video available.</p>';
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    });
});