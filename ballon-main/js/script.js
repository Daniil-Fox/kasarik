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
    easeOutThreshold: 0.8,
    wobbleEnabled: false,
    // Фиксированные углы для вращений (в градусах)
    fixedAngles: {
      firstSpin: 936, // Целевой угол для первого вращения
      secondSpin: 4320, // Целевой угол для второго вращения
    },
    prizes: {
      freespins: "250 ФРИ СПИНОВ",
      bonus: "500 000 RUB",
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
    this.finalRotation = 0;
    this.spinCounter = 0;
    this.init();
  }

  init() {
    // Находим элементы рулетки
    this.wheelLayout = document.querySelector(".wheel__layout");
    this.wheelSpinner = document.querySelector(".wheel__spinner-img");
    this.spinButton = document.querySelector(".wheel__spinner-center");
    this.attemptsCounter = document.querySelector(".main__attempts");
    this.achievementBet = document.querySelector(".wheel__achievements-bet");
    this.achievementBonus = document.querySelector(
      ".wheel__achievements-bonus"
    );
    this.attemptsCont = document.querySelector(".ribbons__title-att span");

    // Начальное положение
    this.wheelLayout.classList.add("stage-1");

    this.updateAttempts();
    this.bindEvents();
  }

  bindEvents() {
    // Обработчик клика на кнопку вращения
    this.spinButton.addEventListener("click", () => this.spin());
  }

  // Обновление счетчика попыток
  updateAttempts() {
    if (this.attemptsCounter) {
      this.attemptsCounter.textContent = `Осталось ${this.attempts} попытки`;
    }

    // Блокируем кнопку только если попытки закончились или это первый спин
    if (this.attempts <= 0) {
      this.attemptsCont.textContent = "0";
      this.spinButton.style.pointerEvents = "none";
    } else if (this.spinCounter === 1) {
      // Блокируем кнопку после первого спина до закрытия модального окна
      this.spinButton.style.pointerEvents = "none";
      this.attemptsCont.textContent = "1";
    }
  }

  // Функция плавного замедления с улучшенной кривой
  easeOutExpo(t) {
    // Используем простую функцию замедления без колебаний
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  // Метод для вращения колеса
  spin() {
    if (this.isSpinning || this.attempts <= 0) return;

    this.isSpinning = true;
    this.attempts--;
    this.spinCounter++;
    this.updateAttempts();

    // Очищаем все CSS анимации перед началом вращения
    this.wheelSpinner.style.transition = "none";
    this.wheelLayout.className = "wheel__layout"; // Сбрасываем все классы
    this.wheelSpinner.style.transform = `rotate(${this.finalRotation}deg)`;
    // Форсируем перерасчет стилей
    void this.wheelSpinner.offsetWidth;

    // Определяем стадию вращения и соответствующие классы
    let targetRotation;
    let stageClass;

    if (this.spinCounter === 1) {
      targetRotation = config.game.fixedAngles.firstSpin;
      stageClass = "stage-1";
    } else if (this.spinCounter === 2) {
      targetRotation = config.game.fixedAngles.secondSpin;
      stageClass = "stage-2";
    }

    // Отменяем предыдущие анимации
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      // this.animationFrameId = null;
    }

    const startTime = performance.now();
    const duration = config.game.spinDuration;

    // Анимация вращения
    const animateSpin = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const rotationProgress = this.easeOutExpo(progress);
      const currentRotation = rotationProgress * targetRotation;

      // Применяем поворот без дополнительных эффектов
      this.wheelSpinner.style.transform = `rotate(${currentRotation}deg)`;

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animateSpin);
      } else {
        // Анимация завершена
        this.isSpinning = false;
        this.finalRotation = targetRotation;

        // Добавляем начальную анимацию покачивания
        setTimeout(() => {
          this.wheelLayout.classList.add(stageClass);
          // Через небольшую задержку добавляем класс для завершения стадии
          setTimeout(() => {
            this.wheelLayout.classList.add(`${stageClass}-complete`);
          }, 100);
        }, 100);

        // Показываем призы и вызываем событие завершения
        setTimeout(() => {
          // Скрываем предыдущие призы
          if (this.achievementBet) {
            this.achievementBet.classList.add("hide");
          }
          if (this.achievementBonus) {
            this.achievementBonus.classList.add("hide");
          }

          // Показываем соответствующий приз
          if (this.spinCounter === 1) {
            // После первого прокрута показываем только фриспины
            if (this.achievementBonus) {
              this.achievementBonus.classList.remove("hide");
            }
          } else if (this.spinCounter === 2) {
            // После второго прокрута показываем оба приза
            if (this.achievementBet) {
              this.achievementBet.classList.remove("hide");
            }
            if (this.achievementBonus) {
              this.achievementBonus.classList.remove("hide");
            }
          }
          document.querySelector(".ribbons__prize--first").style.display =
            "none";
          document.querySelector(".ribbons__prize--prize").style.display =
            "flex";
          // Вызываем событие завершения вращения
          if (this.events["spin-complete"]) {
            this.events["spin-complete"].forEach((callback) => {
              callback({
                prize:
                  this.spinCounter === 1
                    ? config.game.prizes.freespins
                    : config.game.prizes.bonus,
                isLastSpin: this.spinCounter === 2,
              });
            });
          }
        }, 500);
      }
    };

    // Запускаем анимацию
    this.animationFrameId = requestAnimationFrame(animateSpin);
  }

  // Методы для работы с событиями
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  }
}

