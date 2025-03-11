
//divs
const mainBox = document.getElementById("mainWindow");
const workoutDetailsBox = document.getElementById("workoutDetailsBox");
const selectBox = document.getElementById("workout-select");
const titleTextBox = document.getElementById("titleTextBox");
const secondaryBox = document.getElementById("secondaryBox");
const exerciseListBox = document.getElementById("exerciseListBox");

const searchBox = document.getElementById("exercise-search-box");
const categoryFilter = document.getElementById("categoryFilter");
const exerciseCategories = document.querySelectorAll(".exercise-category");
const libraryWindow = document.getElementById("libraryWindow");

//inputs
const workoutName = document.getElementById("workoutName");
const workoutRest = document.getElementById("workoutRestDays");
const workoutDate = document.getElementById("workoutStartDate");

//buttons
const createWorkoutBtn = document.getElementById("createWorkout");
const deleteWorkoutBtn = document.getElementById("deleteWorkout");
const cancelCreationBtn = document.getElementById("cancelCreation");
const saveWorkoutBtn = document.getElementById("saveWorkout");

//main function to run on page load
document.addEventListener("DOMContentLoaded", function() {
    fetchWorkouts();
});

function flushUI(){
    mainBox.innerHTML = ""
    selectBox.innerHTML = "";
    titleTextBox.innerHTML = "";
    
    elements = Array.from(document.getElementsByClassName("hide"));
        elements.forEach(element => {
            element.style.display = "none"
        });
}

/*========== Workouts ==========*/

