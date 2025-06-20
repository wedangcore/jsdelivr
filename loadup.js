const elements = {
    form: document.getElementById("uploadForm"),
    area: document.getElementById("uploadArea"),
    input: document.getElementById("fileInput"),
    info: document.getElementById("fileInfo"),
    name: document.getElementById("fileName"),
    size: document.getElementById("fileSize"),
    submit: document.getElementById("submitBtn"),
    uploadIcon: document.getElementById("uploadIcon"),
    loadingIcon: document.getElementById("loadingIcon"),
    result: document.getElementById("uploadResult"),
    copyButton: document.getElementById("copyButton"),
    progress: {
        container: document.getElementById("progressContainer"),
        bar: document.getElementById("progressBar"),
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
    // Global file list elements
    globalFileListContainer: document.getElementById("globalFileListContainer"),
    globalFileList: document.getElementById("globalFileList"),
    globalPagination: document.getElementById("globalPagination"),
    prevGlobalPage: document.getElementById("prevGlobalPage"),
    nextGlobalPage: document.getElementById("nextGlobalPage"),
    globalCurrentPageSpan: document.getElementById("globalCurrentPage"),
    // File viewer modal elements
    fileViewerModal: document.getElementById("file_viewer_modal"),
    fileViewerTitle: document.getElementById("fileViewerTitle"),
    fileViewerContent: document.getElementById("fileViewerContent"),
    // Loading Overlay
    loadingOverlay: document.getElementById("loading-overlay"),
    // Theme Toggle
    themeToggle: document.getElementById("theme-toggle"),
    // Warning Modal
    warningModal: document.getElementById("warning_modal"),
    warningSound: document.getElementById("warning-sound"),
};

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
        elements.input.files = files;
        handleFileSelection(files[0]);
    }
});

elements.input.addEventListener("change", (e) => {
    if (e.target.files.length) {
        handleFileSelection(e.target.files[0]);
    }
});

// --- UI Update Functions ---
const handleFileSelection = (file) => {
     displayFileInfo(file);
     updateButtonState(true);
};

const updateButtonState = (isValid) => {
    elements.submit.disabled = !isValid;
};

