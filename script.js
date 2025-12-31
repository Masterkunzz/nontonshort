const container = document.getElementById('app');
let videoFilesList = []; 
let lastPlayedFile = ""; 

// Fungsi merapikan nama file jadi judul
function formatTitle(filename) {
    return filename.replace(/\.(mp4|webm|mov)$/i, '').replace(/_/g, ' ');
}

// 1. LOAD DAFTAR VIDEO DARI JSON
async function loadVideoList() {
    try {
        const response = await fetch('videos.json');
        if (!response.ok) throw new Error("Gagal baca JSON");
        videoFilesList = await response.json();
        
        // Mulai aplikasi setelah data siap
        initApp();
    } catch (error) {
        console.error(error);
        alert("Error: Pastikan file videos.json ada dan formatnya benar!");
    }
}

// 2. PILIH VIDEO ACAK (ANTI KEMBAR)
function getRandomVideoFile() {
    if (videoFilesList.length === 0) return null;

    let randomFile;
    // Jika video lebih dari 1, hindari memutar video yang sama berurutan
    if (videoFilesList.length > 1) {
        do {
            randomFile = videoFilesList[Math.floor(Math.random() * videoFilesList.length)];
        } while (randomFile === lastPlayedFile);
    } else {
        randomFile = videoFilesList[0];
    }
    lastPlayedFile = randomFile;
    return randomFile;
}

// 3. GENERATE KARTU VIDEO KE LAYAR
function addVideoToDOM() {
    const file = getRandomVideoFile();
    if (!file) return;

    const title = formatTitle(file);
    const likes = (Math.random() * 50).toFixed(1) + 'RB'; // Like palsu

    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'video-card';
    
    // HTML Structure
    videoWrapper.innerHTML = `
        <video src="videos/${file}" loop playsinline></video>
        <span class="material-icons play-icon-overlay">play_arrow</span>
        
        <div class="overlay">
            <div class="actions">
                <div class="action-item"><span class="material-icons">thumb_up</span><span class="count">${likes}</span></div>
                <div class="action-item"><span class="material-icons">thumb_down</span><span class="count">Dislike</span></div>
                <div class="action-item"><span class="material-icons">comment</span><span class="count">1.2RB</span></div>
                <div class="action-item"><span class="material-icons">share</span><span class="count">Share</span></div>
            </div>
            <div class="video-info">
                <div class="username"><div class="avatar"></div>@TontonanAdek</div>
                <div class="title">${title}</div>
            </div>
        </div>
    `;

    container.appendChild(videoWrapper);
    const videoElement = videoWrapper.querySelector('video');

    // Event Klik untuk Pause/Play
    videoElement.addEventListener('click', togglePlayPause);

    // Masukkan ke pengawas scroll
    observer.observe(videoElement);
}

// 4. LOGIKA KLIK PAUSE / PLAY
function togglePlayPause(e) {
    const video = e.target;
    const card = video.closest('.video-card');

    if (video.paused) {
        video.play();
        card.classList.remove('paused'); // Ikon sembunyi
    } else {
        video.pause();
        card.classList.add('paused'); // Ikon muncul
    }
}

// 5. OBSERVER (SCROLL AUTO PLAY & INFINITY)
const observerOptions = {
    root: container,
    threshold: 0.6 // Video play jika 60% terlihat
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        const card = video.closest('.video-card');

        if (entry.isIntersecting) {
            // Play video saat masuk layar
            video.currentTime = 0;
            card.classList.remove('paused'); // Reset ikon pause
            video.play();

            // LOGIKA INFINITY: Jika ini video terakhir, tambah baru di bawah
            if (card === container.lastElementChild) {
                addVideoToDOM(); 
            }
        } else {
            // Pause video saat keluar layar
            video.pause();
            card.classList.remove('paused');
        }
    });
}, observerOptions);

// Init awal
function initApp() {
    addVideoToDOM();
    addVideoToDOM();
}

// Load JSON saat web dibuka
loadVideoList();

// Tombol Start (Supaya fullscreen & audio jalan)
function startApp() {
    document.getElementById('start-overlay').style.display = 'none';
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();

    const firstVideo = document.querySelector('video');
    if (firstVideo) firstVideo.play();
}

// Blokir klik kanan
document.addEventListener('contextmenu', event => event.preventDefault());