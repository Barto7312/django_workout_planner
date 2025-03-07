
//divs
const mainBox = document.getElementById("main-window");
const detailsBox = document.getElementById("workout-details-box");
const selectBox = document.getElementById("workout-select");
const workoutListTitle = document.getElementById("workout-list-title");

//inputs
const workoutName = document.getElementById("workout-name");
const workoutRest = document.getElementById("workout-rest-days");
const workoutDate = document.getElementById("workout-start-date");

//buttons
const createWorkoutBtn = document.getElementById("create-workout");
const deleteWorkoutBtn = document.getElementById("delete-workout");
const cancelCreationBtn = document.getElementById("cancel-creation");
const saveWorkoutBtn = document.getElementById("save-workout");

function flushUI(){
    mainBox.innerHTML = ""
    selectBox.innerHTML = "";
    workoutListTitle.innerHTML = "";
    
    elements = Array.from(document.getElementsByClassName("hide"));
        elements.forEach(element => {
            element.style.display = "none"
        });
}

//main function to run on page load
document.addEventListener("DOMContentLoaded", function() {

    saveWorkoutBtn.addEventListener("click", saveWorkout);
    createWorkoutBtn.addEventListener("click", showWorkoutForm);
    cancelCreationBtn.addEventListener("click", fetchWorkouts);
    deleteWorkoutBtn.addEventListener("click", deleteWorkout);

    fetchWorkouts();
});


// Fetch workouts and populate the dropdown
function fetchWorkouts() {

    flushUI();

    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            
            if (data.length === 0) {
                workoutListTitle.style.display = "block";
                workoutListTitle.innerHTML = "No workouts!";
                mainBox.innerHTML = '<button id="create-first-workout">Create New Workout</button>'; //to edit
                document.getElementById("create-first-workout").addEventListener("click", showWorkoutForm);
                return;
            }

            data.forEach(workout => {
                let option = document.createElement("option");
                option.value = workout.id;
                option.textContent = workout.name;
                selectBox.appendChild(option);
            });

            selectBox.style.display = "block";

            selectBox.addEventListener("change", function () {
                loadWorkoutDetails(this.value);
            });

            loadWorkoutDetails(data[0].id);
        })
        .catch(error => console.error("Error fetching workouts:", error));
}

//Load Workout Details
function loadWorkoutDetails(workoutId) {

    createWorkoutBtn.style.display = "block";
    detailsBox.style.display = "block";
    deleteWorkoutBtn.style.display = "block";

    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            let workout = data.find(w => w.id == workoutId);
            if (!workout) return;

            workoutName.value = workout.name;
            workoutRest.value = workout.restDays;
            workoutDate.value = workout.startDate;

            saveWorkoutBtn.dataset.mode = "edit";

            fetchWorkoutDays(workoutId);
        })
        .catch(error => console.error("Error loading workout details:", error));
}

function showWorkoutForm() {

    flushUI();
    detailsBox.style.display = "block";
    workoutListTitle.style.display = "block"
    workoutListTitle.innerHTML = "Workout Creator"
    cancelCreationBtn.style.display = "block"

    workoutName.value = "";
    workoutRest.value = "";
    workoutDate.value = "";
    
    saveWorkoutBtn.dataset.mode = "create"; 
}

//Update / Create workout
function saveWorkout() {
    let mode = saveWorkoutBtn.dataset.mode;
    let workoutId = selectBox.value;

    let workoutData = {
        name: workoutName.value,
        restDays: workoutRest.value,
        startDate: workoutDate.value,
    };

    if (mode === "edit") {
        fetch(`/update_workout/${workoutId}/`,{
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
        .catch(error => console.error("Error updating workout:", error));
    }
}

// Delete workout
function deleteWorkout() {
    let workoutId = selectBox.value;

    if (!confirm("Are you sure you want to delete this workout?")) return;

    fetch(`/delete_workout/${workoutId}/`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchWorkouts();
    })
    .catch(error => console.error("Error deleting workout:", error));
}

function fetchWorkoutDays(workoutId) {
    // Check if user is authenticated (you may already have this logic elsewhere)
    fetch(`/fetch_days/${workoutId}/`)
        .then(response => response.json())
        .then(data => {
            // Check for error in the response
            if (data.error) {
                console.error("Error fetching workout days:", data.error);
                return;
            }

            // Clear previous data (if any)
            mainBox.innerHTML = '';

            // Check if data is empty
            if (data.length === 0) {
                mainBox.innerHTML = "<p>No workout days available.</p>";
                return;
            }

            // Loop through the workout days and display them
            data.forEach(day => {
                const dayElement = document.createElement("div");
                dayElement.classList.add("workout-day");
                
                // Create and append the day content
                const dayTitle = document.createElement("h4");
                dayTitle.textContent = day.name; // Day name (e.g., Day 1, Day 2)
                
                const dayOrder = document.createElement("p");
                dayOrder.textContent = `Order: ${day.day_order}`; // Day order
                
                const dayDescription = document.createElement("p");
                dayDescription.textContent = day.description || "No description"; // Day description
                
                // Append the elements to the day container
                dayElement.appendChild(dayTitle);
                dayElement.appendChild(dayOrder);
                dayElement.appendChild(dayDescription);
                mainBox.appendChild(dayElement);
            });
        })
        .catch(error => {
            console.error("Error fetching workout days:", error);
        });
}