window.onload = () => {
    const bonusInput = document.querySelector('[name="bonus_code"]')
    let searchParams = new URLSearchParams(window.location.search)
    if (bonusInput) bonusInput.value = searchParams.get('bonuscode')
}
