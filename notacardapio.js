const notas = document.querySelectorAll(".nota-restaurante");

notas.forEach(nota => {
    nota.addEventListener("input", function () {
        this.style.height = "auto";      
        this.style.height = this.scrollHeight + "px"; 
    });
});
