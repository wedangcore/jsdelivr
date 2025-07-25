const warningModal = document.getElementById('warning-modal');
const warningSound = document.getElementById('warning-sound');

function showWarningModal() {
    if (warningSound && warningModal) {
        warningSound.play().catch(e => console.error("Audio play failed. User interaction might be required first.", e));
        warningModal.showModal();
    } else if (warningModal) {
        warningModal.showModal();
    }
}

if(warningModal) {
    warningModal.addEventListener('close', () => {
        // Stop and reset the sound
        if(warningSound) {
            warningSound.pause();
            warningSound.currentTime = 0;
        }
    });
}

// --- START: Anti-Inspect/Copy Logic (MODIFIED) ---

// Define the function to block copy action
const blockCopyAction = event => {
    event.preventDefault();
    showWarningModal();
};

// Disable right-click context menu
document.addEventListener('contextmenu', event => {
    event.preventDefault();
    showWarningModal();
});

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener('keydown', function(event) {
    if (event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i')) ||
        (event.ctrlKey && event.shiftKey && (event.key === 'J' || event.key === 'j')) ||
        (event.ctrlKey && (event.key === 'U' || event.key === 'u'))) {
        event.preventDefault();
        showWarningModal();
    }
});

// Disable copy and cut events using the named function
document.addEventListener('copy', blockCopyAction);
document.addEventListener('cut', event => {
    event.preventDefault();
    showWarningModal();
});
// --- END: Anti-Inspect/Copy Logic ---


// --- Original API Tester and UI Logic ---
function toggleSection(element) {
    const content = element.nextElementSibling;
    const icon = element.querySelector('svg');
    const isCurrentlyOpen = content.classList.contains('show');
    document.querySelectorAll('.collapsible-content').forEach((otherContent) => {
        if (otherContent !== content) {
            otherContent.classList.remove('show');
            otherContent.previousElementSibling.querySelector('svg').classList.remove('rotate-180');
        }
    });
    if (isCurrentlyOpen) {
        content.classList.remove('show');
        icon.classList.remove('rotate-180');
    } else {
        content.classList.add('show');
        icon.classList.add('rotate-180');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const firstSectionContent = document.querySelector('.collapsible-content');
    if (firstSectionContent) {
        firstSectionContent.classList.add('show');
        firstSectionContent.previousElementSibling.querySelector('svg').classList.add('rotate-180');
    }
});

function displayResult(elementId, data) {
    const codeElement = document.getElementById(elementId);
    const preElement = codeElement.parentElement;
    codeElement.textContent = JSON.stringify(data, null, 2);
    preElement.classList.remove('bg-success', 'text-success-content', 'bg-error', 'text-error-content');
    if (data.success === true || data.status === true) {
        preElement.classList.add('bg-success', 'text-success-content');
    } else {
        preElement.classList.add('bg-error', 'text-error-content');
    }
}

function showLoading(elementId) {
    const codeElement = document.getElementById(elementId);
    const preElement = codeElement.parentElement;
    preElement.classList.remove('bg-success', 'text-success-content', 'bg-error', 'text-error-content');
    codeElement.textContent = 'Fetching...';
}

async function testLogin(event) {
    event.preventDefault();
    const u = document.getElementById('login_username').value;
    const p = document.getElementById('login_password').value;
    showLoading('login_result');
    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer Kj9mPq2wZx5tY8nF3vL7rQ1eB4uN6hM2cA9dR8kT5pW3yG0sJ2vL9xQ7mP4tZ8nF1rK6hY3wA5eB0cT2dN8uM7qG4vJ9pL3xR1yF5kW2tA6nQ8mZ0hB7eP4cL9dT3vY1rK5uJ2wG8nF6mQ0tA'
            },
            body: JSON.stringify({
                username: u,
                password: p
            })
        });
        const data = await res.json();
        displayResult('login_result', data);
    } catch (err) {
        displayResult('login_result', { success: false, message: err.message });
    }
}

async function testOtp(event) {
    event.preventDefault();
    const u = document.getElementById('otp_username').value;
    const o = document.getElementById('otp_code').value;
    showLoading('otp_result');
    try {
        const res = await fetch('/otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer Kj9mPq2wZx5tY8nF3vL7rQ1eB4uN6hM2cA9dR8kT5pW3yG0sJ2vL9xQ7mP4tZ8nF1rK6hY3wA5eB0cT2dN8uM7qG4vJ9pL3xR1yF5kW2tA6nQ8mZ0hB7eP4cL9dT3vY1rK5uJ2wG8nF6mQ0tA'
            },
            body: JSON.stringify({
                username: u,
                otp: o
            })
        });
        const data = await res.json();
        displayResult('otp_result', data);
    } catch (err) {
       displayResult('otp_result', { success: false, message: err.message });
    }
}

