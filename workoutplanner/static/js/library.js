document.addEventListener("DOMContentLoaded", function() {

    //Displaying exercise info
    const exerciseLinks = document.querySelectorAll('.exercise-link');

    exerciseLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 

            const exerciseId = this.getAttribute('data-exercise-id');

            fetch(`/exercise/${exerciseId}/details/`)
                .then(response => response.json())
                .then(data => {
                    
                    if (data.error) {
                        alert(data.error);
                        return;
                    }

                    document.getElementById('exercise-name').textContent = data.name;
                    document.getElementById('exercise-description').textContent = data.description;
                    document.getElementById('exercise-muscles').textContent = data.muscles.join(', ');

                    if (data.video_url) {
                        document.getElementById('exercise-video').innerHTML = `<video width="100%" controls><source src="${data.video_url}" type="video/mp4"></video>`;
                    } else {
                        document.getElementById('exercise-video').innerHTML = '<p>No video available.</p>';
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    });

    //Category dropdown filter
    const categoryFilter = document.getElementById("category-filter");
    const exerciseCategories = document.querySelectorAll(".exercise-category");

    categoryFilter.addEventListener("change", function () {
        const selectedCategory = categoryFilter.value; 

        exerciseCategories.forEach((item) => {
            const exerciseCategory = item.getAttribute("data-category-id");

            if (selectedCategory === "all" || exerciseCategory === selectedCategory) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });

    //Filtering Exercises
    function filterExercises() {
        const searchText = searchBox.value.toLowerCase();

        exerciseCategories.forEach((category) => {
            let hasVisibleExercise = false;
            const exercises = category.querySelectorAll(".exercise-item");
    
            exercises.forEach((exercise) => {
                const exerciseName = exercise.textContent.toLowerCase();

                if (exerciseName.includes(searchText)) {
                    exercise.style.display = "block";
                    hasVisibleExercise = true;
                } else {
                    exercise.style.display = "none";
                }
            });

            if (hasVisibleExercise) {
                category.style.display = "block";
            } else {
                category.style.display = "none";
            }
        });
    }

    const searchBox = document.getElementById("exercise-search-box");
    searchBox.addEventListener("input", filterExercises);

});