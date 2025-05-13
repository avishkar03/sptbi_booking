window.addEventListener("scroll", function () {
  const thead = document.querySelector(".thead");
  const scrolled = window.scrollY + 50 > 80 + 50;

  if (scrolled) {
    thead.classList.add("thead-visible");
    thead.classList.add("sticky");
  } else {
    thead.classList.remove("thead-visible");
    thead.classList.remove("sticky");
  }
});