async function testMutasi(event) {
    event.preventDefault();
    const u = document.getElementById('mutasi_username').value;
    const t = document.getElementById('mutasi_token').value;
    showLoading('mutasi_result');
    try {
        const res = await fetch('/mutasi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer Kj9mPq2wZx5tY8nF3vL7rQ1eB4uN6hM2cA9dR8kT5pW3yG0sJ2vL9xQ7mP4tZ8nF1rK6hY3wA5eB0cT2dN8uM7qG4vJ9pL3xR1yF5kW2tA6nQ8mZ0hB7eP4cL9dT3vY1rK5uJ2wG8nF6mQ0tA'
            },
            body: JSON.stringify({
                username: u,
                token: t
            })
        });
        const data = await res.json();
        displayResult('mutasi_result', data);
    } catch (err) {
        displayResult('mutasi_result', { success: false, message: err.message });
    }
}

async function testgenerateqris(event) {
    event.preventDefault();
    const resultId = 'qris_result';
    showLoading(resultId);

    const u = document.getElementById('qris_username').value;
    const t = document.getElementById('qris_token').value;
    const a = document.getElementById('qris_amount').value;
    const taxtype = document.getElementById('qris_taxtype').value;
    const fee = document.getElementById('qris_fee').value;

    try {
        const res = await fetch('/generateqris', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer Kj9mPq2wZx5tY8nF3vL7rQ1eB4uN6hM2cA9dR8kT5pW3yG0sJ2vL9xQ7mP4tZ8nF1rK6hY3wA5eB0cT2dN8uM7qG4vJ9pL3xR1yF5kW2tA6nQ8mZ0hB7eP4cL9dT3vY1rK5uJ2wG8nF6mQ0tA'
            },
            body: JSON.stringify({
                username: u,
                token: t,
                amount: a,
                taxtype: taxtype,
                fee: fee
            })
        });

        const data = await res.json();
        displayResult(resultId, data);

    } catch (err) {
        displayResult(resultId, {
            status: false,
            message: err.message
        });
    }
}

async function testWithdrawal(event) {
    event.preventDefault();
    const u = document.getElementById('withdraw_username').value;
    const t = document.getElementById('withdraw_token').value;
    const a = document.getElementById('withdraw_amount').value;
    showLoading('withdraw_result');
    try {
        const res = await fetch('/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer Kj9mPq2wZx5tY8nF3vL7rQ1eB4uN6hM2cA9dR8kT5pW3yG0sJ2vL9xQ7mP4tZ8nF1rK6hY3wA5eB0cT2dN8uM7qG4vJ9pL3xR1yF5kW2tA6nQ8mZ0hB7eP4cL9dT3vY1rK5uJ2wG8nF6mQ0tA'
            },
            body: JSON.stringify({
                username: u,
                token: t,
                amount: a
            })
        });
        const data = await res.json();
        displayResult('withdraw_result', data);
    } catch (err) {
        displayResult('withdraw_result', { success: false, message: err.message });
    }
}

// MODIFIED: Function to temporarily allow copying
function allowCopyTemporarily(callback) {
    // Temporarily remove the copy blocker
    document.removeEventListener('copy', blockCopyAction);
    
    // Execute the callback function that performs the copy action
    callback();
    
    // Re-add the copy blocker after a very short delay
    setTimeout(() => {
        document.addEventListener('copy', blockCopyAction);
    }, 100);
}

// MODIFIED: Function to copy text to clipboard
function copyToClipboard(elementId) {
    const codeElement = document.getElementById(elementId);
    const text = codeElement.textContent;
    if (text && text !== 'Result will be shown here...' && text !== 'Fetching...') {
        allowCopyTemporarily(() => {
            // Use writeText for plain text. It's more appropriate and works better.
            navigator.clipboard.writeText(text).then(() => {
                alert('Hasil berhasil disalin ke clipboard!');
            }).catch(err => {
                console.error('Gagal menyalin: ', err);
                alert('Gagal menyalin hasil.');
            });
        });
    } else {
        alert('Tidak ada hasil untuk disalin.');
    }
}
