// cookieManager.js

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    } else {
        // Set the cookie to expire in 100 years
        const date = new Date();
        date.setFullYear(date.getFullYear() + 100);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function saveChecklist(checkboxes) {
    const checklistState = Array.from(checkboxes).map(checkbox => checkbox.checked);
    setCookie('checklist', JSON.stringify(checklistState), 0); // Set to never expire
}

function loadChecklist() {
    const checklistState = getCookie('checklist');
    if (checklistState) {
        const parsedState = JSON.parse(checklistState);
        const checkboxes = document.querySelectorAll('#checklist-container input[type="checkbox"]');
        parsedState.forEach((checked, index) => {
            checkboxes[index].checked = checked;
        });
        return true; // Indicate that checklist state was loaded
    }
    return false; // Indicate that no state was loaded
}
