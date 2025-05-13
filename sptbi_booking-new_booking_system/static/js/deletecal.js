document.addEventListener("DOMContentLoaded", function () {
  var dateDisplay = document.querySelector("#a");
  var prevBtn = document.querySelector("#prevBtn");
  var nextBtn = document.querySelector("#nextBtn");
  var bookBtn = document.getElementById("bookBtn");
  var isMouseDown = false;
  var startCell = null;
  
  // Initialize date handling
  var cDate = document.getElementById("a").innerHTML.trim();
  var dateParts = cDate.split("-");
  var year = parseInt(dateParts[0]);
  var month = parseInt(dateParts[1]) - 1;
  var day = parseInt(dateParts[2]);
  var currentDate = new Date(year, month, day);
  // var prebooked = [
  //   {r: 1, c: 0},
  //   {r: 1, c: 1},
  //   {r: 1, c: 2},
  //   {r: 2, c: 0},
  //   {r: 2, c: 1},
  //   {r: 2, c: 2},
  //   {r: 3, c: 0},
  // ]
  // var timeslots = JSON.parse('{{ timeslots|json_script:"timeslots-data" }}');
  // // Accessing timeslots in JavaScript
  // for (var i = 0; i < timeslots.length; i++) {
  //   var timeslot = timeslots[i];
  //   console.log(timeslot.slot, timeslot.room, timeslot.date);
  //   // Perform any desired operations with the timeslot attributes
  // }
  // Update the table with the current date
  updateTable(currentDate);

  // Remove any existing event listeners before adding new ones
  function removeAllEventListeners(element) {
    const clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
    return clone;
  }

  // Navigation button handlers
  prevBtn = removeAllEventListeners(prevBtn);
  nextBtn = removeAllEventListeners(nextBtn);
  bookBtn = removeAllEventListeners(bookBtn);

  prevBtn.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() - 1);
    var dateinput = document.createElement("input");
    dateinput.type = "hidden";
    dateinput.name = "dateinput";
    dateinput.id = "dateinput";
    var day = String(currentDate.getDate()).padStart(2, "0");
    var month = String(currentDate.getMonth() + 1).padStart(2, "0");
    var year = currentDate.getFullYear();

    var formattedDate = year + "-" + month + "-" + day;
    dateinput.value = formattedDate;

    var form = document.getElementById("form1");
    form.appendChild(dateinput);
    form.submit();
  });

  nextBtn.addEventListener("click", function () {
    currentDate.setDate(currentDate.getDate() + 1);
    var dateinput = document.createElement("input");
    dateinput.type = "hidden";
    dateinput.name = "dateinput";
    dateinput.id = "dateinput";
    var day = String(currentDate.getDate()).padStart(2, "0");
    var month = String(currentDate.getMonth() + 1).padStart(2, "0");
    var year = currentDate.getFullYear();

    var formattedDate = year + "-" + month + "-" + day;
    dateinput.value = formattedDate;

    var form = document.getElementById("form2");
    form.appendChild(dateinput);
    form.submit();
  });

  function updateTable(date) {
    dateDisplay.textContent = formatDate(date);

    var cells = document.getElementsByClassName("table-cells");
    Array.from(cells).forEach(cell => {
      // Remove existing event listeners
      cell = removeAllEventListeners(cell);
      
      if (cell.innerHTML.trim() !== "") {
        cell.addEventListener("mousedown", handleMouseDown, { once: true });
        cell.addEventListener("mouseover", handleMouseOver);
        cell.addEventListener("mouseup", handleMouseUp);
        cell.style.backgroundColor = "lightgrey";
      }
    });
  }

  function formatDate(date) {
    var options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }

  function toggleBooking(cell) {
    cell.classList.toggle("selected");
  }

  function handleMouseDown(event) {
    event.preventDefault();
    isMouseDown = true;
    startCell = event.target;
    toggleBooking(startCell);
  }

  function handleMouseOver(event) {
    if (isMouseDown) {
      var currentCell = event.target;
      toggleBooking(currentCell);
    }
  }

  function handleMouseUp() {
    isMouseDown = false;
    startCell = null;
  }

  function saveBooking(event) {
    event.preventDefault();
    
    var selectedElements = document.getElementsByClassName("selected");

    if (selectedElements.length === 0) {
      alert("Please select at least one slot to delete.");
      return;
    }

    // Show confirmation dialog only once
    if (!confirm("Are you sure you want to delete the selected slots?")) {
      return;
    }

    var selectedIds = Array.from(selectedElements).map(element => element.id);
    
    var form = document.getElementById("bookingForm");
    
    // Clear any existing hidden inputs
    form.querySelectorAll('input[type="hidden"]').forEach(input => input.remove());

    // Add hidden inputs
    var inputs = {
      selected_ids: selectedIds.join(','),
      dateinput: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      month: String(month + 1).padStart(2, "0"),
      year: year
    };

    Object.entries(inputs).forEach(([name, value]) => {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.id = name;
      input.value = value;
      form.appendChild(input);
    });

    form.submit();
  }

  // Add single click event listener to the "Delete" button
  bookBtn.addEventListener("click", saveBooking, { once: true });
});
