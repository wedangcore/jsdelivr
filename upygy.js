// Konfigurasi Klien
const API_BASE_URL = ''; // Gunakan string kosong jika server berjalan di domain yang sama

const elements = {
    form: document.getElementById("uploadForm"),
    area: document.getElementById("uploadArea"),
    input: document.getElementById("fileInput"),
    fileListContainer: document.getElementById("fileListContainer"),
    submit: document.getElementById("submitBtn"),
    uploadIcon: document.getElementById("uploadIcon"),
    loadingIcon: document.getElementById("loadingIcon"),
    resultContainer: document.getElementById("resultContainer"),
    progress: {
        container: document.getElementById("progressContainer"),
        bar: document.getElementById("progressBar"),
        label: document.getElementById("progressLabel"),
    },
    historyButton: document.getElementById("historyButton"),
    historyModal: document.getElementById("history_modal"),
    searchInput: document.getElementById("searchInput"),
    historyTableBody: document.getElementById("historyTableBody"),
    prevPage: document.getElementById("prevPage"),
    nextPage: document.getElementById("nextPage"),
    currentPageSpan: document.getElementById("currentPage"),
    totalPagesSpan: document.getElementById("totalPages"),
    selectAllCheckbox: document.getElementById("selectAllCheckbox"),
    deleteSelectedButton: document.getElementById("deleteSelectedButton"),
    fileViewerModal: document.getElementById("file_viewer_modal"),
    fileViewerTitle: document.getElementById("fileViewerTitle"),
    fileViewerContent: document.getElementById("fileViewerContent"),
    loadingOverlay: document.getElementById("loading-overlay"),
    themeToggle: document.getElementById("theme-toggle"),
    warningModal: document.getElementById("warning_modal"),
    warningSound: document.getElementById("warning-sound"),
    apiDocsButton: document.getElementById("apiDocsButton"),
    apiDocumentationModal: document.getElementById("api_documentation_modal"),
    statisticsContainer: document.getElementById("statisticsContainer"),
    statsContent: document.getElementById("statsContent"),
    statsLoading: document.getElementById("statsLoading"),
    statsData: document.getElementById("statsData"),
    statsStorageProgress: document.getElementById("statsStorageProgress"),
    statsStorageUsageText: document.getElementById("statsStorageUsageText"),
    statsStoragePercentage: document.getElementById("statsStoragePercentage"),
    statsTotalFiles: document.getElementById("statsTotalFiles"),
    statsTotalSize: document.getElementById("statsTotalSize"),
    statsUploadSuccess: document.getElementById("statsUploadSuccess"),
    statsUploadFailed: document.getElementById("statsUploadFailed"),
    statsTodayFiles: document.getElementById("statsTodayFiles"),
    statsTodaySize: document.getElementById("statsTodaySize"),
    statsWeekFiles: document.getElementById("statsWeekFiles"),
    statsWeekSize: document.getElementById("statsWeekSize"),
    statsMonthFiles: document.getElementById("statsMonthFiles"),
    statsMonthSize: document.getElementById("statsMonthSize"),
    statsYearFiles: document.getElementById("statsYearFiles"),
    statsYearSize: document.getElementById("statsYearSize"),
    hourlyActivityChart: document.getElementById("hourlyActivityChart"),
};

let filesToUpload = []; // Array untuk menyimpan file yang akan diunggah

// --- Event Listeners for File Input ---
elements.area.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    elements.input.click();
});
elements.input.addEventListener("click", (e) => e.stopPropagation());
elements.area.addEventListener("dragover", (e) => {
    e.preventDefault();
    elements.area.classList.add("bg-base-200");
});
elements.area.addEventListener("dragleave", (e) => {
    if (!elements.area.contains(e.relatedTarget)) {
        elements.area.classList.remove("bg-base-200");
    }
});
elements.area.addEventListener("drop", (e) => {
    e.preventDefault();
    elements.area.classList.remove("bg-base-200");
    const files = e.dataTransfer.files;
    if (files.length) {
        handleFileSelection(files);
    }
});
elements.input.addEventListener("change", (e) => {
    if (e.target.files.length) {
        handleFileSelection(e.target.files);
    }
});

