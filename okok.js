// --- START: Anti-Inspect/Copy Logic ---
const warningModal = document.getElementById('warning-modal');
const warningSound = document.getElementById('warning-sound');

function showWarningModal() {
    // Play sound and show the modal
    if (warningSound && warningModal) {
        warningSound.play().catch(e => console.error("Audio play failed. User interaction might be required first.", e));
        warningModal.showModal();
    }
}

// Add event listener for when the modal is closed
if(warningModal) {
    warningModal.addEventListener('close', () => {
        // Stop and reset the sound
        warningSound.pause();
        warningSound.currentTime = 0;
    });
}


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

// Disable copy and cut events
document.addEventListener('copy', event => {
    event.preventDefault();
    showWarningModal();
});
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
    if (data.success) {
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
    const resultContainer = document.getElementById('qris_result_container');
    resultContainer.innerHTML = '<span class="text-base-content/50">Generating QRIS...</span>';

    const u = document.getElementById('qris_username').value;
    const t = document.getElementById('qris_token').value;
    const a = document.getElementById('qris_amount').value;

    try {
        const res = await fetch('/generateqris', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: u,
                token: t,
                amount: a
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            const pre = document.createElement('pre');
            pre.className = 'bg-error text-error-content p-4 rounded-none w-full';
            const code = document.createElement('code');
            code.textContent = JSON.stringify(errorData, null, 2);
            pre.appendChild(code);
            resultContainer.innerHTML = '';
            resultContainer.appendChild(pre);
            return;
        }

        const imageBlob = await res.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        resultContainer.innerHTML = '';
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.className = 'max-w-full h-auto rounded-lg';
        resultContainer.appendChild(imgElement);

    } catch (err) {
        resultContainer.innerHTML = `<pre class="bg-error text-error-content p-4 rounded-none w-full"><code>${JSON.stringify({ success: false, message: err.message }, null, 2)}</code></pre>`;
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
