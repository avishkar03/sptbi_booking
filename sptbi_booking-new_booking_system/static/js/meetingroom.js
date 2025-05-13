document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".item");
  const classList = ["item", "item--medium", "item--large"];
  const flat = document.querySelectorAll(".class2");
  for (let i = 0; i < flat.length; i++) {
    const element = flat[i];
    element.classList.add("item");
  }
  const normal = document.querySelectorAll(".class16");
  for (let i = 0; i < normal.length; i++) {
    const element = normal[i];
    element.classList.add("item--medium");
  }
  const large = document.querySelectorAll(".class3");
  for (let i = 0; i < large.length; i++) {
    const element = large[i];
    element.classList.add("item--large");
  }
});
