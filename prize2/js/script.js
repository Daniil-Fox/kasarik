// Конфигурация игры
const config = {
  game: {
    attempts: 2,
    // Фиксированная продолжительность анимации для всех вращений
    spinDuration: 5000, // 5 секунд
    // Параметры для пропорциональной скорости вращения
    anglesPerSecond: {
      firstSpin: 187.2, // Скорость для первого вращения (936° за 5 секунд)
      secondSpin: 864, // Скорость для второго вращения (4320° за 5 секунд)
    },
    minDegrees: 1800,
    maxDegrees: 2160,
    easeOutThreshold: 0.8, // Увеличиваем порог для более плавного движения к целевому углу
    // Отключаем эффект покачивания полностью, чтобы устранить эффект докрута
    wobbleEnabled: false,
    // Фиксированные углы из оригинального CSS для первых двух вращений
    fixedAngles: {
      firstSpin: 900, // Целевой угол для первого вращения
      secondSpin: 4356, // Целевой угол для второго вращения
    },
    prizes: {
      freespins: "225%",
      bonus: "70FS",
    },
  },
};

// Класс для колеса
class Wheel {
  constructor() {
    this.attempts = config.game.attempts;
    this.isSpinning = false;
    this.events = {};
    this.animationFrameId = null;
    this.wobbleAnimationId = null;
    this.finalRotation = 0; // Сохраняем конечное положение колеса
    this.spinCounter = 0; // Счетчик вращений
    this.init();
  }

  init() {
    // Находим элементы рулетки
    this.wheelLayout = document.querySelector(".wheel__layout");
    this.wheelSpinner = document.querySelector(".wheel__spinner-img");
    this.spinButton = document.querySelector(".wheel__spinner-center");
    this.attemptsCounter = document.getElementById("counter_spin");
    this.achievementBanner = document.querySelector(".wheel__achievements");

    // Начальное положение - добавляем класс для эффекта покачивания
    this.wheelLayout.classList.add("stage-1");

    // Через небольшую задержку добавляем второй класс для эффекта
    setTimeout(() => {
      this.wheelLayout.classList.add("stage-1-complete");
    }, 200);

    this.updateAttempts();
    this.bindEvents();
  }

  bindEvents() {
    // Обработчик клика на кнопку вращения
    this.spinButton.addEventListener("click", () => this.spin());

    // Эффект при наведении на кнопку
    this.spinButton.addEventListener("mouseenter", () => {
      if (!this.isSpinning) {
        this.spinButton.classList.add("pulse");
      }
    });

    this.spinButton.addEventListener("mouseleave", () => {
      this.spinButton.classList.remove("pulse");
    });
  }

  // Обновление счетчика попыток
  updateAttempts() {
    this.attemptsCounter.textContent = this.attempts;

    if (this.attempts <= 0) {
      this.spinButton.disabled = true;
      this.spinButton.classList.add("disabled");
    }
  }

  // Функция плавного замедления с ускоренным финишем
  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  // Метод для вращения колеса
  spin() {
    if (this.isSpinning || this.attempts <= 0) return;

    this.isSpinning = true;
    this.attempts--;
    this.spinCounter++; // Увеличиваем счетчик вращений
    this.updateAttempts();

    // Удаляем все классы и стили, которые могут вызывать CSS-анимации
    this.wheelLayout.className = "wheel__layout"; // Сбрасываем до базового класса

    // Полностью очищаем все стили анимации и transition
    this.wheelSpinner.style.animation = "none";
    this.wheelSpinner.style.webkitAnimation = "none";
    // this.wheelSpinner.style.transition = "none";
    // this.wheelSpinner.style.webkitTransition = "none";

    // Форсируем перерасчет стилей перед анимацией
    void this.wheelSpinner.offsetWidth;

    // Определяем угол вращения в зависимости от номера вращения
    let targetRotation;

    if (this.spinCounter === 1) {
      // Первое вращение
      targetRotation = config.game.fixedAngles.firstSpin;
    } else {
      // Второе вращение
      targetRotation = config.game.fixedAngles.secondSpin;
    }

    console.log(`Вращение #${this.spinCounter}`);
    console.log("Целевой угол вращения:", targetRotation);

    // Задаем начальное время
    const startTime = performance.now();
    // Фиксированная длительность анимации
    const duration = config.game.spinDuration;
    let currentRotation = 0;

    // Отменяем предыдущие анимации
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.wobbleAnimationId) {
      cancelAnimationFrame(this.wobbleAnimationId);
      this.wobbleAnimationId = null;
    }

