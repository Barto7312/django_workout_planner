document.addEventListener("DOMContentLoaded", function() {
    fetchWorkouts();
});

// Fetch workouts and populate the dropdown
function fetchWorkouts() {
    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            const selectBox = document.getElementById("workout-select");
            const mainBox = document.getElementById("main-window")
            const detailsBox = document.getElementById("workout-details-box");
            selectBox.innerHTML = "";

            if (data.length === 0) {
                selectBox.innerHTML = "<option>No workouts found</option>";

                // let createWorkoutButton = document.createElement("button");
                // createWorkoutButton.id = "create-workout-button";
                // createWorkoutButton.textContent = "Create New Workout";

                // createWorkoutButton.addEventListener("click", function(){
                //     window.location.href = "/";
                // });

                // mainBox.appendChild(createWorkoutButton);

                mainBox.innerHTML = '<button id="create-workout">Create New Workout</button>';
                document.getElementById("create-workout").addEventListener("click", showWorkoutForm);

                return;
            }

            detailsBox.style.display = "block"; 

            data.forEach(workout => {
                let option = document.createElement("option");
                option.value = workout.id;
                option.textContent = workout.name;
                selectBox.appendChild(option);
            });

            // Load details of the first workout by default
            loadWorkoutDetails(data[0].id);
        })
        .catch(error => console.error("Error fetching workouts:", error));
}

// Load selected workout details into input fields
document.getElementById("workout-select").addEventListener("change", function() {
    loadWorkoutDetails(this.value);
});

function loadWorkoutDetails(workoutId) {
    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            let workout = data.find(w => w.id == workoutId);
            if (!workout) return;

            document.getElementById("workout-name").value = workout.name;
            document.getElementById("workout-rest-days").value = workout.restDays;
            document.getElementById("workout-start-date").value = workout.startDate;
        })
        .catch(error => console.error("Error loading workout details:", error));
}


function showWorkoutForm() {
    document.getElementById("workout-name").value = "";
    document.getElementById("workout-rest-days").value = "";
    document.getElementById("workout-start-date").value = "";
    
    document.getElementById("workout-details-box").style.display = "block";
    document.getElementById("save-workout").dataset.mode = "create"; // Mark as create mode
    document.getElementById("delete-workout").style.display = "none"; // Hide delete button
}



// Save changes to the selected workout
document.getElementById("save-workout").addEventListener("click", function() {
    let mode = this.dataset.mode; // "edit" or "create"
    let workoutId = this.dataset.workoutId;
    
    let workoutData = {
        name: document.getElementById("workout-name").value,
        restDays: parseInt(document.getElementById("workout-rest-days").value),
        startDate: document.getElementById("workout-start-date").value,
    };

    if (mode === "edit") {
        fetch(`/update_workout/${workoutId}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchWorkouts();
        })
        .catch(error => console.error("Error updating workout:", error));
    } else {
        fetch(`/create_workout/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchWorkouts();
        })
        .catch(error => console.error("Error creating workout:", error));
    }
});

// Delete the selected workout
document.getElementById("delete-workout").addEventListener("click", function() {
    let workoutId = document.getElementById("workout-select").value;

    if (!confirm("Are you sure you want to delete this workout?")) return;

    fetch(`/delete_workout/${workoutId}/`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchWorkouts();  // Refresh the dropdown list
    })
    .catch(error => console.error("Error deleting workout:", error));
});