// --- UI Update Functions ---
const handleFileSelection = (newFiles) => {
    const allFiles = [...filesToUpload, ...Array.from(newFiles)];
    
    if (allFiles.length > 10) {
        alert("Tidak dapat memilih lebih dari 10 file.");
        return;
    }

    filesToUpload = allFiles.filter(file => {
        if (file.size > 50 * 1024 * 1024) {
            alert(`File "${file.name}" terlalu besar (Maks 50 MB) dan tidak akan ditambahkan.`);
            return false;
        }
        return true;
    });

    renderFileList();
    updateButtonState(filesToUpload.length > 0);
};

const renderFileList = () => {
    if (filesToUpload.length === 0) {
        elements.fileListContainer.classList.add('hidden');
        return;
    }

    elements.fileListContainer.innerHTML = filesToUpload.map((file, index) => `
        <div id="file-item-${index}" class="flex items-center justify-between bg-base-200 p-2 border-2 border-black rounded text-sm">
            <div class="flex-1 truncate pr-2">
                <p class="font-medium truncate">${file.name}</p>
                <p class="text-xs text-neutral-500">${formatFileSize(file.size)}</p>
            </div>
            <div class="file-status text-xs font-bold text-gray-500 mr-2">Waiting...</div>
            <button type="button" class="btn btn-xs btn-circle btn-error remove-file-btn" data-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    `).join('');

    elements.fileListContainer.classList.remove('hidden');
};

elements.fileListContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-file-btn');
    if (removeBtn) {
        const indexToRemove = parseInt(removeBtn.dataset.index, 10);
        filesToUpload.splice(indexToRemove, 1);
        renderFileList();
        updateButtonState(filesToUpload.length > 0);
    }
});

