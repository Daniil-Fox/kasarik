document.addEventListener("DOMContentLoaded", (e) => {
  const wheelImg = document.querySelector(".wheel__img");
  const wheelBtn = document.querySelector(".wheel__btn");
  const modal = document.querySelector(".modal");
  const attempts = document.querySelector(".wheel__attempts-left span");

  let isClick = false;
  let clickedState = 0;
  wheelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isClick) return;
    clickedState++;
    isClick = true;

    if (clickedState == 1) {
      wheelImg.classList.add("to-stage2");
      attempts.textContent = 1;
      setTimeout(() => {
        isClick = false;

        wheelImg.classList.remove("to-stage2");
        wheelImg.classList.add("stage2");
      }, 4000);
    }

    if (clickedState == 2) {
      wheelImg.classList.add("to-stage3");
      attempts.textContent = 0;
      setTimeout(() => {
        wheelImg.classList.remove("to-stage3");
        wheelImg.classList.add("stage3");

        modal.classList.add("active");
      }, 4000);
    }
  });
});
