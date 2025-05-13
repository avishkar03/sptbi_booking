$(".autoplay").slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  prevArrow: $(".prev-button"),
  nextArrow: $(".next-button"),
});

// $(".variable-width").slick({
//   dots: true,
//   infinite: true,
//   slidesToShow: 1,
//   centerMode: true,
//   variableWidth: true,
//   autoplay: true,
//   autoplaySpeed: 1000,
// });

const aboutContent = document.querySelector(".about-content");
const aboutPhoto = document.querySelector(".about-photo");
const aboutText = document.querySelector(".about-text");

function animateOnScroll(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      aboutContent.style.opacity = 1;
      aboutPhoto.style.transform = "translateX(0)";
      aboutText.style.transform = "translateX(0)";
    }
  });
}

const observer = new IntersectionObserver(animateOnScroll, { threshold: 0.5 });

observer.observe(aboutContent);

$(".facility").on("click", function () {
  $(".card").toggleClass("flipped");
});

const swiper = new Swiper(".swiper", {
  // Optional parameters
  autoHeight: true,
  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  // And if we need scrollbar
  scrollbar: {
    el: ".swiper-scrollbar",
  },
});

$(".customer-logos").slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    variablewidth: true,
    autoplaySpeed: 1500,
    arrows: false,
    dots: false,
    pauseOnHover: false,
  centerMode: true,
  variableWidth: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 520,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  });

var startups = parseInt(document.getElementById("startups").value);
var current = parseInt(document.getElementById("currentstartups").value);
var graduated = parseInt(document.getElementById("graduatedstartups").value);

const data1 = {
  labels: ["Current", "Graduated"],
  datasets: [
    {
      data: [current, graduated],
      backgroundColor: ["#1c4386", "lightblue"],
      borderWidth: 0,
      borderRadius: 0,
      borderJoinStyle: "round",
      weight: 2,
      hoverOffset: 50,
      hoverBackgroundColor: ["#1c4386", "lightblue"],
    },
  ],
};

const doughnutLabel = {
  id: "doughnutLabel",
  beforeDatasetsDraw(chart, args, pluginOptions) {
    const { ctx, data } = chart;
    ctx.save();
    const xCoor = chart.getDatasetMeta(0).data[0].x;
    const yCoor = chart.getDatasetMeta(0).data[0].y;
    ctx.font = "bold 40px  sans-serif";
    ctx.fillStyle = "#1c4386";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      startups,
      xCoor,
      yCoor
    );
  },
};

document.addEventListener("DOMContentLoaded", function () {
  // Get the canvas elements and create 2d contexts
  const ctx1 = document.getElementById("doughnutChart1").getContext("2d");

  // Create the doughnut charts
  const doughnutChart1 = new Chart(ctx1, {
    type: "doughnut",
    data: data1,
    options: {
      radius: 90,
      cutout: 75,
      onClick: function (event, elements) {
        if (elements && elements.length > 0) {
          // Get the index of the clicked segment
          const segmentIndex = elements[0].index;
          console.log(segmentIndex);
          // Send an AJAX request to the server
          fetch("/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"), // Assuming you use Django CSRF protection
            },
            body: JSON.stringify({ segmentIndex }),
          }).then((response) => response.json());
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            font: {
              family: "Poppins", // Set the font family
              size: 14, // Set the font size in pixels
              weight: "bold", // Set the font weight (e.g., 'normal', 'bold', etc.)
              style: "italic", // Set the font style (e.g., 'normal', 'italic', 'oblique')
            },
          },
        },
        title: {
          display: true,
          text: "Startups Incubated",
          font: {
            size: 30,
            family: "Poppins",
          },
        },
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    },
    plugins: [doughnutLabel],
  });
});

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

$(".button").click(function () {
  // get the content of 
  var buttonId = $(this).attr("id");
  console.log(buttonId);
  var titleid = document.getElementById(buttonId).innerHTML;
  console.log(titleid);
  var modalId = "#modaltitle-" + buttonId;
  console.log(modalId);
  var modalTitle = document.querySelector(modalId).value;
  console.log(modalTitle);
  document.querySelector(".modal").innerHTML = "<h2>" + titleid + "</h2> <hr> <p>" + modalTitle + "</p>";
  console.log($(".modal").innerHTML);
  $("#modal-container").removeAttr("class").addClass("five");
  $("body").addClass("modal-active");
});

$("#modal-container").click(function () {
  $(this).addClass("out");
  $("body").removeClass("modal-active");
});