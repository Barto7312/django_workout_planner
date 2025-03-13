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


        document.getElementById("workoutTitle").innerHTML = data.workout_plan.name;

    })





    function createUi(){
        const mainBox = document.getElementById("exercisesBox");
    
        const exerciseDiv = document.createElement("div");
        mainBox.appendChild(exerciseDiv);

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("display-info");
        exerciseDiv.appendChild(infoDiv);
        const nameDiv = document.createElement("div");
        infoDiv.classList.add("display-name");
        exerciseDiv.appendChild(nameDiv);
        const restDiv = document.createElement("div");
        infoDiv.classList.add("display-rest");
        exerciseDiv.appendChild(restDiv);


    }



}