const displayFileInfo = (file) => {
    elements.name.textContent = `File: ${file.name}`;
    elements.size.textContent = `Size: ${formatFileSize(file.size)}`;
    elements.info.classList.remove("hidden");
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k**i).toFixed(2))} ${sizes[i]}`;
};

const updateProgress = (percent) => {
    elements.progress.bar.value = percent;
};

const setLoadingState = (isLoading) => {
    elements.submit.disabled = isLoading;
    elements.submit.innerHTML = isLoading ? '<span class="loading loading-spinner"></span> PROCESSING...' : 'UPLOAD';
    elements.uploadIcon.classList.toggle("hidden", isLoading);
    elements.loadingIcon.classList.toggle("hidden", !isLoading);
    elements.progress.container.classList.toggle("hidden", !isLoading);
    if (isLoading) {
         updateProgress(0);
    }
};

const showResult = (type, message, relativeUrl = null) => {
    const fullUrl = relativeUrl ? `${relativeUrl}` : null;
    elements.result.value = fullUrl || message;
    elements.copyButton.disabled = (type !== "success" || !fullUrl);
    
    if (type === "success" && fullUrl) {
         saveToHistory(fullUrl); // Simpan URL lengkap ke riwayat
    }
};

// --- History Management (localStorage) ---
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
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

// --- Event Delegation for History Actions ---
elements.historyTableBody.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('.copy-link');
    if (copyBtn) {
        copyToClipboard(copyBtn.dataset.url, copyBtn);
        return;
    }

    const downloadBtn = e.target.closest('.download-link');
    if (downloadBtn) {
        const fileName = downloadBtn.dataset.url.split('/').pop();
        await downloadFile(fileName, downloadBtn);
        return;
    }

    const deleteBtn = e.target.closest('.delete-link');
    if (deleteBtn) {
        const urlToDelete = deleteBtn.dataset.url;
        const fileName = urlToDelete.split('/').pop();
        deleteBtn.innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;
        deleteBtn.disabled = true;

        try {
            await axios.delete(window.location.origin + `/files/${fileName}`);
            removeFromHistory(urlToDelete);
            await renderGlobalFiles(); // Refresh global list
        } catch (error) {
            console.error('Error deleting file:', error.response ? error.response.data : error.message);
            alert(`Gagal menghapus file: ${error.response ? error.response.data.error : error.message}`);
            deleteBtn.innerHTML = `Delete`;
            deleteBtn.disabled = false;
        }
        return;
    }
});

elements.historyTableBody.addEventListener('change', (e) => {
    const checkbox = e.target.closest('.item-checkbox');
    if (checkbox) {
        const { url } = checkbox.dataset;
        if (checkbox.checked) {
            selectedItems.add(url);
        } else {
            selectedItems.delete(url);
        }
        const allVisibleCheckboxes = document.querySelectorAll('#historyTableBody .item-checkbox');
        const checkedVisibleCheckboxes = document.querySelectorAll('#historyTableBody .item-checkbox:checked');
        elements.selectAllCheckbox.checked = allVisibleCheckboxes.length > 0 && allVisibleCheckboxes.length === checkedVisibleCheckboxes.length;
        updateDeleteSelectedButton();
    }
});


elements.searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderHistory();
});

elements.prevPage.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderHistory();
    }
});

elements.nextPage.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderHistory();
    }
});

elements.selectAllCheckbox.addEventListener('change', e => {
     document.querySelectorAll('#historyTableBody .item-checkbox').forEach(cb => {
         cb.checked = e.target.checked;
         const { url } = cb.dataset;
         if (e.target.checked) selectedItems.add(url);
         else selectedItems.delete(url);
     });
     updateDeleteSelectedButton();
});

elements.deleteSelectedButton.addEventListener("click", async () => {
    const button = elements.deleteSelectedButton;
    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="loading loading-spinner loading-xs"></span> Deleting...`;

    const itemsToDelete = Array.from(selectedItems);
    const deletePromises = itemsToDelete.map(url => {
        const fileName = url.split('/').pop();
        return axios.delete(window.location.origin + `/files/${fileName}`);
    });

    try {
        await Promise.all(deletePromises);
        removeSelectedFromHistory();
        await renderGlobalFiles(); // Refresh global list
    } catch (error) {
        console.error('Error deleting selected files:', error.response ? error.response.data : error.message);
        alert(`Gagal menghapus beberapa file: ${error.response ? error.response.data.error : error.message}`);
    } finally {
        button.innerHTML = originalHtml;
        button.disabled = selectedItems.size === 0;
    }
});

elements.historyButton.addEventListener('click', () => {
    currentPage = 1;
    renderHistory();
    elements.historyModal.showModal();
});

// --- Core Functions ---
const copyToClipboard = (text, buttonElement) => {
    const originalContent = buttonElement.innerHTML;
    const isTextButton = buttonElement.classList.contains('copy-link');
    const successContent = isTextButton
        ? "Copied!"
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg text-success" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>`;

    navigator.clipboard.writeText(text).then(() => {
        buttonElement.innerHTML = successContent;
        if(isTextButton) {
            buttonElement.classList.add("btn-success");
        }
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
            if(isTextButton) {
                 buttonElement.classList.remove("btn-success");
            }
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        buttonElement.innerHTML = 'Error';
         setTimeout(() => {
            buttonElement.innerHTML = originalContent;
        }, 2000);
    });
};

async function downloadFile(fileName, buttonElement) {
    const originalContent = buttonElement.innerHTML;
    buttonElement.innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;
    buttonElement.disabled = true;

    try {
        const response = await axios({
            url: window.location.origin + `/download/${fileName}`,
            method: 'GET',
            responseType: 'blob',
        });

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
        alert(`Gagal mengunduh file: ${error.response ? error.response.data.error : error.message}`);
    } finally {
        buttonElement.innerHTML = originalContent;
        buttonElement.disabled = false;
    }
}

