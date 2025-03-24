"use strict";

class FewModal {
  constructor(selector, options = {}) {
    this.modal = document.querySelector(selector);
    if (!this.modal) return;

    this.isWrapperVisible = false;
    this.activeBody = null;

    this.options = {
      wrapperTime: options.wrapperTime || 300,
      bodyIn: options.bodyIn || 300,
      bodyOut: options.bodyOut || 300,
      disableHash: options.disableHash,
      disableUserClose: options.disableUserClose,
    };

    this.init();
  }

  showWrapper(callback) {
    if (this.isWrapperVisible) {
      callback?.();
      return;
    }

    this.modal.style.display = "flex";
    this.modal.style.opacity = "0";

    requestAnimationFrame(() => {
      this.modal.style.transition = `opacity ${this.options.wrapperTime}ms`;
      this.modal.style.opacity = "1";

      setTimeout(() => {
        this.isWrapperVisible = true;
        callback?.();
      }, this.options.wrapperTime);
    });
  }

  hideWrapper(callback) {
    if (!this.isWrapperVisible) {
      callback?.();
      return;
    }

    this.modal.style.opacity = "0";

    setTimeout(() => {
      this.modal.style.display = "none";
      this.isWrapperVisible = false;
      callback?.();
    }, this.options.wrapperTime);
  }

  showBody(selector, callback) {
    if (this.activeBody === selector) {
      callback?.();
      return;
    }

    if (this.activeBody) {
      this.hideBody(() => this.showBody(selector, callback));
      return;
    }

    const body = this.modal.querySelector(selector);
    if (!body) return;

    body.style.display = "flex";
    body.style.opacity = "0";

    requestAnimationFrame(() => {
      body.style.transition = `opacity ${this.options.bodyIn}ms`;
      body.style.opacity = "1";

      setTimeout(() => {
        this.activeBody = selector;
        callback?.();
      }, this.options.bodyIn);
    });
  }

  hideBody(callback) {
    if (!this.activeBody) {
      callback?.();
      return;
    }

    const body = this.modal.querySelector(this.activeBody);
    if (!body) return;

    body.style.opacity = "0";

    setTimeout(() => {
      body.style.display = "none";
      this.activeBody = null;
      callback?.();
    }, this.options.bodyOut);
  }

  showBySelector(selector, callback) {
    const body = document.querySelector(selector);
    if (!body || !body.classList.contains("fewmodal__body")) return;

    this.showWrapper(() => this.showBody(selector, callback));
  }

  close(callback) {
    if (!this.activeBody) return;

    this.hideBody(() => this.hideWrapper(callback));
  }

  getActive() {
    return this.activeBody;
  }

  init() {
    if (!this.options.disableHash) {
      const hash = window.location.hash;
      if (hash.length > 1) {
        this.showBySelector(hash);
      }
    }

    this.modal.addEventListener("click", (e) => {
      if (this.options.disableUserClose) return;

      const target = e.target;
      if (
        target.classList.contains("fewmodal__close") ||
        target.classList.contains("fewmodal") ||
        target.classList.contains("fewmodal__body") ||
        target.closest(".fewmodal__close")
      ) {
        this.close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (this.options.disableUserClose) return;
      if (e.key === "Escape") this.close();
    });

    if (!this.options.disableHash) {
      window.addEventListener("hashchange", () => {
        const hash = window.location.hash;
        if (hash !== this.activeBody && hash.length > 1) {
          this.showBySelector(hash);
        }
      });
    }
  }
}

class WheelGame {
  constructor() {
    // Основные элементы
    this.page = document.querySelector(".page");
    this.wheel = document.querySelector(".wheel");
    this.spinButton = document.querySelector(".button_spin");
    this.closeButton = document.querySelector(".button_close");
    this.wheelBlades = document.querySelector(".wheel__blades");
    this.congratulation = document.querySelector(".congratulation");
    this.attemptsCount = document.querySelector(".attempts__count span");
    this.prize = document.querySelector(".attempts p:nth-child(2)");

    // Мобильные элементы
    this.mobileWheel = document.querySelector(".wheel-mobile");
    this.mobileButton = document.querySelector(".button_mobile");
    this.mobileText = document.querySelector(".wheel-mobile__text");

    // Проверяем наличие необходимых элементов
    if (!this.page || !this.wheel || !this.wheelBlades) {
      console.error("Required elements not found");
      return;
    }

    this.state = {
      count: 2, // Начинаем с 2 попыток
      text: 1,
      disabled: false,
      isMobile: window.innerWidth <= 768,
      hasWon: false,
    };

    this.bindEvents();
    this.handleResize();
  }