// Класс приложения
class App {
  constructor() {
    this.wheel = new Wheel();
    this.bindEvents();
    this.initModal();
  }

  bindEvents() {
    // Обработка завершения вращения
    this.wheel.on("spin-complete", (result) => {
      this.showPrizeSequence(result);
    });
  }

  initModal() {
    // Инициализация модальных окон
    this.mainModal = document.querySelector(".main__modal");
    this.modal = document.querySelector(".modal");
    this.modalBonus = document.querySelector(".wheel__achievements-bonus");
    this.modalBet = document.querySelector(".wheel__achievements-bet");
    this.contactForm = document.querySelector(".contact-form");

    // Добавляем обработчик только для первого приза
    if (this.modalClose) {
      this.modalClose.addEventListener("click", () => {
        this.hideModal();
      });
    }
  }

  showPrizeSequence(result) {
    if (result.isLastSpin) {
      // Для второго спина - показываем призы и форму
      this.showSecondPrizeSequence(result);
    } else {
      // Для первого спина - показываем приз с автоматическим скрытием через 1 секунду
      this.showFirstPrize(result);
    }
  }

  showFirstPrize(result) {
    // Показываем первый приз
    if (this.mainModal && this.modalBonus) {
      this.mainModal.classList.add("main__modal_show");
      this.modalBonus.classList.remove("hide");

      // Через 1 секунду автоматически скрываем приз
      setTimeout(() => {
        this.mainModal.classList.remove("main__modal_show");
        this.modalBonus.classList.add("hide");
        // Разблокируем кнопку для второго вращения
        if (this.wheel && this.wheel.spinButton) {
          this.wheel.spinButton.style.pointerEvents = "auto";
        }
      }, 2000);
    }
  }

  showSecondPrizeSequence(result) {
    // Показываем второй приз и форму
    if (this.mainModal && this.modalBonus) {
      // Скрываем первый приз если он показан
      if (this.modalBonus) {
        this.modalBonus.classList.add("hide");
      }

      // Показываем модальное окно со вторым призом
      this.mainModal.classList.add("main__modal_show");
      this.modalBet.classList.remove("hide");

      // setTimeout(() => {
      //   this.modalBet.classList.add("hide");
      //   document.querySelector(".modal__wrapper").style.display = "block";
      //   document.querySelector(".modal__wrapper").style.visibility = "visible";
      // }, 2000);
    }
  }
}

// Инициализация приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