// Fetch workouts and populate the dropdown
function fetchWorkouts() {

    flushUI();

    saveWorkoutBtn.addEventListener("click", saveWorkout);
    createWorkoutBtn.addEventListener("click", showWorkoutForm);
    cancelCreationBtn.addEventListener("click", fetchWorkouts);
    deleteWorkoutBtn.addEventListener("click", deleteWorkout);
    secondaryBox.style.display = "flex";

    fetch("/get_workouts/")
        .then(response => response.json())
        .then(data => {
            
            if (data.length === 0) {
                titleTextBox.style.display = "block";
                titleTextBox.innerHTML = "No workouts!";
                mainBox.innerHTML = '<button id="createFirstWorkout">Create New Workout</button>'; //to edit
                document.getElementById("createFirstWorkout").addEventListener("click", showWorkoutForm);
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
    workoutDetailsBox.style.display = "block";
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

//Show form to create new workout
function showWorkoutForm() {

    flushUI();
    secondaryBox.style.display = "flex";
    workoutDetailsBox.style.display = "block";
    titleTextBox.style.display = "block"
    titleTextBox.innerHTML = "Workout Creator"
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


/*========== Days ==========*/

//Display all days
function fetchWorkoutDays(workoutId) {
    fetch(`/fetch_days/${workoutId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error fetching workout days:", data.error);
                return;
            }

            mainBox.innerHTML = '';

            if (data.length === 0) {
                mainBox.innerHTML = "<p>No workout days available.</p>";
                const createDayButton = document.createElement("button");
                mainBox.appendChild(createDayButton);
                createDayButton.textContent = "Add a day";
                createDayButton.id = "addDayBtn";

                createDayButton.addEventListener("click", () => {
                    createDay(workoutId); 
                });
                return;
            }

            data.forEach(day => {
                //create main day div
                const dayDiv = document.createElement("div");
                dayDiv.classList.add("workout-day");
                mainBox.appendChild(dayDiv);

                //create day's content div
                const dayContent = document.createElement("div");
                dayContent.classList.add("day-content");
                dayDiv.appendChild(dayContent);
                
                //create day order div
                const dayNumber = document.createElement("div");
                dayNumber.classList.add("day-number");
                dayContent.appendChild(dayNumber);
                dayNumber.textContent = day.day_order;

                //fetch exercises and create divs
                displayExercises(day.id, dayContent); 

                //create div for edit/delete buttons
                const buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("day-buttons");
                dayContent.appendChild(buttonsDiv);

                //create delete button
                const deleteButtonDiv = document.createElement("div");
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.id = `delete-button-${day.id}`;
                deleteButtonDiv.appendChild(deleteButton);

                deleteButton.addEventListener("click", () => {
                    deleteDay(day.id, workoutId); 
                });

                buttonsDiv.appendChild(deleteButtonDiv);

                //create edit button
                const editButtonDiv = document.createElement("div");
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.id = `edit-button-${day.id}`;
                editButtonDiv.appendChild(editButton);

                editButton.addEventListener("click", () => {
                    displayDay(day, workoutId); 
                });

                buttonsDiv.appendChild(editButtonDiv);
            });

            const createDayButton = document.createElement("button");
            mainBox.appendChild(createDayButton);
            createDayButton.textContent = "Add a day";
            createDayButton.id = "addDayBtn";

            createDayButton.addEventListener("click", () => {
                createDay(workoutId); 
            });

        })
        .catch(error => {
            console.error("Error fetching workout days:", error);
        });
}
//Populate exercises in a specific div
function displayExercises(dayId, exerciseBox) {

    fetch(`/fetch_exercises/${dayId}/`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error fetching exercises:", data.error);
            return;
        }

        data.forEach(exercise => {  
            //create div for exercise
            const exerciseDiv = document.createElement("div");
            exerciseDiv.classList.add("workout-exercise");
            exerciseBox.appendChild(exerciseDiv);

            //append with name
            const nameDiv = document.createElement("div");
            nameDiv.classList.add("workout-exercise-name");
            exerciseDiv.appendChild(nameDiv);
            nameDiv.append(exercise.exercise__name);

            //append with reps/sets
            const repsSetsDiv = document.createElement("div");
            repsSetsDiv.classList.add("workout-exercise-reps-sets");
            exerciseDiv.appendChild(repsSetsDiv);
            repsSetsDiv.textContent = `${exercise.sets} X ${exercise.reps}`;

            //append with weight
            const weightDiv = document.createElement("div");
            weightDiv.classList.add("workout-exercise-weight");
            exerciseDiv.appendChild(weightDiv);
            weightDiv.textContent = `${exercise.weight} KG`;

            //append with rest time
            const restDiv = document.createElement("div");
            restDiv.classList.add("workout-exercise-rest");
            exerciseDiv.appendChild(restDiv);
            restDiv.textContent = `${exercise.rest_seconds} s`;
        });
        
    })
    .catch(error => console.error("Fetch error:", error));
}

//createDay
function createDay(workoutId){
    fetch(`/create_day/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workout_plan_id: workoutId })  
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchWorkoutDays(workoutId);
    })
    .catch(error => console.error("Error adding day:", error));
}

//deleteDay
function deleteDay(dayId, workoutId) {
    if (!confirm("Are you sure you want to delete this day?")) return;

    fetch(`/delete_day/${dayId}/`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchWorkoutDays(workoutId);
    })
    .catch(error => console.error("Error deleting day:", error));
}


/*========== Exercises ==========*/

let pendingExercises = [];

function displayDay(day, workoutId){

    flushUI();

    titleTextBox.style.display = "block";
    titleTextBox.textContent=`Day: ${day.day_order}`;

    let saveDayButton = document.getElementById("saveDay");
    saveDayButton.addEventListener("click", () => saveChanges(day.id));

    let cancelDayCreation = document.getElementById("cancelDayCreation");
    cancelDayCreation.addEventListener("click", () => fetchWorkoutDays(workoutId));

    loadExerciseList();

    pendingExercises = [];

    loadExercises(day.id);






}


function loadExercises(dayId) {
    fetch(`/fetch_exercises/${dayId}/`)
        .then(response => response.json())
        .then(data => {
            pendingExercises = data.map(exercise => ({
                id: exercise.id,
                exercise_id: exercise.exercise__id,
                name: exercise.exercise__name,
                weight: exercise.weight,
                sets: exercise.sets,
                reps: exercise.reps,
                rest_seconds: exercise.rest_seconds,
                exercise_order: exercise.exercise_order,
                action: "unchanged" // Track changes
            }));

            renderExercises();
        });
}

function renderExercises() {
    mainBox.innerHTML = "";

    pendingExercises.forEach((exercise, index) => {
        if (exercise.action === "deleted") return; // Skip deleted ones

        const exerciseDiv = document.createElement("div");
        exerciseDiv.classList.add("day-exercise-box");
        mainBox.appendChild(exerciseDiv);

        const exerciseDetails = document.createElement("div");
        exerciseDetails.classList.add("exercise-details-box");
        exerciseDiv.appendChild(exerciseDetails);

        const removeBtnDiv = document.createElement("div");
        exerciseDiv.appendChild(removeBtnDiv);

        let removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtnDiv.appendChild(removeBtn);

        removeBtn.addEventListener("click", () => removeExercise(index));

        const orderDiv = document.createElement("div");
        orderDiv.textContent = exercise.exercise_order;

        const nameDiv = document.createElement("div");
        nameDiv.textContent = exercise.name;

        const weightInput = document.createElement("input");
        weightInput.value = exercise.weight;
        weightInput.addEventListener("input", () => updateExercise(index, "weight", weightInput.value));

        const setsInput = document.createElement("input");
        setsInput.value = exercise.sets;
        setsInput.addEventListener("input", () => updateExercise(index, "sets", setsInput.value));

        const repsInput = document.createElement("input");
        repsInput.value = exercise.reps;
        repsInput.addEventListener("input", () => updateExercise(index, "reps", repsInput.value));

        const restInput = document.createElement("input");
        restInput.value = exercise.rest_seconds;
        restInput.addEventListener("input", () => updateExercise(index, "rest_seconds", restInput.value));

        exerciseDetails.appendChild(orderDiv);
        exerciseDetails.appendChild(nameDiv);
        exerciseDetails.appendChild(weightInput);
        exerciseDetails.appendChild(setsInput);
        exerciseDetails.appendChild(repsInput);
        exerciseDetails.appendChild(restInput);
    });
}

function addExercise(exerciseId, name) {
    pendingExercises.push({
        id: null,
        exercise_id: exerciseId,
        name: name,
        weight: 0,
        sets: 0,
        reps: 0,
        rest_seconds: 0,
        exercise_order: pendingExercises.length + 1,
        action: "added"
    });

    renderExercises();
}

function removeExercise(index) {
    if (pendingExercises[index].id) {
        pendingExercises[index].action = "deleted";
    } else {
        pendingExercises.splice(index, 1);
    }
    renderExercises();
}

function updateExercise(index, field, value) {
    pendingExercises[index][field] = value;
    if (pendingExercises[index].action !== "added") {
        pendingExercises[index].action = "updated";
    }
}

function saveChanges(dayId) {
    fetch(`/update_exercises/${dayId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingExercises),
    })
    .then(response => response.json())
    .then(data => {
        alert("Exercises updated successfully!");
        displayDay({ id: dayId, day_order: data.day_order });
    })
    .catch(error => console.error("Error:", error));
}


// function loadExercises(dayId){
    
//     fetch(`/fetch_exercises/${dayId}/`)
//     .then(response => response.json())
//     .then(data => {
//         data.forEach(exercise => {
//             //create main exercise div
//             const exerciseDiv = document.createElement("div");
//             exerciseDiv.classList.add("day-exercise-box");
//             mainBox.appendChild(exerciseDiv);

//             //create exercise's details div
//             const exerciseDetails = document.createElement("div");
//             exerciseDetails.classList.add("exercise-details-box");
//             exerciseDiv.appendChild(exerciseDetails);

//             //create remove button div
//             const removeBtnDiv = document.createElement("div");
//             exerciseDiv.appendChild(removeBtnDiv);

//             //create remove button     
//             let removeBtn = document.createElement("button");
//             removeBtn.id = `remove-day-${exercise.id}`;
//             removeBtn.textContent = "Remove";
//             removeBtnDiv.appendChild(removeBtn);

//             removeBtn.addEventListener("click", () => {
//                 removeExercise(exercise.id, dayId)
//             });
    
//             //create divs for every exercise detail
//             const orderDiv = document.createElement("div");
//             const nameDiv = document.createElement("div");
//             const weightDiv = document.createElement("div");
//             const setsDiv = document.createElement("div");
//             const repsDiv = document.createElement("div");
//             const restDiv = document.createElement("div");

//             exerciseDetails.appendChild(orderDiv);
//             exerciseDetails.appendChild(nameDiv);
//             exerciseDetails.appendChild(weightDiv);
//             exerciseDetails.appendChild(setsDiv);
//             exerciseDetails.appendChild(repsDiv);
//             exerciseDetails.appendChild(restDiv);

//             //create and get values for details
//             orderDiv.textContent = exercise.exercise_order;
//             nameDiv.textContent = exercise.exercise__name;

//             const weightInput = document.createElement("input");
//             weightInput.value = exercise.weight;
//             const setsInput = document.createElement("input");
//             setsInput.value = exercise.sets;
//             const repsInput = document.createElement("input");
//             repsInput.value = exercise.reps;
//             const restInput = document.createElement("input");
//             restInput.value = exercise.rest_seconds;

//             weightDiv.appendChild(weightInput);
//             setsDiv.appendChild(setsInput);
//             repsDiv.appendChild(repsInput);
//             restDiv.appendChild(restInput);            
            
//             //set detail's input id
//             weightInput.id = `weight-input-${exercise.id}`;
//             setsInput.id = `sets-input-${exercise.id}`;
//             repsInput.id = `reps-input-${exercise.id}`;
//             restInput.id = `rest-input-${exercise.id}`;

//             //create labels for input
//             let label = document.createElement("label");
//             label.textContent = "Sets";
//             setsDiv.appendChild(label);
//             label = document.createElement("label");
//             label.textContent = "Reps";
//             repsDiv.appendChild(label);
//             label = document.createElement("label");
//             label.textContent = "Weight";
//             weightDiv.appendChild(label);
//             label = document.createElement("label");
//             label.textContent = "Rest";
//             restDiv.appendChild(label);

//         });
//     });
// }




// async function fetchExercisesForDay(dayId) {
//     try {
//         const response = await fetch(`/get_exercises_for_day/${dayId}/`);
//         exercises = await response.json();

//         renderExerciseList(); // Update the UI
//     } catch (error) {
//         console.error("Error fetching exercises:", error);
//     }
// }

// function renderExerciseList() {
//     mainBox.innerHTML = "";

//     exercises.forEach((exercise, index) => {
//         const exerciseRow = document.createElement("div");
//         exerciseRow.innerHTML = `
//             <input type="text" value="${exercise.exercise__name}" disabled>
//             <input type="number" value="${exercise.weight}" onchange="updateExercise(${index}, 'weight', this.value)">
//             <input type="number" value="${exercise.sets}" onchange="updateExercise(${index}, 'sets', this.value)">
//             <input type="number" value="${exercise.reps}" onchange="updateExercise(${index}, 'reps', this.value)">
//             <input type="number" value="${exercise.rest_seconds}" onchange="updateExercise(${index}, 'rest_seconds', this.value)">
//             <button onclick="removeExercise(${index})">Remove</button>
//         `;
//         mainBox.appendChild(exerciseRow);
//     });
// }

// function updateExercise(index, field, value) {
//     exercises[index][field] = value;
// }

// function removeExercise(index) {
//     exercises.splice(index, 1);
//     renderExerciseList();
// }

// function addExercise(exerciseId, name) {
//     exercises.push({
//         id: null,  // New exercises won't have an ID yet
//         exercise: exerciseId,
//         exercise__name: name,
//         weight: 0,
//         sets: 0,
//         reps: 0,
//         rest_seconds: 0,
//         exercise_order: exercises.length
//     });
//     renderExerciseList();
// }

// async function saveExercises(dayId) {
//     try {
//         const response = await fetch(`/update_exercises_for_day/${dayId}/`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(exercises)
//         });

//         const data = await response.json();
//         alert(data.message);
//     } catch (error) {
//         console.error("Error saving exercises:", error);
//     }
// }


// function loadExercises(dayId){

//     mainBox.innerHTML = "";
//     let local_order = 1;

//     fetch(`/fetch_exercises/${dayId}/`)
//     .then(response => response.json())
//     .then(data => {
//         data.forEach(exercise => {

//             //create main exercise div
//             const exerciseDiv = document.createElement("div");
//             exerciseDiv.classList.add("day-exercise-box");
//             exerciseDiv.id = `div${exercise.exercise_order}`;
//             mainBox.appendChild(exerciseDiv);

//             //create exercise's details div
//             const exerciseDetails = document.createElement("div");
//             exerciseDetails.classList.add("exercise-details-box");
//             exerciseDiv.appendChild(exerciseDetails);

//             //create remove button div
//             const removeBtnDiv = document.createElement("div");
//             exerciseDiv.appendChild(removeBtnDiv);

//             //create remove button     
//             let removeBtn = document.createElement("button");
//             removeBtn.id = `remove-day-${exercise.exercise_}`;
//             removeBtn.textContent = "Remove";
//             removeBtnDiv.appendChild(removeBtn);

//             removeBtn.addEventListener("click", () => {
//                 removeExercise(exercise.id, dayId)
//             });
    
//             //create divs for every exercise detail
//             const orderDiv = document.createElement("div");
//             const nameDiv = document.createElement("div");
//             const weightDiv = document.createElement("div");
//             const setsDiv = document.createElement("div");
//             const repsDiv = document.createElement("div");
//             const restDiv = document.createElement("div");

//             exerciseDetails.appendChild(orderDiv);
//             exerciseDetails.appendChild(nameDiv);
//             exerciseDetails.appendChild(weightDiv);
//             exerciseDetails.appendChild(setsDiv);
//             exerciseDetails.appendChild(repsDiv);
//             exerciseDetails.appendChild(restDiv);

//             //create and get values for details
//             orderDiv.textContent = local_order;
//             nameDiv.textContent = exercise.exercise__name;

//             const weightInput = document.createElement("input");
//             weightInput.value = exercise.weight;
//             const setsInput = document.createElement("input");
//             setsInput.value = exercise.sets;
//             const repsInput = document.createElement("input");
//             repsInput.value = exercise.reps;
//             const restInput = document.createElement("input");
//             restInput.value = exercise.rest_seconds;

//             weightDiv.appendChild(weightInput);
//             setsDiv.appendChild(setsInput);
//             repsDiv.appendChild(repsInput);
//             restDiv.appendChild(restInput);            
            
//             //set detail's input id
//             weightInput.id = `weight-input-${exercise.id}`;
//             setsInput.id = `sets-input-${exercise.id}`;
//             repsInput.id = `reps-input-${exercise.id}`;
//             restInput.id = `rest-input-${exercise.id}`;

//             //create labels for input
//             let label = document.createElement("label");
//             label.textContent = "Sets";
//             setsDiv.appendChild(label);
//             label = document.createElement("label");
//             label.textContent = "Reps";
//             repsDiv.appendChild(label);
//             label = document.createElement("label");
//             label.textContent = "Weight";
//             weightDiv.appendChild(label);
//             label = document.createElement("label");
//             label.textContent = "Rest";
//             restDiv.appendChild(label);

//             local_order++;

//         });
//     });
// }





// function removeExercise(exerciseId, dayId){



//     if (!confirm("Are you sure you want to delete this exercise?")) return;

//     fetch(`/remove_exercise/${exerciseId}/`, {
//         method: "DELETE",
//     })
//     .then(response => response.json())
//     .then(data => {
//         alert(data.message);
//         loadExercises(dayId);
//     })
//     .catch(error => console.error("Error deleting exercise:", error));
// }


//load list of exercises
function loadExerciseList(){

    filterExercises();

    secondaryBox.style.display = "flex";
    exerciseListBox.style.display = "flex";
    libraryWindow.style.display = "flex";
    const exerciseLinks = document.querySelectorAll('.exercise-link');

    exerciseLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 

            const exerciseId = this.getAttribute('data-exercise-id');
            const addExerciseButton = document.getElementById("addExercise");

            fetch(`/exercise/${exerciseId}/details/`)
                .then(response => response.json())
                .then(data => {
                    
                    if (data.error) {
                        alert(data.error);
                        return;
                    }

                    addExerciseButton.addEventListener('click', addExercise(exerciseId, data.name)); //!!!

                    // document.getElementById('exerciseDescription').textContent = data.description;

                    // if (data.video_url) {
                    //     document.getElementById('exerciseVideo').innerHTML = `<video width="100%" controls><source src="${data.video_url}" type="video/mp4"></video>`;
                    // } else {
                    //     document.getElementById('exerciseVideo').innerHTML = '<p>No video available.</p>';
                    // }
                })
                .catch(error => console.error('Error:', error));
        });
    });

}

//turn on filtering exercise list
function filterExercises() {
    searchBox.addEventListener("input", filterExercises);
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
}