    // Плавная анимация вращения с использованием requestAnimationFrame
    const animateSpin = (currentTime) => {
      // Расчет прогресса времени (от 0 до 1)
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Используем экспоненциальную функцию замедления для более плавной остановки
      const rotationProgress = this.easeOutExpo(progress);

      // Расчет текущего угла вращения (точно до targetRotation)
      currentRotation = rotationProgress * targetRotation;

      // Применяем поворот к колесу
      this.wheelSpinner.style.transform = `rotate(${currentRotation}deg)`;

      // Продолжаем анимацию или завершаем
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animateSpin);
      } else {
        // Анимация вращения завершена - просто запоминаем финальное положение
        this.isSpinning = false;
        this.finalRotation = targetRotation;

        // НЕ запускаем эффект покачивания!

        // Обновляем отображение выигрыша
        this.updatePrizeDisplay();

        // Показываем баннер с выигрышем
        setTimeout(() => {
          this.achievementBanner.style.display = "flex";

          // Вызываем событие завершения вращения
          if (this.events["spin-complete"]) {
            this.events["spin-complete"].forEach((callback) => {
              callback({
                prize:
                  this.spinCounter === 1
                    ? config.game.prizes.freespins
                    : config.game.prizes.bonus,
              });
            });
          }
        }, 500);
      }
    };

    // Запускаем анимацию
    this.animationFrameId = requestAnimationFrame(animateSpin);
  }

  // Обновляем отображение выигрыша в зависимости от номера вращения
  updatePrizeDisplay() {
    // Получаем элементы для отображения выигрыша
    const fsValue = document.querySelector(".lights-content__value--num");
    const fsSubtitle = document.querySelector(
      ".lights-content__value--subtitle"
    );

    if (this.spinCounter === 1) {
      if (fsValue) fsValue.textContent = "500%";
      if (fsSubtitle) fsSubtitle.textContent = "к депозиту";
    } else {
      if (fsValue) fsValue.textContent = "500% + 500 FS";
      if (fsSubtitle) fsSubtitle.textContent = "";
    }
  }

  // Сброс состояния колеса
  reset() {
    this.attempts = config.game.attempts;
    this.isSpinning = false;
    this.finalRotation = 0;
    this.spinCounter = 0; // Сбрасываем счетчик вращений

    // Отменяем любую текущую анимацию
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Отменяем анимацию покачивания
    if (this.wobbleAnimationId) {
      cancelAnimationFrame(this.wobbleAnimationId);
      this.wobbleAnimationId = null;
    }

    // Полностью очищаем все стили анимации
    this.wheelSpinner.style.animation = "none";
    this.wheelSpinner.style.webkitAnimation = "none";
    // this.wheelSpinner.style.transition = "none";
    // this.wheelSpinner.style.webkitTransition = "none";

    // Форсируем перерасчет стилей
    void this.wheelSpinner.offsetWidth;

    // Сбрасываем стиль вращения - устанавливаем начальное положение
    this.wheelSpinner.style.transform = "rotate(0deg)";

    // Сбрасываем классы
    this.wheelLayout.className = "wheel__layout";

    // Добавляем начальные классы для стартового отображения
    // (не используем анимированные классы)
    this.wheelLayout.classList.add("stage-1");

    this.spinButton.disabled = false;
    this.spinButton.classList.remove("disabled");
    this.updateAttempts();

    // Скрываем баннер с выигрышем
    this.achievementBanner.style.display = "none";
  }

  // Методы для работы с событиями
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
    return this;
  }
}

// Основное приложение
class App {
  constructor() {
    this.wheel = new Wheel();
    this.bindEvents();
    this.initBonusButton();
    this.initModal();
  }

  bindEvents() {
    this.wheel.on("spin-complete", (result) => {
      console.log(`Выигрыш: ${result.prize}`);

      // Показываем достижения после вращения
      this.showAchievements();

      // Обновляем отображение приза в модальном окне
      this.updateModalPrize(result);
    });
  }

  // Инициализация кнопки получения бонуса
  initBonusButton() {
    const bonusButton = document.querySelector(".lights-content__button");
    if (bonusButton) {
      bonusButton.addEventListener("click", () => {
        const modal = document.querySelector(".main__modal");
        if (modal) {
          modal.classList.add("main__modal_show");
        }
      });
    }
  }

  // Инициализация модального окна
  initModal() {
    const modal = document.querySelector(".main__modal");
    if (modal) {
      // Закрытие модального окна при клике за его пределами
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("main__modal_show");
        }
      });
    }
  }

  // Обновление приза в модальном окне
  updateModalPrize(result) {
    const bonusTitle = document.querySelector(".comp-title__bonus");
    if (bonusTitle) {
      bonusTitle.textContent =
        result.prize === config.game.prizes.freespins ? "250FS" : "500 000 RUB";
    }
  }

  // Показать достижения после вращения
  showAchievements() {
    const achievements = document.querySelector(".wheel__achievements");
    if (achievements) {
      achievements.style.display = "flex";
    }
  }
}

// Инициализация приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();

  // Скрываем достижения изначально
  const achievements = document.querySelector(".wheel__achievements");
  if (achievements) {
    achievements.style.display = "none";
  }
});
