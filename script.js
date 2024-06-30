const app = {
    surahList: document.getElementById('surahList'),
    surahContent: document.getElementById('surahContent'),
    surahTitle: document.getElementById('surahTitle'),
    verses: document.getElementById('verses'),
    backToMenu: document.getElementById('backToMenu'),
    audioElement: new Audio(),
    init: function() {
        this.loadSurahs();
        this.backToMenu.addEventListener('click', () => this.showMainMenu());
    },
    loadSurahs: async function() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await response.json();
            this.displaySurahs(data.data);
        } catch (error) {
            console.error('Error fetching surahs:', error);
        }
    },
    displaySurahs: function(surahs) {
        this.surahList.innerHTML = surahs.map(surah => `
            <div class="surah-item" data-number="${surah.number}">
                <div class="surah-number">${surah.number}</div>
                <div class="surah-name">${surah.name}</div>
                <div class="surah-name-english">${surah.englishName}</div>
                <div class="surah-name-translation">${surah.englishNameTranslation}</div>
            </div>
        `).join('');
        this.surahList.addEventListener('click', (e) => {
            const surahItem = e.target.closest('.surah-item');
            if (surahItem) {
                const surahNumber = surahItem.dataset.number;
                this.loadSurah(surahNumber);
            }
        });
    },
    loadSurah: async function(number) {
        try {
            const [arabicResponse, translationResponse, audioResponse] = await Promise.all([
                fetch(`https://api.alquran.cloud/v1/surah/${number}`),
                fetch(`https://api.alquran.cloud/v1/surah/${number}/en.sahih`),
                fetch(`https://api.alquran.cloud/v1/surah/${number}/ar.alafasy`)
            ]);
            const arabicData = await arabicResponse.json();
            const translationData = await translationResponse.json();
            const audioData = await audioResponse.json();
            this.displaySurah(arabicData.data, translationData.data, audioData.data);
        } catch (error) {
            console.error('Error fetching surah:', error);
        }
    },
    displaySurah: function(arabicSurah, translationSurah, audioSurah) {
        this.surahList.classList.add('hidden');
        this.surahContent.classList.remove('hidden');
        this.backToMenu.classList.remove('hidden');
        this.surahTitle.innerHTML = `
            <div>${arabicSurah.number}. ${arabicSurah.name}</div>
            <div>${arabicSurah.englishName} (${arabicSurah.englishNameTranslation})</div>
        `;
        this.verses.innerHTML = arabicSurah.ayahs.map((ayah, index) => `
            <div class="verse">
                <div class="verse-number">${ayah.numberInSurah}</div>
                <div class="verse-translation">${translationSurah.ayahs[index].text}</div>
                <div class="verse-text">${ayah.text}</div>
                <button class="play-button" data-audio="${audioSurah.ayahs[index].audio}">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `).join('');
        this.setupAudioButtons();
    },
    setupAudioButtons: function() {
        this.verses.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const audioSrc = e.currentTarget.dataset.audio;
                this.playAudio(audioSrc, e.currentTarget);
            });
        });
    },
    playAudio: function(src, button) {
        if (this.audioElement.src !== src) {
            this.audioElement.src = src;
        }
        if (this.audioElement.paused) {
            this.audioElement.play();
            button.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.audioElement.pause();
            button.innerHTML = '<i class="fas fa-play"></i>';
        }
        this.audioElement.onended = () => {
            button.innerHTML = '<i class="fas fa-play"></i>';
        };
    },
    showMainMenu: function() {
        this.surahContent.classList.add('hidden');
        this.surahList.classList.remove('hidden');
        this.backToMenu.classList.add('hidden');
        this.audioElement.pause();
    }
};
app.init();