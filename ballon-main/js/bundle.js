// Конфигурация приложения
const config = {
  prodLink: "spa-casino-pinco-com",
  head: {
    title: "Бонусы ждут – крути и выигрывай!",
  },
  registrationData: {
    language: "RU",
    country: "RU",
    project: "casino",
  },
  analyticsGTM: "GTM-NZ4GX8TW",
  multygeo: true,
  defaultLang: "russian",
  header: {
    logo: "img/logo/logo_pinco.svg",
    alt: "Pinco",
    logo_2: "img/logo/logo-2.png",
    "alt-2": "Ballon",
  },
};

// Инициализация приложения
document.addEventListener("DOMContentLoaded", function () {
  // Инициализация параллакс эффекта
  initParallax();

  // Инициализация языкового переключателя
  initLanguageSwitcher();

  // Инициализация колеса фортуны
  initWheel();
});

// Функция инициализации параллакс эффекта
function initParallax() {
  const container = document.getElementById("parallaxContainer");
  const items = container.getElementsByClassName("decor-items__item");

  document.addEventListener("mousemove", function (e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    Array.from(items).forEach((item, index) => {
      const speed = 0.05 * (index + 1);
      const x = (mouseX - 0.5) * speed * 100;
      const y = (mouseY - 0.5) * speed * 100;

      item.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

// Функция инициализации языкового переключателя
function initLanguageSwitcher() {
  const dropdown = document.querySelector(".header__dropdown");
  const button = dropdown.querySelector(".header__dropdown-link");
  const list = dropdown.querySelector(".header__dropdown-list");

  button.addEventListener("click", function () {
    list.classList.toggle("active");
  });

  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target)) {
      list.classList.remove("active");
    }
  });
}

// Функция инициализации колеса фортуны
function initWheel() {
  const wheel = document.querySelector(".wheel__spinner-img");
  const spinButton = document.querySelector(".wheel__spinner-btn");

  if (spinButton) {
    spinButton.addEventListener("click", function () {
      // Добавляем класс для анимации вращения
      wheel.classList.add("spinning");

      // Через 5 секунд останавливаем вращение и показываем выигрыш
      setTimeout(() => {
        wheel.classList.remove("spinning");
        showWinModal();
      }, 5000);
    });
  }
}

// Функция отображения модального окна с выигрышем
function showWinModal() {
  const modal = document.querySelector(".wheel__achievements-bet");
  if (modal) {
    modal.classList.remove("hide");
  }
}