elements.copyButton.addEventListener("click", (e) => {
    const text = elements.result.value;
    if (text) {
        copyToClipboard(text, e.currentTarget);
    }
});

const resetForm = () => {
    elements.input.value = null; 
    elements.info.classList.add("hidden");
    setLoadingState(false);
    updateButtonState(false);
    elements.progress.container.classList.add("hidden");
};

// --- Form Submit Handler with Axios ---
elements.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = elements.input.files[0];

    if (!file) {
        showResult("error", "Please select a file first.");
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
         showResult("error", "File size exceeds the 50MB limit.");
         return;
    }

    setLoadingState(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(window.location.origin + `/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                updateProgress(percentCompleted);
            }
        });

        showResult("success", "File uploaded successfully!", response.data.url);
        await renderGlobalFiles();

    } catch (error) {
        console.error('Upload failed:', error.response ? error.response.data : error.message);
        showResult("error", error.response ? error.response.data.error : "Upload failed.");
    } finally {
        resetForm();
    }
});

// --- Global File List Logic with Axios ---
let globalCurrentPage = 1;
const globalItemsPerPage = 10;

async function renderGlobalFiles() {
    const { globalFileList, prevGlobalPage, nextGlobalPage, globalCurrentPageSpan, globalPagination } = elements;
    globalFileList.innerHTML = `<div class="text-center p-4"><span class="loading loading-spinner"></span> Memuat file...</div>`;
    globalPagination.classList.add('hidden'); 

    try {
        const response = await axios.get(window.location.origin + `/files?page=${globalCurrentPage}`);
        const { files: itemsToDisplay, hasNextPage } = response.data;
        
        globalFileList.innerHTML = ''; 

        if (itemsToDisplay.length === 0 && globalCurrentPage === 1) {
            globalFileList.innerHTML = `<div class="text-center p-4 text-neutral-500">Belum ada file yang di-upload.</div>`;
            return;
        }
        
        globalPagination.classList.remove('hidden'); 
        const listElement = document.createElement('div');
        listElement.className = "flex flex-col gap-2";

        itemsToDisplay.forEach(file => {
            if (file.name === '.emptyFolderPlaceholder') return;

            const fileUrl = window.location.origin + `/files/${file.name}`;
            const fileElement = document.createElement('div');
            fileElement.className = 'flex justify-between items-center p-2 border-b';
            
            fileElement.innerHTML = `
                <div class="flex-grow overflow-hidden">
                    <div class="truncate font-semibold text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark inline-block mr-2 flex-shrink-0" viewBox="0 0 16 16"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>
                        <span class="align-middle" title="${file.name}">${file.name}</span>
                    </div>
                    <div class="text-xs text-neutral-500 pl-8 mt-1">
                        <span>${formatFileSize(file.metadata.size)}</span>
                        <span class="mx-1">|</span>
                        <span class="truncate" title="${file.metadata.mimetype}">${file.metadata.mimetype}</span>
                        <span class="mx-1">|</span>
                        <span>Updated: ${new Date(file.updated_at).toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <div class="join flex-shrink-0">
                    <button class="btn btn-xs btn-ghost join-item view-link" 
                            data-url="${fileUrl}" 
                            data-mimetype="${file.metadata.mimetype}" 
                            data-name="${file.name}" 
                            title="View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                    </button>
                    <button class="btn btn-xs btn-ghost join-item global-download-link" data-name="${file.name}" title="Download">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                    </button>
                    <button class="btn btn-xs btn-ghost join-item global-copy-link" data-url="${fileUrl}" title="Copy Link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/></svg>
                    </button>
                </div>
            `;
            listElement.appendChild(fileElement);
        });
        globalFileList.appendChild(listElement);

        globalCurrentPageSpan.textContent = globalCurrentPage;
        prevGlobalPage.disabled = globalCurrentPage === 1;
        nextGlobalPage.disabled = !hasNextPage; 

    } catch (error) {
        console.error('Error fetching global file list:', error.response ? error.response.data : error.message);
        globalFileList.innerHTML = `<div class="alert alert-error rounded-none"><span>Gagal memuat daftar file. Error: ${error.response ? error.response.data.error : error.message}</span></div>`;
    }
}

elements.prevGlobalPage.addEventListener('click', () => {
    if (globalCurrentPage > 1) {
        globalCurrentPage--;
        renderGlobalFiles();
    }
});

elements.nextGlobalPage.addEventListener('click', () => {
    if(!elements.nextGlobalPage.disabled) {
        globalCurrentPage++;
        renderGlobalFiles();
    }
});


elements.globalFileListContainer.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('.global-copy-link');
    if (copyBtn) {
        copyToClipboard(copyBtn.dataset.url, copyBtn);
        return;
    }

    const viewBtn = e.target.closest('.view-link');
    if(viewBtn) {
        const { url, mimetype, name } = viewBtn.dataset;
        await showFilePreview(url, mimetype, name);
        return;
    }

    const downloadBtn = e.target.closest('.global-download-link');
    if (downloadBtn) {
        await downloadFile(downloadBtn.dataset.name, downloadBtn);
        return;
    }
});

// Logic to show file preview
async function showFilePreview(url, mimetype, name) {
    const { fileViewerModal, fileViewerTitle, fileViewerContent } = elements;
    fileViewerTitle.textContent = name;
    fileViewerContent.innerHTML = '<span class="loading loading-spinner loading-lg"></span>';
    fileViewerModal.showModal();

    let content = '';
    try {
        if (mimetype.startsWith('image/')) {
            content = `<img src="${url}" alt="${name}" class="max-w-full max-h-[70vh] object-contain">`;
        } else if (mimetype.startsWith('video/')) {
            content = `<video src="${url}" controls class="max-w-full max-h-[70vh]"></video>`;
        } else if (mimetype.startsWith('audio/')) {
            content = `<audio src="${url}" controls></audio>`;
        } else if (mimetype === 'application/pdf') {
            content = `<iframe src="${url}" class="w-full h-[70vh]" frameborder="0"></iframe>`;
        } else if (mimetype.startsWith('text/')) {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Gagal memuat file teks');
            const text = await response.text();
            // Basic HTML escaping
            const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            content = `<pre class="whitespace-pre-wrap text-left w-full bg-base-300 p-4 rounded-none text-sm">${escapedText}</pre>`;
        } else {
            content = `
                <div class="text-center">
                    <p>Pratinjau untuk tipe file <strong>${mimetype}</strong> tidak tersedia.</p>
                    <a href="${url}" download class="btn btn-primary mt-4">Unduh File</a>
                </div>
            `;
        }
    } catch (error) {
         console.error("Gagal menampilkan pratinjau:", error);
         content = `<div class="text-center text-error">Gagal memuat pratinjau file.</div>`;
    }
    fileViewerContent.innerHTML = content;
}

// --- Theme Management ---
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

elements.themeToggle.addEventListener('change', () => {
    const theme = elements.themeToggle.checked ? 'dark' : 'light';
    applyTheme(theme);
});

// --- Warning for right-click and long-press ---
const showWarning = (e) => {
    e.preventDefault();
    elements.warningModal.showModal();
    elements.warningSound.play().catch(error => {
        // Autoplay was prevented.
        console.log("Playback prevented by browser.", error);
    });
};

document.addEventListener('contextmenu', showWarning);
let touchTimer;
document.addEventListener('touchstart', (e) => {
    touchTimer = setTimeout(() => showWarning(e), 1000); // 1 second hold
});
document.addEventListener('touchend', () => {
    clearTimeout(touchTimer);
});
document.addEventListener('touchmove', () => {
    clearTimeout(touchTimer);
});

// Stop sound when warning modal is closed
elements.warningModal.addEventListener('close', () => {
    elements.warningSound.pause();
    elements.warningSound.currentTime = 0;
});


// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    // Apply saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    elements.themeToggle.checked = savedTheme === 'dark';
    applyTheme(savedTheme);

    await renderGlobalFiles();
    const { loadingOverlay } = elements;
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 500);
});
