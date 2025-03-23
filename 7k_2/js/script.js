window.addEventListener("load", () => {
  const wheelBtn = document.getElementById("wheel__button");
  const wheelSpinner = document.getElementById("wheel__spinner");
  const popup = document.getElementById("popup");
  const popupBtn = document.getElementById("popup__btn");
  const popupWindow1 = document.getElementById("popup__window_1");
  const popupWindow2 = document.getElementById("popup__window_2");
  const imgPath = wheelSpinner.getAttribute("data-img");

  let counter = 0;

  wheelBtn.addEventListener("click", () => {
    if (counter == 0) {
      wheelBtn.disabled = true;
      wheelSpinner.classList.remove("wheel__spinner_animated");
      wheelSpinner.classList.add("wheel__spinner_win1");
      setTimeout(function () {
        popup.classList.add("popup__show");
        popupWindow1.classList.add("popup__window_show");
        localStorage.spin_2419_1 = "spin_1";
        counter++;
      }, 4500);
    }
  });

  popupBtn.addEventListener("click", () => {
    wheelSpinner.classList.remove("wheel__spinner_animated");
    wheelSpinner.classList.remove("wheel__spinner_win1");
    popup.classList.remove("popup__show");
    popupWindow1.classList.remove("popup__window_show");
    wheelSpinner.classList.add("wheel__spinner_win2");
    setTimeout(function () {
      popup.classList.add("popup__show");
      popupWindow2.classList.add("popup__window_show");
      localStorage.spin_2419_1 = "spin_2";
    }, 4500);
  });
});
