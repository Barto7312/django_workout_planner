document.addEventListener("DOMContentLoaded", function() {
    // Pobranie wszystkich ćwiczeń z listy
    let exercises = document.querySelectorAll(".exercise-item");

    exercises.forEach(exercise => {
        exercise.addEventListener("click", function(event) {
            event.preventDefault(); // Zapobiega przewijaniu strony przy kliknięciu w <a>

            // Pobranie danych z klikniętego ćwiczenia
            let name = this.getAttribute("data-name");
            let video = this.getAttribute("data-video");
            let muscles = this.getAttribute("data-muscles");
            let description = this.getAttribute("data-description");

            // Aktualizacja treści w głównym oknie ćwiczenia
            document.querySelector(".exercise-name").textContent = name;
            document.querySelector(".exercise-video").textContent = video ? video : "Brak wideo";
            document.querySelector(".exercise-muscles").textContent = muscles ? muscles : "Brak danych";
            document.querySelector(".exercise-description").textContent = description ? description : "Brak opisu";
        });
    });
});
