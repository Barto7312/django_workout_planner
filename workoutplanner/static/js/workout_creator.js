document.addEventListener("DOMContentLoaded", function() {
    fetchWorkouts();
});

const mainBox = document.getElementById("main-window");
const detailsBox = document.getElementById("workout-details-box");
const selectBox = document.getElementById("workout-select");
const workoutListTitle = document.getElementById("workout-list-title");

const workoutName = document.getElementById("workout-name");
const workoutRest = document.getElementById("workout-rest-days");
const workoutDate = document.getElementById("workout-start-date");



function hideUI(){
    mainBox.innerHTML = ""
    detailsBox.style.display = "none";
    selectBox.style.display = "none";
    workoutListTtitle.display = "none";

    

}


// Fetch workouts and populate the dropdown
function fetchWorkouts() {\



    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            
            if (data.length === 0) {
                detailsBox.style.display = "none"; 
                workoutListText.style.display = "block";
                workoutListText.innerHTML = "No workouts!";
                mainBox.innerHTML = '<button id="create-first-workout">Create New Workout</button>';
                document.getElementById("create-first-workout").addEventListener("click", showWorkoutForm);
                return;
            }

            workoutListText.style.display = "none";
            selectBox.style.display = "block";


            data.forEach(workout => {
                let option = document.createElement("option");
                option.value = workout.id;
                option.textContent = workout.name;
                selectBox.appendChild(option);
            });

            selectBox.addEventListener("change", function () {
                loadWorkoutDetails(this.value);
            });

            loadWorkoutDetails(data[0].id);
        })
        .catch(error => console.error("Error fetching workouts:", error));
}

//Load Workout Details
function loadWorkoutDetails(workoutId) {

    detailsBox.style.display = "block"; 

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
    detailsBox.style.display = "block";

    document.getElementById("workout-name").value = "";
    document.getElementById("workout-rest-days").value = "";
    document.getElementById("workout-start-date").value = "";
    
    document.getElementById("save-workout").dataset.mode = "create"; // Mark as create mode
    document.getElementById("cancel-creation").style.display = "block";

    document.getElementById("delete-workout").style.display = "none";
    document.getElementById("create-workout").style.display = "none"; 

    document.getElementById("cancel-creation").addEventListener("click", fetchWorkouts);

}



// // Save changes to the selected workout
// document.getElementById("save-workout").addEventListener("click", function() {
//     let mode = this.dataset.mode; // "edit" or "create"
//     let workoutId = this.dataset.workoutId;
    
//     let workoutData = {
//         name: document.getElementById("workout-name").value,
//         restDays: parseInt(document.getElementById("workout-rest-days").value),
//         startDate: document.getElementById("workout-start-date").value,
//     };

//     if (mode === "edit") {
//         fetch(`/update_workout/${workoutId}/`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(workoutData),
//         })
//         .then(response => response.json())
//         .then(data => {
//             alert(data.message);
//             fetchWorkouts();
//         })
//         .catch(error => console.error("Error updating workout:", error));
//     } else {
//         fetch(`/create_workout/`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(workoutData),
//         })
//         .then(response => response.json())
//         .then(data => {
//             alert(data.message);
//             fetchWorkouts();
//         })
//         .catch(error => console.error("Error creating workout:", error));
//     }
// });

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