const updateButtonState = (isValid) => {
    elements.submit.disabled = !isValid;
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k**i).toFixed(2))} ${sizes[i]}`;
};

const updateOverallProgress = (currentFileIndex, totalFiles) => {
    const percent = Math.round((currentFileIndex / totalFiles) * 100);
    elements.progress.bar.value = percent;
    elements.progress.label.textContent = `Overall Progress: ${currentFileIndex} / ${totalFiles} files`;
};

const setLoadingState = (isLoading) => {
    elements.submit.disabled = isLoading;
    elements.input.disabled = isLoading;
    elements.area.style.pointerEvents = isLoading ? 'none' : 'auto';
    elements.submit.innerHTML = isLoading ? '<span class="loading loading-spinner"></span> UPLOADING...' : 'UPLOAD';
    elements.progress.container.classList.toggle("hidden", !isLoading);
};

const addResult = (url) => {
    const resultId = `result-${Date.now()}`;
    const resultElement = document.createElement('div');
    resultElement.className = 'flex gap-2 w-full';
    resultElement.innerHTML = `
        <input type="text" id="${resultId}" value="${url}" class="input input-bordered rounded w-full flex-1 border-2 border-black" readonly>
        <button type="button" class="btn btn-square btn-outline border-2 border-black rounded copy-result-btn">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/></svg>
        </button>
    `;
    elements.resultContainer.appendChild(resultElement);
    saveToHistory(url);
};

elements.resultContainer.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-result-btn');
    if (copyBtn) {
        const input = copyBtn.previousElementSibling;
        copyToClipboard(input.value, copyBtn);
    }
});

const resetForm = () => {
    filesToUpload = [];
    elements.form.reset();
    elements.fileListContainer.classList.add('hidden');
    elements.fileListContainer.innerHTML = '';
    elements.resultContainer.innerHTML = '';
    setLoadingState(false);
    updateButtonState(false);
    elements.progress.container.classList.add("hidden");
};

// --- History, Statistics, Core Functions (Mostly Unchanged) ---
let currentPage = 1;
const itemsPerPage = 5;
let filteredHistory = [];
let selectedItems = new Set();
const saveToHistory = (url) => {
    const history = getHistory();
    history.unshift({ url, timestamp: Date.now() });
    localStorage.setItem("uploadHistory", JSON.stringify(history));
};
const getHistory = () => JSON.parse(localStorage.getItem("uploadHistory") || "[]");
const removeFromHistory = (url) => {
    let history = getHistory();
    history = history.filter((item) => item.url !== url);
    localStorage.setItem("uploadHistory", JSON.stringify(history));
    renderHistory();
};
const removeSelectedFromHistory = () => {
    let history = getHistory();
    history = history.filter((item) => !selectedItems.has(item.url));
    localStorage.setItem("uploadHistory", JSON.stringify(history));
    selectedItems.clear();
    renderHistory();
};
const renderHistory = () => {
    const history = getHistory();
    const searchTerm = elements.searchInput.value.toLowerCase();
    filteredHistory = history.filter((item) => item.url.toLowerCase().includes(searchTerm));
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredHistory.slice(start, end);

    if (pageItems.length === 0) {
        elements.historyTableBody.innerHTML = `<tr><td colspan="4" class="text-center p-8">No history found.</td></tr>`;
    } else {
        elements.historyTableBody.innerHTML = pageItems.map(item => `
            <tr>
                <td><label><input type="checkbox" class="checkbox item-checkbox border-black rounded" data-url="${item.url}" ${selectedItems.has(item.url) ? "checked" : ""}></label></td>
                <td><a href="${item.url}" target="_blank" class="link link-hover text-blue-600 truncate block max-w-xs" title="${item.url}">${item.url}</a></td>
                <td><div class="badge badge-success badge-outline">Lifetime</div></td>
                <td class="text-right">
                    <div class="join">
                        <button class="btn btn-xs btn-outline btn-info border-black rounded join-item download-link" data-url="${item.url}" title="Download">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                        </button>
                        <button class="btn btn-xs btn-outline border-black rounded join-item copy-link" data-url="${item.url}">Copy</button>
                        <button class="btn btn-xs btn-outline btn-error border-black rounded join-item delete-link" data-url="${item.url}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join("");
    }
    elements.currentPageSpan.textContent = currentPage;
    elements.totalPagesSpan.textContent = totalPages;
    elements.prevPage.disabled = currentPage === 1;
    elements.nextPage.disabled = currentPage === totalPages;
    updateDeleteSelectedButton();
};
const updateDeleteSelectedButton = () => {
    elements.deleteSelectedButton.disabled = selectedItems.size === 0;
};
async function renderStatistics() {
    const { statsLoading, statsData, statsContent, hourlyActivityChart } = elements;
    statsLoading.classList.remove('hidden');
    statsData.classList.add('hidden');
    try {
        const response = await axios.get(`${API_BASE_URL}/statistics`);
        const stats = response.data;
        const totalStorageQuota = 2 * 1024 * 1024 * 1024 * 1024;
        const usedStorage = stats.storage.totalSize;
        const percentage = (usedStorage / totalStorageQuota) * 100;
        elements.statsStorageProgress.value = percentage;
        elements.statsStorageUsageText.textContent = `${formatFileSize(usedStorage)} / 2 TB`;
        elements.statsStoragePercentage.textContent = `${percentage.toFixed(4)}%`;
        elements.statsTotalFiles.textContent = stats.storage.totalFiles.toLocaleString('id-ID');
        elements.statsTotalSize.textContent = formatFileSize(stats.storage.totalSize);
        elements.statsUploadSuccess.textContent = stats.storage.uploadSuccess.toLocaleString('id-ID');
        elements.statsUploadFailed.textContent = stats.storage.uploadFailed.toLocaleString('id-ID');
        elements.statsTodayFiles.textContent = stats.period.today.files.toLocaleString('id-ID');
        elements.statsTodaySize.textContent = formatFileSize(stats.period.today.size);
        elements.statsWeekFiles.textContent = stats.period.thisWeek.files.toLocaleString('id-ID');
        elements.statsWeekSize.textContent = formatFileSize(stats.period.thisWeek.size);
        elements.statsMonthFiles.textContent = stats.period.thisMonth.files.toLocaleString('id-ID');
        elements.statsMonthSize.textContent = formatFileSize(stats.period.thisMonth.size);
        elements.statsYearFiles.textContent = stats.period.thisYear.files.toLocaleString('id-ID');
        elements.statsYearSize.textContent = formatFileSize(stats.period.thisYear.size);
        hourlyActivityChart.innerHTML = '';
        const hourlyData = stats.activity.last24Hours;
        const maxActivity = Math.max(...hourlyData) || 1;
        const now = new Date();
        const currentHour = now.getHours();
        const hoursOrder = [];
        for (let i = 0; i < 24; i++) {
             hoursOrder.push((currentHour - (23 - i) + 24) % 24);
        }
        hoursOrder.forEach(hour => {
            const count = hourlyData[hour] || 0;
            const barHeight = (count / maxActivity) * 100;
            const bar = document.createElement('div');
            bar.className = 'w-full bg-primary rounded-t tooltip';
            bar.style.height = `${Math.max(barHeight, 2)}%`;
            bar.dataset.tip = `${count} uploads at ${hour}:00`;
            hourlyActivityChart.appendChild(bar);
        });
        statsLoading.classList.add('hidden');
        statsData.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching statistics:', error);
        elements.statsContent.innerHTML = `<div class="alert alert-error rounded"><span>Gagal memuat statistik.</span></div>`;
    }
}
elements.historyTableBody.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('.copy-link');
    if (copyBtn) { copyToClipboard(copyBtn.dataset.url, copyBtn, true); return; }
    const downloadBtn = e.target.closest('.download-link');
    if (downloadBtn) { await downloadFile(downloadBtn.dataset.url.split('/').pop(), downloadBtn); return; }
    const deleteBtn = e.target.closest('.delete-link');
    if (deleteBtn) {
        const urlToDelete = deleteBtn.dataset.url;
        const fileName = urlToDelete.split('/').pop();
        deleteBtn.innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;
        deleteBtn.disabled = true;
        try {
            await axios.delete(`${API_BASE_URL}/files/${fileName}`);
            removeFromHistory(urlToDelete);
            await renderStatistics();
        } catch (error) {
            console.error('Error deleting file:', error.response ? error.response.data : error.message);
            elements.warningModal.querySelector('.py-2').textContent = `Gagal menghapus file: ${error.response ? error.response.data.error : error.message}`;
            elements.warningModal.showModal();
            elements.warningSound.play().catch(error => console.log("Playback prevented.", error));
            deleteBtn.innerHTML = `Delete`;
            deleteBtn.disabled = false;
        }
    }
});
elements.historyTableBody.addEventListener('change', (e) => {
    const checkbox = e.target.closest('.item-checkbox');
    if (checkbox) {
        const { url } = checkbox.dataset;
        checkbox.checked ? selectedItems.add(url) : selectedItems.delete(url);
        const allVisibleCheckboxes = document.querySelectorAll('#historyTableBody .item-checkbox');
        const checkedVisibleCheckboxes = document.querySelectorAll('#historyTableBody .item-checkbox:checked');
        elements.selectAllCheckbox.checked = allVisibleCheckboxes.length > 0 && allVisibleCheckboxes.length === checkedVisibleCheckboxes.length;
        updateDeleteSelectedButton();
    }
});
elements.searchInput.addEventListener("input", () => { currentPage = 1; renderHistory(); });
elements.prevPage.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderHistory(); } });
elements.nextPage.addEventListener("click", () => { const totalPages = Math.ceil(filteredHistory.length / itemsPerPage); if (currentPage < totalPages) { currentPage++; renderHistory(); } });
elements.selectAllCheckbox.addEventListener('change', e => {
     document.querySelectorAll('#historyTableBody .item-checkbox').forEach(cb => {
         cb.checked = e.target.checked;
         const { url } = cb.dataset;
         e.target.checked ? selectedItems.add(url) : selectedItems.delete(url);
     });
     updateDeleteSelectedButton();
});
elements.deleteSelectedButton.addEventListener("click", async () => {
    const button = elements.deleteSelectedButton;
    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="loading loading-spinner loading-xs"></span> Deleting...`;
    const itemsToDelete = Array.from(selectedItems);
    const deletePromises = itemsToDelete.map(url => axios.delete(`${API_BASE_URL}/files/${url.split('/').pop()}`));
    try {
        await Promise.all(deletePromises);
        removeSelectedFromHistory();
        await renderStatistics();
    } catch (error) {
        console.error('Error deleting selected files:', error.response ? error.response.data : error.message);
        elements.warningModal.querySelector('.py-2').textContent = `Gagal menghapus beberapa file: ${error.response ? error.response.data.error : error.message}`;
        elements.warningModal.showModal();
        elements.warningSound.play().catch(error => console.log("Playback prevented.", error));
    } finally {
        button.innerHTML = originalHtml;
        button.disabled = selectedItems.size === 0;
    }
});
elements.historyButton.addEventListener('click', () => { currentPage = 1; renderHistory(); elements.historyModal.showModal(); });
const copyToClipboard = (text, buttonElement, isTextButton = false) => {
    const originalContent = buttonElement.innerHTML;
    const successContent = isTextButton ? "Copied!" : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg text-success" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>`;
    navigator.clipboard.writeText(text).then(() => {
        buttonElement.innerHTML = successContent;
        if(isTextButton) buttonElement.classList.add("btn-success");
        else buttonElement.classList.add('btn-success');
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
            if(isTextButton) buttonElement.classList.remove("btn-success");
            else buttonElement.classList.remove('btn-success');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        buttonElement.innerHTML = 'Error';
         setTimeout(() => { buttonElement.innerHTML = originalContent; }, 2000);
    });
};
async function downloadFile(fileName, buttonElement) {
    const originalContent = buttonElement.innerHTML;
    buttonElement.innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;
    buttonElement.disabled = true;
    try {
        const response = await axios({ url: `${API_BASE_URL}/download/${fileName}`, method: 'GET', responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error.response ? error.response.data : error.message);
        elements.warningModal.querySelector('.py-2').textContent = `Gagal mengunduh file: ${error.response ? error.response.data.error : error.message}`;
        elements.warningModal.showModal();
        elements.warningSound.play().catch(error => console.log("Playback prevented.", error));
    } finally {
        buttonElement.innerHTML = originalContent;
        buttonElement.disabled = false;
    }
}

// --- Form Submit Handler (LOGIKA BARU) ---
elements.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (filesToUpload.length === 0 || elements.submit.disabled) {
        return;
    }

    setLoadingState(true);
    const totalFiles = filesToUpload.length;
    updateOverallProgress(0, totalFiles);

    for (let i = 0; i < totalFiles; i++) {
        const file = filesToUpload[i];
        const fileItemElement = document.getElementById(`file-item-${i}`);
        const statusElement = fileItemElement.querySelector('.file-status');

        statusElement.textContent = 'Uploading...';
        statusElement.classList.remove('text-gray-500', 'text-error');
        statusElement.classList.add('text-blue-500');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/upload`, formData);
            addResult(response.data.url);
            statusElement.textContent = 'Success';
            statusElement.classList.remove('text-blue-500');
            statusElement.classList.add('text-success');
        } catch (error) {
            console.error(`Upload failed for ${file.name}:`, error.response ? error.response.data : error.message);
            statusElement.textContent = 'Failed';
            statusElement.classList.remove('text-blue-500');
            statusElement.classList.add('text-error');
        }

        updateOverallProgress(i + 1, totalFiles);
        await renderStatistics(); // Refresh statistik setelah setiap file
    }

    setLoadingState(false);
    filesToUpload = [];
    elements.input.value = "";
    elements.fileListContainer.classList.add('hidden');
    updateButtonState(false);
});


// --- Theme Management & Initial Load ---
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};
elements.themeToggle.addEventListener('change', () => {
    const theme = elements.themeToggle.checked ? 'dark' : 'light';
    applyTheme(theme);
});

document.addEventListener('DOMContentLoaded', async () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    elements.themeToggle.checked = savedTheme === 'dark';
    applyTheme(savedTheme);

    if (elements.apiDocsButton && elements.apiDocumentationModal) {
        elements.apiDocsButton.addEventListener('click', () => {
            elements.apiDocumentationModal.showModal();
        });
    }

    const copyCodeButtons = document.querySelectorAll('.copy-api-code-btn');
    copyCodeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const codeBlock = e.target.closest('.relative').querySelector('.code-block code');
            if (codeBlock) copyToClipboard(codeBlock.textContent, button);
        });
    });

    await renderStatistics();

    elements.loadingOverlay.style.opacity = '0';
    setTimeout(() => {
        elements.loadingOverlay.style.display = 'none';
    }, 500);
});
