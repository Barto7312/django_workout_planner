document.addEventListener("DOMContentLoaded", function() {
    const createWorkoutBtn = document.getElementById("create-workout-btn");
    const existingWorkoutsDropdown = document.getElementById("existing-workouts-dropdown");
    const workoutDetailsForm = document.getElementById("workout-details-form");
    const workoutDaysSection = document.getElementById("workout-days");
    const addDayBtn = document.getElementById("add-day-btn");
    const daysContainer = document.getElementById("days-container");

    // Show the workout form when creating a new workout
    createWorkoutBtn.addEventListener("click", function() {
        workoutDetailsForm.style.display = "block";
        workoutDaysSection.style.display = "none"; // Hide the days section
    });

    // Load the existing workout details when a workout is selected
    existingWorkoutsDropdown.addEventListener("change", function() {
        const workoutId = existingWorkoutsDropdown.value;

        if (workoutId) {
            // Fetch the workout details from the server (via AJAX)
            fetch(`/workout/${workoutId}/details/`)
                .then(response => response.json())
                .then(data => {
                    // Fill the form with workout details
                    document.getElementById("workout-name").value = data.name;
                    document.getElementById("workout-description").value = data.description;
                    document.getElementById("rest-days").value = data.restDays;
                    document.getElementById("start-date").value = data.startDate;

                    // Display workout days (if any)
                    daysContainer.innerHTML = '';  // Clear any existing days
                    data.days.forEach(day => {
                        addWorkoutDayToDOM(day);
                    });

                    // Show the workout form and days section
                    workoutDetailsForm.style.display = "block";
                    workoutDaysSection.style.display = "block";
                })
                .catch(error => console.log('Error fetching workout details:', error));
        } else {
            // Hide workout days if no workout is selected
            workoutDetailsForm.style.display = "block";
            workoutDaysSection.style.display = "none";
        }
    });

    // Add a new workout day
    addDayBtn.addEventListener("click", function() {
        const newDay = {
            name: "New Day",
            exercises: []
        };
        addWorkoutDayToDOM(newDay);
    });

    // Helper function to add a workout day to the DOM
    function addWorkoutDayToDOM(day) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("workout-day");
        dayDiv.innerHTML = `
            <div>
                <input type="text" name="day-name" value="${day.name}">
                <button class="edit-day-btn">Edit Day</button>
                <button class="remove-day-btn">Remove Day</button>
            </div>
            <div class="day-exercises">
                ${day.exercises.map(exercise => `
                    <div class="exercise">
                        <span>${exercise.name}</span>
                        <button class="remove-exercise-btn">Remove</button>
                    </div>
                `).join('')}
                <button class="add-exercise-btn">Add Exercise</button>
            </div>
        `;
        daysContainer.appendChild(dayDiv);

        // Add event listeners for editing/removing the day
        dayDiv.querySelector(".edit-day-btn").addEventListener("click", function() {
            // Handle editing day logic
            console.log("Editing day:", day.name);
        });

        dayDiv.querySelector(".remove-day-btn").addEventListener("click", function() {
            // Remove the day
            dayDiv.remove();
        });

        dayDiv.querySelector(".add-exercise-btn").addEventListener("click", function() {
            // Handle adding exercises logic
            console.log("Adding exercise to day:", day.name);
        });
    }

    // Handle saving the workout plan
    document.getElementById("workout-form").addEventListener("submit", function(e) {
        e.preventDefault();

        // Collect data and send it to the server
        const workoutData = {
            name: document.getElementById("workout-name").value,
            description: document.getElementById("workout-description").value,
            restDays: document.getElementById("rest-days").value,
            startDate: document.getElementById("start-date").value,
            // You can collect workout days and exercises here too
        };

        fetch('/create-or-edit-workout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(workoutData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Workout saved:", data);
            // Optionally show a success message or reset form
        })
        .catch(error => console.log('Error saving workout:', error));
    });
});
