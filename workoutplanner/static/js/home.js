document.addEventListener("DOMContentLoaded", function() 
{  
    getWorkout(8);
});

function getWorkout(workoutId){
    fetch(`/get_workout/${workoutId}`)
    .then(response => response.json())
    .then(data =>{

        if (data.error) {
            console.error("Error fetching workout:", data.error);
            return;
        }

        for exercise in data.exercises_data:

        document.getElementById("workoutTitle").innerHTML = data.workout_plan.name;

    })





    function createUi(){
        const mainBox = document.getElementById("exercisesBox");

        //exercise div
        const exerciseDiv = document.createElement("div");
        mainBox.appendChild(exerciseDiv);

        //info div
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("display-info");
        exerciseDiv.appendChild(infoDiv);

        const setsRepsDiv = document.createElement("div");
        setsRepsDiv.classList.add("display-sets-reps");
        infoDiv.appendChild(setsRepsDiv);

        const weightDiv = document.createElement("div");
        weightDiv.classList.add("display-weight");
        infoDiv.appendChild(weightDiv);

        //name div
        const nameDiv = document.createElement("div");
        infoDiv.classList.add("display-name");
        exerciseDiv.appendChild(nameDiv);

        //rest div
        const restDiv = document.createElement("div");
        infoDiv.classList.add("display-rest");
        exerciseDiv.appendChild(restDiv);


    }



}
