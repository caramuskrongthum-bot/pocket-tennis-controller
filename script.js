/* =========================================================
   ELEMENTS
========================================================= */

const videoBgIframe =
    document.getElementById('videoBgIframe');

const videoBgThumbnail =
    document.getElementById('videoBgThumbnail');

const videoBgBlack =
    document.getElementById('videoBgBlack');


const cards =
    document.querySelectorAll('.game-card');

const gameNavigation = document.getElementById('gameNavigation');
const gamePreviewIframe = document.getElementById('gamePreviewIframe');
const gamePreviewEmpty = document.getElementById('gamePreviewEmpty');

let previewLoadTimer = null;


let currentIndex = 0;

let scrollAccumulator = 0;

const threshold = 60;

let videoLoadTimer = null;

cards.forEach((card, index) => {
    const title = card.querySelector('.game-title')?.textContent.trim() || `Game ${index + 1}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.title = title;
    button.setAttribute('aria-label', `Show ${title}`);
    const thumbnail = card.querySelector('.game-thumb img');
    if (thumbnail) {
        const image = document.createElement('img');
        image.src = thumbnail.src;
        image.alt = title;
        button.appendChild(image);
    } else {
        button.textContent = title;
    }
    button.addEventListener('click', () => {
        currentIndex = index;
        updateCards();
    });
    gameNavigation.appendChild(button);
});



/* =========================================================
   GET YOUTUBE ID
========================================================= */

function getYouTubeId(url) {

    if (!url) return '';

    const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
    );

    return match ? match[1] : '';
}



/* =========================================================
   GET CURRENT GAME THUMBNAIL
========================================================= */

function getCurrentThumbnail(card) {

    if (!card) return '';

    const image =
        card.querySelector('.game-thumb img');

    if (image && image.src) {
        return image.src;
    }

    return '';
}



/* =========================================================
   UPDATE BACKGROUND
   
   Flow:
   
   Thumbnail
       ↓
   YouTube Video
   
   ถ้าไม่มี Video:
   
   Thumbnail อยู่ต่อ
========================================================= */

function updateVideoBackground() {

    const card =
        cards[currentIndex];

    if (!card) return;


    /* -----------------------------------------------------
       Cancel previous video timer
    ----------------------------------------------------- */

    clearTimeout(videoLoadTimer);


    /* -----------------------------------------------------
       Get Thumbnail
    ----------------------------------------------------- */

    const thumbnailURL =
        getCurrentThumbnail(card);


    /* -----------------------------------------------------
       Show Thumbnail
    ----------------------------------------------------- */

    if (thumbnailURL) {

        videoBgThumbnail.style.backgroundImage =
            `url("${thumbnailURL}")`;

        videoBgThumbnail.style.opacity = '1';

        videoBgBlack.style.opacity = '0';

    } else {

        videoBgThumbnail.style.backgroundImage =
            'none';

        videoBgThumbnail.style.opacity = '0';

        videoBgBlack.style.opacity = '1';
    }


    /* -----------------------------------------------------
       Get Video
    ----------------------------------------------------- */

    const videoUrl =
        card.dataset.video || '';

    const videoId =
        getYouTubeId(videoUrl);


    /* -----------------------------------------------------
       No Video
       
       Thumbnail จะอยู่ด้านหลังต่อ
    ----------------------------------------------------- */

    if (!videoId) {

        videoBgIframe.style.opacity = '0';

        videoLoadTimer = setTimeout(() => {

            if (cards[currentIndex] === card) {
                videoBgIframe.src = '';
            }

        }, 700);

        return;
    }


    /* -----------------------------------------------------
       Video Exists
       
       ซ่อน Video ก่อน
       เพื่อให้ Thumbnail ยังเห็นอยู่
    ----------------------------------------------------- */

    videoBgIframe.style.opacity = '0';


    /* -----------------------------------------------------
       YouTube Embed URL
    ----------------------------------------------------- */

    const embedUrl =
        `https://www.youtube.com/embed/${videoId}` +
        `?autoplay=1` +
        `&mute=1` +
        `&loop=1` +
        `&playlist=${videoId}` +
        `&controls=0` +
        `&rel=0` +
        `&modestbranding=1` +
        `&playsinline=1`;


    /* -----------------------------------------------------
       Load Video
    ----------------------------------------------------- */

    videoBgIframe.src =
        embedUrl;


    /* -----------------------------------------------------
       Fade Video over Thumbnail
    ----------------------------------------------------- */

    videoLoadTimer = setTimeout(() => {

        if (cards[currentIndex] === card) {

            videoBgIframe.style.opacity = '1';

        }

    }, 900);

}



/* =========================================================
   UPDATE GAME PREVIEW (side panel)

   ใช้ data-video ของ card เดียวกับ background
   ถ้าไม่มี video → โชว์ "No preview video"
========================================================= */

function updateGamePreview() {

    if (!gamePreviewIframe) return;

    const card =
        cards[currentIndex];

    if (!card) return;


    clearTimeout(previewLoadTimer);

    const videoUrl =
        card.dataset.video || '';

    const videoId =
        getYouTubeId(videoUrl);


    /* -----------------------------------------------------
       No Video → show empty state
    ----------------------------------------------------- */

    if (!videoId) {

        gamePreviewIframe.classList.remove('visible');

        gamePreviewEmpty?.classList.remove('hidden');

        previewLoadTimer = setTimeout(() => {

            if (cards[currentIndex] === card) {
                gamePreviewIframe.src = '';
            }

        }, 400);

        return;
    }


    /* -----------------------------------------------------
       Video Exists → load embed, fade in
    ----------------------------------------------------- */

    gamePreviewIframe.classList.remove('visible');

    const embedUrl =
        `https://www.youtube.com/embed/${videoId}` +
        `?autoplay=1` +
        `&mute=1` +
        `&loop=1` +
        `&playlist=${videoId}` +
        `&controls=0` +
        `&rel=0` +
        `&modestbranding=1` +
        `&playsinline=1`;

    gamePreviewIframe.src =
        embedUrl;

    previewLoadTimer = setTimeout(() => {

        if (cards[currentIndex] === card) {

            gamePreviewIframe.classList.add('visible');

            gamePreviewEmpty?.classList.add('hidden');

        }

    }, 500);

}



/* =========================================================
   UPDATE CARDS
========================================================= */

function updateCards() {

    gameNavigation.querySelectorAll('button').forEach((button, index) => {
        button.classList.toggle('active', index === currentIndex);
        if (index === currentIndex) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
    });

    updateGamePreview();

    cards.forEach((card, index) => {

        const offset =
            index - currentIndex;


        /* -------------------------------------------------
           CURRENT CARD
        ------------------------------------------------- */

        if (offset === 0) {

            card.style.transform =
                'translateY(0) scale(1) rotate(0deg)';

            card.style.opacity =
                '1';

            card.style.filter =
                'blur(0px)';

            card.style.pointerEvents =
                'auto';
        }


        /* -------------------------------------------------
           CARDS BELOW
        ------------------------------------------------- */

        else if (offset > 0) {

            card.style.transform =
                `translateY(${offset * 30}px) ` +
                `scale(${1 - offset * 0.05}) ` +
                `rotate(${offset * 2}deg)`;

            card.style.opacity =
                `${Math.max(
                    1 - offset * 0.3,
                    0
                )}`;

            card.style.filter =
                `blur(${offset * 2}px)`;

            card.style.pointerEvents =
                'none';
        }


        /* -------------------------------------------------
           CARDS ABOVE
        ------------------------------------------------- */

        else {

            card.style.transform =
                `translateY(${offset * 150}px) ` +
                `scale(1.1) ` +
                `rotate(${offset * 10}deg)`;

            card.style.opacity =
                '0';

            card.style.filter =
                'blur(5px)';

            card.style.pointerEvents =
                'none';
        }

    });


    /* -----------------------------------------------------
       Update Background
    ----------------------------------------------------- */

    updateVideoBackground();

}



/* =========================================================
   MOUSE WHEEL
========================================================= */

window.addEventListener(
    'wheel',
    (e) => {

        scrollAccumulator +=
            e.deltaY;


        /* -------------------------------------------------
           SCROLL DOWN
        ------------------------------------------------- */

        if (
            scrollAccumulator >= threshold
        ) {

            if (
                currentIndex <
                cards.length - 1
            ) {

                currentIndex++;

            }

            scrollAccumulator = 0;

            updateCards();
        }


        /* -------------------------------------------------
           SCROLL UP
        ------------------------------------------------- */

        else if (
            scrollAccumulator <= -threshold
        ) {

            if (
                currentIndex > 0
            ) {

                currentIndex--;

            }

            scrollAccumulator = 0;

            updateCards();
        }

    },
    {
        passive: true
    }
);



/* =========================================================
   SNAP SYSTEM
========================================================= */

let snapTimeout;


window.addEventListener(
    'wheel',
    () => {

        clearTimeout(
            snapTimeout
        );


        snapTimeout =
            setTimeout(() => {

                scrollAccumulator = 0;

            }, 150);

    },
    {
        passive: true
    }
);



/* =========================================================
   INITIALIZE
========================================================= */

updateCards();
