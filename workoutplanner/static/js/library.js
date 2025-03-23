document.addEventListener("DOMContentLoaded", function() {
    displayLibrary();      
});



function displayLibrary(){
    //display first exercise
    displayExercise(1);

    //assign function to buttons
    const exerciseButtons = document.querySelectorAll('.exercise-button')
    exerciseButtons.forEach(button => {
        button.onclick = function() {
            const exerciseId = this.getAttribute('data-exercise-id');
            displayExercise(exerciseId);
        };
    });

    //add filtering to the search bar
    const searchBox = document.getElementById("exercise-search-box");
    searchBox.addEventListener("input", filterExercises);

    //add filtering to the categories dropdown menu
    const categoryFilter = document.getElementById("category-filter");
    const exerciseCategories = document.querySelectorAll(".exercise-category");
    categoryFilter.addEventListener("change", function () {
        filterCategories();
    });

    //Filtering Exercises
    function filterExercises() {
        const searchText = searchBox.value.toLowerCase();

        exerciseCategories.forEach((category) => {
            let hasVisibleExercise = false;
            const exercises = category.querySelectorAll(".exercise-button");
    
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
    
    //filtering Categories
    function filterCategories(){
        const selectedCategory = categoryFilter.value; 
    
        exerciseCategories.forEach((item) => {
            const exerciseCategory = item.getAttribute("data-category-id");

            if (selectedCategory === "all" || exerciseCategory === selectedCategory) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    }

    //displaying exercise details
    function displayExercise(exerciseId){
        fetch(`/exercise/${exerciseId}/details/`)
        .then(response => response.json())
        .then(data => {
            
            if (data.error) {
                alert(data.error);
                return;
            }
    
            document.getElementById('exercise-name').textContent = data.name;
            document.getElementById('exercise-description').textContent = data.description;
    
            if (data.image_url) {
                document.getElementById('exercise-image').innerHTML = `<img src="${data.image_url}">`;
            } else {
                document.getElementById('exercise-image').innerHTML = '<p>No image available.</p>';
            }
        })
        .catch(error => console.error('Error:', error));
    }
}
