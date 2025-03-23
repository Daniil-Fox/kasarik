// Функция для мигания огней на колесе
function setupWheelFlash() {
  const wheel = document.getElementById("wheel");

  function toggleFlash() {
    wheel.classList.add("flash");

    // Выключаем вспышку через 200 мс
    setTimeout(() => {
      wheel.classList.remove("flash");
    }, 200);
  }

  // Запускаем вспышку каждые 500 мс
  setInterval(toggleFlash, 500);
}

// Настройка ссылки на кнопке "Забрать"
function setupClaimLink() {
  document.getElementById("claim-link").setAttribute("href", "#");
}

// Функции для уведомлений о выигрышах
function generateRandomUser() {
  const prefixes = [
    "Игрок",
    "Lucky",
    "User",
    "Winner",
    "Jackpot",
    "SpinMaster",
    "HighRoller",
  ];
  const suffixes = [
    "2456",
    "777",
    "9821",
    "3000",
    "500",
    "999",
    "88",
    "10",
    "22",
    "45",
  ];
  return (
    prefixes[Math.floor(Math.random() * prefixes.length)] +
    "_" +
    suffixes[Math.floor(Math.random() * suffixes.length)]
  );
}

// Настройка параллакс-эффекта для персонажей
function setupParallaxEffect() {
  const leftGirl = document.querySelector(".decor-items__item--girl-left");
  const rightGirl = document.querySelector(".decor-items__item--girl-right");

  if (!leftGirl || !rightGirl) return;

  document.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX;
    const windowWidth = window.innerWidth;
    const movePercent = (mouseX / windowWidth - 0.5) * 2; // От -1 до 1

    // Если movePercent < 0, мышь находится в левой части экрана
    // Если movePercent > 0, мышь находится в правой части экрана

    // Вычисляем величину сдвига (максимум 20px в каждую сторону)
    const maxOffset = 20;
    const leftOffset = movePercent * maxOffset;
    const rightOffset = -movePercent * maxOffset;

    // Применяем сдвиг: при движении влево персонажи двигаются к центру, при движении вправо - от центра
    leftGirl.style.transform = `translateX(${leftOffset}px)`;
    rightGirl.style.transform = `translateX(${rightOffset}px)`;
  });
}
const winnings = ["20 FS", "500 RUB", "1500 RUB", "80 FS", "3000 RUB", "10 FS"];

function createNotification() {
  const container = document.getElementById("notifications");
  const notification = document.createElement("div");
  notification.classList.add("notification");

  const user = generateRandomUser();
  const win = winnings[Math.floor(Math.random() * winnings.length)];

  notification.innerHTML = `<img src='assets/img/decor/coin-2.webp' alt='User'> <b>${user}</b> выиграл(а) ${win}!`;
  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 6000);
}

function startNotifications() {
  createNotification();
  setTimeout(() => {
    setInterval(() => {
      createNotification();
    }, Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000);
  }, 3000);
}

// Загрузка ленивых изображений
function setupLazyLoad() {
  const lazyImages = document.querySelectorAll(".lazy");
  lazyImages.forEach((img) => {
    img.src = img.dataset.src;
    img.classList.remove("lazy");
  });
}

// Настройка колеса удачи
function setupWheel() {
  const wheelBtn = document.getElementById("wheel__button");
  const wheelSpinner = document.querySelector(".wheel__spinner");
  const wheelSpinnerImg = document.querySelector(".wheel__spinner-img");
  const popup = document.getElementById("popup");
  const popupBtn = document.getElementById("popup__btn");
  const popupWindow1 = document.getElementById("popup__window_1");
  const popupWindow2 = document.getElementById("popup__window_2");
  const mainModal = document.querySelector(".main__modal");

  let counter = 0;

  // Добавляем анимацию качания в начале
  if (wheelSpinnerImg) {
    wheelSpinnerImg.classList.add("wheel__spinner_animated");
  }

  wheelBtn.addEventListener("click", () => {
    if (counter == 0) {
      wheelBtn.disabled = true;

      // Останавливаем анимацию качания и запускаем первое вращение
      if (wheelSpinnerImg) {
        wheelSpinnerImg.classList.remove("wheel__spinner_animated");
        wheelSpinnerImg.classList.add("wheel__spinner_win1");
      }

      setTimeout(function () {
        popup.classList.add("active");
        popup.classList.remove("hide");
        popupWindow1.classList.remove("hide");
        localStorage.spin_2419_1 = "spin_1";
        counter++;
      }, 4500);
    }
  });

  popupBtn.addEventListener("click", () => {
    // Запускаем второе вращение
    if (wheelSpinnerImg) {
      wheelSpinnerImg.classList.remove("wheel__spinner_win1");
      wheelSpinnerImg.classList.add("wheel__spinner_win2");
    }

    popup.classList.remove("active");
    popupWindow1.classList.add("hide");

    setTimeout(function () {
      // Открываем главное модальное окно вместо второго popup
      mainModal.classList.add("main__modal_show");
      localStorage.spin_2419_1 = "spin_2";
    }, 4500);
  });
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", function () {
  setupWheelFlash();
  setupClaimLink();
  setupLazyLoad();
  setupParallaxEffect();
});

// Инициализация при полной загрузке страницы
window.addEventListener("load", function () {
  setupWheel();
  startNotifications();
});
