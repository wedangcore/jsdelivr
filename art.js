document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        form: document.getElementById("generateForm"),
        area: document.getElementById("uploadArea"),
        input: document.getElementById("fileInput"),
        info: document.getElementById("fileInfo"),
        name: document.getElementById("fileName"),
        size: document.getElementById("fileSize"),
        submit: document.getElementById("submitBtn"),
        resultContainer: document.getElementById("resultContainer"),
        originalImage: document.getElementById("originalImage"),
        generatedImage: document.getElementById("generatedImage"),
        generatedImageContainer: document.getElementById("generatedImageContainer"),
        resultSpinner: document.getElementById("resultSpinner"),
        loadingOverlay: document.getElementById("loading-overlay"),
        errorMessage: document.getElementById("errorMessage"),
        styleSelect: document.getElementById("styleSelect"),
        sizeSelect: document.getElementById("sizeSelect"),
        resultStyleTitle: document.getElementById("resultStyleTitle"),
        loadingTitle: document.getElementById("loadingTitle"),
        loadingSubtitle: document.getElementById("loadingSubtitle"),
        generationProgressContainer: document.getElementById("generationProgressContainer"),
        generationProgressBar: document.getElementById("generationProgressBar"),
        resultActionsContainer: document.getElementById("resultActionsContainer"),
        generatedUrlInput: document.getElementById("generatedUrlInput"),
        downloadButton: document.getElementById("downloadButton"),
        copyButton: document.getElementById("copyButton"),
        copyIcon: document.getElementById("copyIcon"),
        checkIcon: document.getElementById("checkIcon"),
        themeToggle: document.getElementById("theme-toggle"),
        historyContainer: document.getElementById("historyContainer"),
        historyPagination: document.getElementById("historyPagination"),
        prevPage: document.getElementById("prevPage"),
        nextPage: document.getElementById("nextPage"),
        currentPageSpan: document.getElementById("currentPage"),
        warningModal: document.getElementById("warning_modal"),
        warningSound: document.getElementById("warning-sound"),
        fileViewerModal: document.getElementById("file_viewer_modal"),
        fileViewerTitle: document.getElementById("fileViewerTitle"),
        fileViewerContent: document.getElementById("fileViewerContent"),
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    elements.themeToggle.addEventListener('change', () => {
        const theme = elements.themeToggle.checked ? 'dark' : 'light';
        applyTheme(theme);
    });

    // --- Logika Riwayat ---
    let currentPage = 1;
    const itemsPerPage = 5;

    const getHistory = () => JSON.parse(localStorage.getItem("artHistory") || "[]");
    
    const saveToHistory = (imageUrl, style) => {
        const history = getHistory();
        history.unshift({ imageUrl, style, timestamp: new Date().toISOString() });
        if (history.length > 50) {
            history.pop();
        }
        localStorage.setItem("artHistory", JSON.stringify(history));
    };

    const renderHistory = () => {
        const history = getHistory();
        if (history.length === 0) {
            elements.historyContainer.innerHTML = `<div class="text-center p-4">Belum ada riwayat.</div>`;
            elements.historyPagination.classList.add('hidden');
            return;
        }
        
        elements.historyPagination.classList.remove('hidden');
        
        const totalPages = Math.ceil(history.length / itemsPerPage);
        if(currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = history.slice(start, end);

        elements.historyContainer.innerHTML = '';
        pageItems.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'flex justify-between items-center p-2 border-b';
            
            const timestamp = new Date(item.timestamp);
            const formattedDateTime = timestamp.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const viewTitle = `Generated ${item.style} ${formattedDateTime}`;
            const downloadFileName = `${item.style.replace(/\s+/g, '-')}-art-${timestamp.getTime()}.png`;

            historyElement.innerHTML = `
                <div class="flex-grow overflow-hidden">
                    <div class="font-bold text-sm truncate">Gaya: ${item.style}</div>
                    <div class="text-xs text-base-content/60">${formattedDateTime}</div>
                </div>
                <div class="join flex-shrink-0">
                    <button class="btn btn-xs btn-ghost join-item view-link" data-url="${item.imageUrl}" data-name="${viewTitle}" title="View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                    </button>
                    <a href="${item.imageUrl}" download="${downloadFileName}" class="btn btn-xs btn-ghost join-item" title="Download">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                    </a>
                    <button class="btn btn-xs btn-ghost join-item history-copy-btn" data-url="${window.location.origin}${item.imageUrl}" title="Copy Link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/></svg>
                    </button>
                </div>
            `;
            elements.historyContainer.appendChild(historyElement);
        });

        elements.currentPageSpan.textContent = currentPage;
        elements.prevPage.disabled = currentPage === 1;
        elements.nextPage.disabled = currentPage === totalPages;
    };
    
    async function showFilePreview(url, name) {
        const { fileViewerModal, fileViewerTitle, fileViewerContent } = elements;
        fileViewerTitle.textContent = name;
        fileViewerContent.innerHTML = '<span class="loading loading-spinner loading-lg"></span>';
        fileViewerModal.showModal();
        fileViewerContent.innerHTML = `<img src="${url}" alt="${name}" class="max-w-full max-h-[70vh] object-contain">`;
    }

    elements.prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderHistory();
        }
    });

    elements.nextPage.addEventListener("click", () => {
        const history = getHistory();
        const totalPages = Math.ceil(history.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderHistory();
        }
    });
    
    elements.historyContainer.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.history-copy-btn');
        if (copyBtn) {
            const url = copyBtn.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                const icon = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg text-success" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>`;
                setTimeout(() => {
                    copyBtn.innerHTML = icon;
                }, 2000);
            });
        }
        
        const viewBtn = e.target.closest('.view-link');
        if(viewBtn) {
            const { url, name } = viewBtn.dataset;
            showFilePreview(url, name);
        }
    });


    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
    };
    
    const handleFileSelection = (file) => {
        if (file && file.type.startsWith('image/')) {
            elements.name.textContent = `File: ${file.name}`;
            elements.size.textContent = `Size: ${formatFileSize(file.size)}`;
            elements.info.classList.remove("hidden");
            elements.submit.disabled = false;
        } else {
            console.error("Please select an image file (e.g., JPG, PNG, WEBP).");
            elements.input.value = null;
            elements.info.classList.add("hidden");
            elements.submit.disabled = true;
        }
    };
    
    const showGenerationLoading = (isLoading, styleText = "art") => {
        const { loadingOverlay, loadingTitle, loadingSubtitle, generationProgressContainer, generationProgressBar } = elements;

        if (isLoading) {
            loadingTitle.textContent = `Generating your ${styleText} art...`;
            loadingSubtitle.textContent = 'Please wait, this may take a moment.';
            generationProgressContainer.classList.remove('hidden');
            generationProgressBar.value = 0;
            
            loadingOverlay.style.opacity = '1';
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.classList.add('flex');
        } else {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
               loadingOverlay.classList.add('hidden');
               generationProgressContainer.classList.add('hidden');
            }, 500); 
        }
    };
    
    const showResultState = (isLoading, error = null) => {
        elements.resultContainer.classList.remove("hidden");
        elements.resultSpinner.style.display = isLoading ? 'block' : 'none';
        
        elements.generatedImage.classList.add('hidden');
        elements.resultActionsContainer.classList.add('hidden');
        elements.errorMessage.classList.add('hidden');

        if (error) {
            elements.resultSpinner.style.display = 'none';
            elements.errorMessage.textContent = error;
            elements.errorMessage.classList.remove('hidden');
        }
    }

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

    elements.copyButton.addEventListener("click", () => {
        const urlToCopy = elements.generatedUrlInput.value;
        navigator.clipboard.writeText(urlToCopy).then(() => {
            elements.copyIcon.classList.add('hidden');
            elements.checkIcon.classList.remove('hidden');
            setTimeout(() => {
                elements.copyIcon.classList.remove('hidden');
                elements.checkIcon.classList.add('hidden');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy URL: ', err);
            alert('Failed to copy URL. Please try again.');
        });
    });

    elements.form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const file = elements.input.files[0];
        const style = elements.styleSelect.value;
        const size = elements.sizeSelect.value;
        const styleText = elements.styleSelect.options[elements.styleSelect.selectedIndex].text;

        if (!file) {
            console.error("Please select an image file first.");
            return;
        }
        
        const originalImageUrl = URL.createObjectURL(file);
        
        showGenerationLoading(true, styleText);
        showResultState(true); 
        elements.originalImage.src = originalImageUrl;
        elements.resultStyleTitle.textContent = `${styleText} Style`;
        
        let progress = 0;
        const { generationProgressBar } = elements;
        const totalDuration = 120000; 
        const targetProgress = 95; 
        const updateInterval = 250; 
        const steps = totalDuration / updateInterval;
        const increment = targetProgress / steps;
        
        const progressInterval = setInterval(() => {
            progress += increment;
            if (progress >= targetProgress) {
                progress = targetProgress;
                clearInterval(progressInterval);
            }
            generationProgressBar.value = progress;
        }, updateInterval);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('style', style);
            formData.append('size', size);

            const response = await axios.post('/generate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const result = response.data;
            
            if (result.imageUrl) {
                const proxiedUrl = result.imageUrl;
                const absoluteUrl = window.location.origin + proxiedUrl;
                
                elements.generatedImage.onload = () => {
                    elements.resultSpinner.style.display = 'none';
                    elements.generatedImage.classList.remove('hidden');
                    elements.resultActionsContainer.classList.remove('hidden');
                };
                elements.generatedImage.onerror = () => {
                    showResultState(false, "Failed to load the generated image.");
                };

                elements.generatedImage.src = proxiedUrl;
                elements.downloadButton.href = proxiedUrl;
                elements.generatedUrlInput.value = absoluteUrl;

                saveToHistory(proxiedUrl, styleText);
                renderHistory();
                
            } else {
                throw new Error(result.error || "Invalid response from server.");
            }

        } catch (error) {
            console.error('Generation failed:', error);
            const serverError = error.response?.data?.error || error.message;
            const friendlyError = `Generation failed: ${serverError}`;
            showResultState(false, friendlyError);
        } finally {
            clearInterval(progressInterval);
            generationProgressBar.value = 100;
            setTimeout(() => {
                showGenerationLoading(false);
            }, 500); 
        }
    });

    const showWarning = (e) => {
        e.preventDefault();
        elements.warningModal.showModal();
        elements.warningSound.play().catch(error => {
            console.log("Playback sound prevented by browser.", error);
        });
    };

    document.addEventListener('contextmenu', showWarning);
    let touchTimer;
    document.addEventListener('touchstart', (e) => {
        touchTimer = setTimeout(() => showWarning(e), 1000);
    });
    document.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
    });
    document.addEventListener('touchmove', () => {
        clearTimeout(touchTimer);
    });

    elements.warningModal.addEventListener('close', () => {
        elements.warningSound.pause();
        elements.warningSound.currentTime = 0;
    });
    
    const initApp = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        elements.themeToggle.checked = savedTheme === 'dark';
        applyTheme(savedTheme);
        renderHistory();

        const { loadingOverlay, loadingTitle, loadingSubtitle, generationProgressContainer } = elements;
        loadingTitle.textContent = "Memuat...";
        loadingSubtitle.textContent = "Harap tunggu sebentar.";
        generationProgressContainer.classList.add('hidden');
        
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500);
    };

    initApp();
});