  init() {
    this.updateAttemptsDisplay();

    if (this.state.count === 0) {
      this.state.disabled = true;
      if (this.spinButton) this.spinButton.classList.add("button_disabled");
      if (this.mobileButton) this.mobileButton.classList.add("button_disabled");
      this.showPopup();
    }

    this.page.setAttribute("data-count", this.state.count);
  }

  updateAttemptsDisplay() {
    if (this.attemptsCount) {
      this.attemptsCount.textContent = this.state.count;
    }
  }

  countChange() {
    if (this.state.count > 0) {
      this.state.count--;
    } else {
      this.state.disabled = true;
      this.state.count = 0;
      if (this.spinButton) this.spinButton.classList.add("button_disabled");
      if (this.mobileButton) this.mobileButton.classList.add("button_disabled");
    }

    this.page.setAttribute("data-count", this.state.count);
    this.updateAttemptsDisplay();
  }

  showPopup() {
    if (this.state.isMobile) {
      if (this.mobileWheel) this.mobileWheel.classList.add("wheel-mobile_show");
      return;
    }

    if (this.congratulation) {
      // Показываем окно только после второго прокрута
      if (this.state.count === 0) {
        this.congratulation.classList.add("congratulation_show");
        this.congratulation.classList.add("congratulation__step_first");
        // Показываем кнопку регистрации
        this.congratulation.classList.add("congratulation__button_show");
      }
    }
  }

  updateCongratulationText(text = this.state.text) {
    if (!this.congratulation) return;

    const content = this.congratulation.querySelector(
      ".congratulation__content"
    );
    if (content) {
      content.setAttribute("data-text", text);
    }
  }

  closePopup() {
    if (this.state.isMobile) {
      if (this.mobileWheel)
        this.mobileWheel.classList.remove("wheel-mobile_show");
    } else {
      if (this.congratulation) {
        this.congratulation.classList.remove("congratulation_show");
        // Скрываем кнопку при закрытии
        this.congratulation.classList.remove("congratulation__button_show");
      }
    }
  }

  startSpin() {
    this.state.disabled = true;
    this.page.classList.remove("page_wheel-passed");
    this.page.classList.add("page_wheel-spinning");
  }

  handleResize() {
    window.addEventListener("resize", () => {
      this.state.isMobile = window.innerWidth <= 768;
      if (this.state.isMobile) {
        if (this.congratulation)
          this.congratulation.classList.remove("congratulation_show");
      } else {
        if (this.mobileWheel)
          this.mobileWheel.classList.remove("wheel-mobile_show");
      }
    });
  }

  bindEvents() {
    // Обработчики для десктопной версии
    if (this.spinButton) {
      this.spinButton.addEventListener("click", () => {
        if (!this.state.disabled && this.state.count > 0) {
          this.startSpin();
        }
      });
    }

    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => {
        this.closePopup();
      });
    }

    // Обработчики для мобильной версии
    if (this.mobileButton) {
      this.mobileButton.addEventListener("click", () => {
        if (!this.state.disabled && this.state.count > 0) {
          this.startSpin();
        }
      });
    }

    // Обработчик анимации колеса
    if (this.wheelBlades) {
      this.wheelBlades.addEventListener("animationend", () => {
        this.page.classList.remove("page_wheel-spinning");
        this.page.classList.add("page_wheel-passed");

        this.countChange();

        // Обновляем текст приза после первого прокрута
        if (!this.state.hasWon && this.prize) {
          this.prize.textContent = "ВЫ ВЫЙГРАЛИ 500% БОНУС К ДЕПОЗИТУ";
          this.state.hasWon = true;
        }

        setTimeout(() => {
          this.state.disabled = false;
          if (this.spinButton)
            this.spinButton.classList.remove("button_disabled");
          if (this.mobileButton)
            this.mobileButton.classList.remove("button_disabled");
          // Показываем поздравление только после второго прокрута
          if (this.state.count === 0) {
            this.showPopup();
          }
        }, 2000);
      });
    }
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  const modal = new FewModal("#modal-content");

  // Обработка телефонного номера
  const phoneInput = document.querySelector(".joy-reg input[name=phone]");
  if (phoneInput) {
    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value) {
        phoneInput.value = "+";
      }
    });

    phoneInput.addEventListener("blur", () => {
      if (!phoneInput.value || phoneInput.value === "+") {
        phoneInput.value = "";
      }
    });

    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "");
      phoneInput.value = "+" + phoneInput.value;
    });
  }

  // Инициализация игры
  new WheelGame();
});
