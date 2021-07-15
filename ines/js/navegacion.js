function myFunction() {
    var x = document.getElementById("navegacion");
    if (x.className === "menu-navegacion") {
      x.className += " responsive";
    } else {
      x.className = "menu-navegacion";
    }
  }