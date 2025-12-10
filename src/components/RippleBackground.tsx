"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import Sketch to avoid SSR issues
const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
    ssr: false,
});

const RippleBackground = () => {
    let cols: number, rows: number;
    const scale = 3; // sim resolution (small = finer simulation) = 3
    const damping = 0.995;

    let prev: number[][] = [];
    let curr: number[][] = [];
    let next: number[][] = [];

    let obstacle: boolean[][] = [];
    let pg: any;

    // Ripple rate limiting
    let lastWaveTime = 0;
    const waveCooldown = 333; // 3 waves/sec

    // Draw spacing (8px grid in original, user said 8px grid but diff code has spacing=2?)
    // User comment: // Draw spacing (8px grid) but let spacing = 2;
    const spacing = 2;

    const setup = (p5: any, canvasParentRef: Element) => {
        // Use window dimensions or a fixed size if preferred
        // The user provided let w = 1200; let h = 800;
        // But for a background, full window is usually better.
        // However, to stick closer to user rendering logic which might depend on fixed size:
        // I will try to use window size to fill the header/hero area.
        const w = p5.windowWidth;
        const h = p5.windowHeight;

        p5.createCanvas(w, h).parent(canvasParentRef);
        p5.pixelDensity(1);

        cols = p5.floor(w / scale);
        rows = p5.floor(h / scale);

        // init buffers
        prev = [];
        curr = [];
        next = [];
        obstacle = [];

        for (let x = 0; x < cols; x++) {
            prev[x] = [];
            curr[x] = [];
            next[x] = [];
            obstacle[x] = [];
            for (let y = 0; y < rows; y++) {
                prev[x][y] = 0;
                curr[x][y] = 0;
                next[x][y] = 0;
                obstacle[x][y] = false;
            }
        }

        // ---- RENDER MEMSURF MASK ----
        pg = p5.createGraphics(cols, rows);
        pg.pixelDensity(1);
        pg.background(0);
        pg.fill(255);
        pg.textAlign(p5.CENTER, p5.CENTER);
        pg.textFont("Helvetica");
        // Scale text size based on rows usually, but need to make sure it fits.
        // User used: pg.textSize(rows * 0.30);
        pg.textSize(rows * 0.30);
        pg.text("MEMSURF", cols / 2, rows / 2);
        pg.loadPixels();

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                let idx = 4 * (y * cols + x);
                // p5.Graphics pixels might need to be accessed differently depending on version,
                // but typically it interacts with the underlying pixels array.
                // pg.pixels is a flat array.
                obstacle[x][y] = pg.pixels[idx] > 128; // white text pixels = solid
            }
        }

        p5.noSmooth();
    };

    const draw = (p5: any) => {
        p5.background(255); // WHITE background

        // ---- WAVE SIMULATION ----
        for (let x = 1; x < cols - 1; x++) {
            for (let y = 1; y < rows - 1; y++) {
                if (obstacle[x][y]) {
                    next[x][y] = 0; // text stays flat
                    continue;
                }

                let l = obstacle[x - 1][y] ? curr[x][y] : curr[x - 1][y];
                let r = obstacle[x + 1][y] ? curr[x][y] : curr[x + 1][y];
                let u = obstacle[x][y - 1] ? curr[x][y] : curr[x][y - 1];
                let d = obstacle[x][y + 1] ? curr[x][y] : curr[x][y + 1];

                next[x][y] = ((l + r + u + d) / 2 - prev[x][y]) * damping;
            }
        }

        // ---- MOUSE RIPPLE WITH RATE LIMIT ----
        // mouseX and mouseY are on the p5 object
        if (
            p5.mouseX > 0 &&
            p5.mouseX < p5.width &&
            p5.mouseY > 0 &&
            p5.mouseY < p5.height
        ) {
            let now = p5.millis();
            if (now - lastWaveTime >= waveCooldown) {
                let mx = p5.floor(p5.mouseX / scale);
                let my = p5.floor(p5.mouseY / scale);

                if (
                    mx > 1 &&
                    mx < cols - 1 &&
                    my > 1 &&
                    my < rows - 1 &&
                    !obstacle[mx][my]
                ) {
                    next[mx][my] = 150; // inject ripple
                    lastWaveTime = now;
                }
            }
        }

        // ---- DRAW ONLY OUTLINES, SPACED OUT ----
        p5.loadPixels();

        for (let x = 1; x < cols - 1; x++) {
            if (x % spacing !== 0) continue; // skip columns outside spacing

            for (let y = 1; y < rows - 1; y++) {
                if (y % spacing !== 0) continue; // skip rows outside spacing
                if (obstacle[x][y]) continue;

                let c = next[x][y];

                // gradient detection
                let g =
                    p5.abs(c - next[x - 1][y]) +
                    p5.abs(c - next[x + 1][y]) +
                    p5.abs(c - next[x][y - 1]) +
                    p5.abs(c - next[x][y + 1]);

                if (g > 10) {
                    let px = x * scale;
                    let py = y * scale;

                    // Need to fill a block of pixels because of scaling?
                    // User code iterates x, y in simulation grid (scaled down)
                    // But writes to canvas pixels (full resolution).
                    // If scale = 3, one sim pixel = 3x3 screen pixels.
                    // The user logic:
                    // let idx = 4 * (py * width + px);
                    // This only sets one pixel at the top-left of the 3x3 block.
                    // Is that intended? The user code said:
                    // let px = x * scale; let py = y * scale; ... pixels[idx] = ...
                    // If the user wants a grid of POINTS, this is fine.
                    // "Draw spacing (8px grid)" and "spacing = 2" with "scale = 3" -> 2*3 = 6px actual spacing.
                    // I will stick to the user's exact rendering logic.

                    let idx = 4 * (py * p5.width + px);

                    // Ensure we are within bounds
                    if (idx < p5.pixels.length && idx >= 0) {
                        p5.pixels[idx] = 128; // R
                        p5.pixels[idx + 1] = 0; // G
                        p5.pixels[idx + 2] = 255; // B
                        p5.pixels[idx + 3] = 255; // A
                    }
                }
            }
        }

        p5.updatePixels();

        // ---- BUFFER ROTATION ----
        let tmp = prev;
        prev = curr;
        curr = next;
        next = tmp;
    };

    const windowResized = (p5: any) => {
        // Optional: Handle resize
        // p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        // Re-initializing buffers would be needed if we resize strictly
        // For now, simpler to just let it be or reload. A proper resize handles buffer resizing.
        // Given the complexity of state preservation, I'll skip complex resize logic for this first pass
        // or just trigger specific resize logic.
        const w = p5.windowWidth;
        const h = p5.windowHeight;
        p5.resizeCanvas(w, h);
        cols = p5.floor(w / scale);
        rows = p5.floor(h / scale);
        // We would need to re-init arrays, which wipes the current state.
        // That's acceptable for a resize.
        for (let x = 0; x < cols; x++) {
            if (!prev[x]) { prev[x] = []; curr[x] = []; next[x] = []; obstacle[x] = []; }
            for (let y = 0; y < rows; y++) {
                // Safe reset or preserve if possible, but resizing arrays is tricky.
                // Easiest is to just re-setup portions.
                // Re-running setup logic:
                prev[x][y] = 0;
                curr[x][y] = 0;
                next[x][y] = 0;
                obstacle[x][y] = false;
            }
        }
        // Re-create graphics mask
        pg = p5.createGraphics(cols, rows);
        pg.pixelDensity(1);
        pg.background(0);
        pg.fill(255);
        pg.textAlign(p5.CENTER, p5.CENTER);
        pg.textFont("Helvetica");
        pg.textSize(rows * 0.30);
        pg.text("MEMSURF", cols / 2, rows / 2);
        pg.loadPixels();
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                let idx = 4 * (y * cols + x);
                obstacle[x][y] = pg.pixels[idx] > 128;
            }
        }
    };

    return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default RippleBackground;
