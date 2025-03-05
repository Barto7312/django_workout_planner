document.addEventListener("DOMContentLoaded", function() {
    fetch('/workouts/user/')
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('workout-select');
        select.innerHTML = '<option value="">Select a Workout</option>'; 
        
        data.forEach(workout => {
            const option = document.createElement('option');
            option.value = workout.id;
            option.textContent = workout.name;
            select.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching workouts:', error));



    const workoutSelect = document.getElementById("workout-select");
    const mainWindow = document.querySelector(".main-window");

    // Event listener for workout selection
    workoutSelect.addEventListener("change", function () {
        const workoutId = this.value;

        if (workoutId) {
            fetch(`/workout/${workoutId}/details/`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        mainWindow.innerHTML = `<p>${data.error}</p>`;
                        return;
                    }

                    // Build workout details UI
                    let workoutHTML = `
                        <h2>${data.name}</h2>
                        <p><strong>Start Date:</strong> ${data.start_date}</p>
                        <p><strong>Rest Days:</strong> ${data.rest_days}</p>
                        <h3>Workout Days:</h3>
                        <ul>
                    `;

                    if (data.workout_days.length > 0) {
                        data.workout_days.forEach(day => {
                            workoutHTML += `<li>${day.day_order}. ${day.name}</li>`;
                        });
                    } else {
                        workoutHTML += `<p>No workout days added yet.</p>`;
                    }

                    workoutHTML += `</ul>`;

                    mainWindow.innerHTML = workoutHTML;
                })
                .catch(error => {
                    console.error("Error fetching workout details:", error);
                    mainWindow.innerHTML = "<p>Failed to load workout details.</p>";
                });
        } else {
            mainWindow.innerHTML = "<p>Please select a workout.</p>";
        }
    });


});
