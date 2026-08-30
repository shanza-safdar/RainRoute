// ============================================================
// RAINROUTE — HEADER RAIN ANIMATION
// ============================================================
// Lightweight canvas rain effect that runs behind the header
// brand text. Fully self-contained: it only touches the
// #rainCanvas element and never reads/writes any of the
// routing, flood-zone, or citizen-report state in script.js.
// ============================================================

(function () {

    const canvas = document.getElementById("rainCanvas");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    let width = 0;
    let height = 0;
    let drops = [];


    // --------------------------------------------------------
    // SIZE CANVAS TO THE FULL WINDOW
    // --------------------------------------------------------

    function resizeCanvas() {

        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

    }


    // --------------------------------------------------------
    // HOW MANY DROPS FOR THE CURRENT SCREEN SIZE
    // --------------------------------------------------------
    // Scales with viewport area so the rain reads as roughly
    // the same density on a phone as on a wide desktop window.

    function computeDropCount() {

        const area = width * height;

        return Math.min(
            320,
            Math.max(
                100,
                Math.round(area / 9000)
            )
        );

    }


    // --------------------------------------------------------
    // CREATE ONE RAINDROP STREAK
    // --------------------------------------------------------

    function createDrop() {

        return {

            x: Math.random() * width,

            y: Math.random() * height,

            length: 10 + Math.random() * 18,

            speed: 4 + Math.random() * 6,

            opacity: 0.15 + Math.random() * 0.35

        };

    }


    function initDrops() {

        drops = [];

        const dropCount = computeDropCount();

        for (
            let i = 0;
            i < dropCount;
            i++
        ) {

            drops.push(
                createDrop()
            );

        }

    }


    // --------------------------------------------------------
    // DRAW ONE FRAME OF DROPS AT THEIR CURRENT POSITIONS
    // --------------------------------------------------------

    function drawDrops() {

        ctx.clearRect(
            0, 0, width, height
        );

        drops.forEach(
            drop => {

                ctx.strokeStyle =
                    `rgba(180, 210, 235, ${drop.opacity})`;

                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - 2, drop.y + drop.length);
                ctx.stroke();

            }
        );

    }


    // --------------------------------------------------------
    // ANIMATION LOOP
    // --------------------------------------------------------

    function animate() {

        drawDrops();

        drops.forEach(
            drop => {

                drop.y += drop.speed;
                drop.x -= 0.4;

                if (drop.y > height) {

                    drop.y = -drop.length;
                    drop.x = Math.random() * width;

                }

            }
        );

        requestAnimationFrame(animate);

    }


    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    resizeCanvas();
    initDrops();

    if (prefersReducedMotion) {

        // Respect reduced-motion preference: draw a single
        // static frame instead of an ongoing animation loop.
        drawDrops();

    } else {

        animate();

    }


    window.addEventListener(
        "resize",
        function () {

            resizeCanvas();
            initDrops();

        }
    );

})();