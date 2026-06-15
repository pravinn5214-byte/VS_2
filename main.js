// main.js
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");
const loadingOverlay = document.getElementById("loading-overlay");

const processCanvas = document.getElementById("process-canvas");
const processCtx = processCanvas ? processCanvas.getContext("2d") : null;
const processLoadingOverlay = document.getElementById("process-loading-overlay");

const frameCount = 144;
const images = [];
let imagesLoaded = 0;

const processFrameCount = 144;
const processImages = [];
let processImagesLoaded = 0;

// Current frame that is drawn on the canvas
let currentFrame = frameCount;
// Current frame that is calculated based on scroll
let targetFrame = frameCount;
// Current frame that is actually being rendered (as a float for smoothing)
let currentRenderedFrame = frameCount;
// Keep track of what we actually drew to avoid redundant draws
let lastDrawnFrame = frameCount;

let targetProcessFrame = 1;
let currentRenderedProcessFrame = 1;
let lastDrawnProcessFrame = 1;

// Lerp helper function
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Configuration
// Determines how we fit the image in the canvas. 
// We want an 'object-fit: cover' style behavior to fill the background.
function drawImageCover(img) {
  // Crop right 15% and bottom 10% from the source image to hide the watermark
  const sWidth = img.width * 0.85;
  const sHeight = img.height * 0.90;
  const sx = 0;
  const sy = 0;

  const canvasRatio = canvas.width / canvas.height;
  const imgRatio = sWidth / sHeight;
  let renderWidth, renderHeight, x, y;

  if (imgRatio > canvasRatio) {
    // Image is wider than canvas, match height and crop sides
    renderHeight = canvas.height;
    renderWidth = canvas.height * imgRatio;
    y = 0;
    x = (canvas.width - renderWidth) / 2;
  } else {
    // Image is taller than canvas, match width and crop top/bottom
    renderWidth = canvas.width;
    renderHeight = canvas.width / imgRatio;
    x = 0;
    y = (canvas.height - renderHeight) / 2;
  }

  // Clear canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, renderWidth, renderHeight);
}

function drawProcessImageCover(img) {
  if (!processCanvas || !processCtx) return;

  // Crop right 15% and bottom 10% from the source image to hide the watermark
  const sWidth = img.width * 0.85;
  const sHeight = img.height * 0.90;
  const sx = 0;
  const sy = 0;

  const canvasRatio = processCanvas.width / processCanvas.height;
  const imgRatio = sWidth / sHeight;
  let renderWidth, renderHeight, x, y;

  if (imgRatio > canvasRatio) {
    renderHeight = processCanvas.height;
    renderWidth = processCanvas.height * imgRatio;
    y = 0;
    x = (processCanvas.width - renderWidth) / 2;
  } else {
    renderWidth = processCanvas.width;
    renderHeight = processCanvas.width / imgRatio;
    x = 0;
    y = (processCanvas.height - renderHeight) / 2;
  }

  processCtx.clearRect(0, 0, processCanvas.width, processCanvas.height);
  processCtx.drawImage(img, sx, sy, sWidth, sHeight, x, y, renderWidth, renderHeight);
}

// Ensure the canvas matches its display size
function resizeCanvas() {
  const container = canvas.parentElement;
  if (!container) return;
  const cssWidth = container.clientWidth;
  const cssHeight = container.clientHeight;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // Redraw current frame on resize
  if (images[lastDrawnFrame]) {
    drawImageCover(images[lastDrawnFrame]);
  }

  if (processCanvas) {
    const pContainer = processCanvas.parentElement;
    if (pContainer) {
      processCanvas.width = pContainer.clientWidth * dpr;
      processCanvas.height = pContainer.clientHeight * dpr;
      if (processImages[lastDrawnProcessFrame]) {
        drawProcessImageCover(processImages[lastDrawnProcessFrame]);
      }
    }
  }
}

// Preload all frames
function preloadImages() {
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    const paddedIndex = i.toString().padStart(3, '0');
    img.src = `/pleasent home page-png-split/ezgif-frame-${paddedIndex}.png`;
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === frameCount) {
        initAnimation();
      }
    };
    img.onerror = () => {
      console.error(`Failed to load frame ${i}`);
      imagesLoaded++;
      if (imagesLoaded === frameCount) {
        initAnimation();
      }
    };
    images[i] = img;
  }
}

// Preload process frames
function preloadProcessImages() {
  for (let i = 1; i <= processFrameCount; i++) {
    const img = new Image();
    const paddedIndex = i.toString().padStart(3, '0');
    img.src = `/6- replacement-png-split/ezgif-frame-${paddedIndex}.png`;
    img.onload = () => {
      processImagesLoaded++;
      if (processImagesLoaded === processFrameCount && processLoadingOverlay) {
        processLoadingOverlay.style.opacity = "0";
        setTimeout(() => {
          processLoadingOverlay.style.display = "none";
        }, 500);
      }
    };
    img.onerror = () => {
      console.error(`Failed to load process frame ${i}`);
      processImagesLoaded++;
    };
    processImages[i] = img;
  }
}

// Initialize the scroll-linked animation
function initAnimation() {
  // Hide loading overlay
  loadingOverlay.style.opacity = "0";
  setTimeout(() => {
    loadingOverlay.style.display = "none";
  }, 500);

  // Set up the intro video elements
  const introContainer = document.getElementById("intro-container");
  const introVideo = document.getElementById("intro-video");
  const skipButton = document.getElementById("skip-intro");

  let introTransitioned = false;

  function transitionToHero() {
    if (introTransitioned) return;
    introTransitioned = true;

    // Pause video if skipping
    introVideo.pause();

    // Transition overlay out
    introContainer.classList.add("fade-out");

    setTimeout(() => {
      introContainer.style.display = "none";
      document.body.classList.remove("intro-active");

      const scrollWrapper = document.querySelector(".hero-scroll-wrapper");
      scrollWrapper.classList.add("loaded");

      // Initial canvas sizing and draw
      resizeCanvas();

      // Start scroll and resize listeners
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", resizeCanvas);

      // Trigger initial scroll calculations
      handleScroll();
    }, 1200); // Wait for CSS transition
  }

  // When video ends, automatically transition
  introVideo.addEventListener("ended", transitionToHero);

  // Skip button click
  skipButton.addEventListener("click", transitionToHero);

  // Also transition if video fails to load or play
  introVideo.addEventListener("error", transitionToHero);

  // Start the continuous render loop
  requestAnimationFrame(renderLoop);
}

// Render Loop for Fluidity (easing scroll frames)
function renderLoop() {
  // Lerp factor adjusted to 0.15 for better tracking of the smaller frame pool
  currentRenderedFrame = lerp(currentRenderedFrame, targetFrame, 0.15);
  const frameToDraw = Math.round(currentRenderedFrame);

  if (frameToDraw !== lastDrawnFrame && frameToDraw >= 1 && frameToDraw <= frameCount) {
    if (images[frameToDraw] && images[frameToDraw].complete) {
      drawImageCover(images[frameToDraw]);
    }
    lastDrawnFrame = frameToDraw;
  }

  requestAnimationFrame(renderLoop);
}

// // frameProgress counts DOWN from frameCount→1 as user scrolls down
// 0 is not used; range is [1, frameCount]. Start at frameCount = frame 180.
let frameProgress = frameCount;
let touchStartY = 0;

// Intercept wheel/scroll to lock screen until animation completes
window.addEventListener("wheel", (e) => {
  // Ignore scroll intercepts while intro video is playing
  if (document.body.classList.contains("intro-active")) {
    e.preventDefault();
    return;
  }

  // Only lock scroll at the top of the page
  if (window.scrollY <= 5) {
    if (e.deltaY > 0) {
      // Scrolling Down → advance animation 180→1 (frameProgress decreases)
      if (targetFrame > 1) {
        e.preventDefault();
        // Scroll step multiplier adjusted to 0.1 for smoother transition over 144 frames
        frameProgress = Math.max(1, frameProgress - e.deltaY * 0.1);
        targetFrame = Math.max(1, Math.min(frameCount, Math.round(frameProgress)));
      }
    } else if (e.deltaY < 0) {
      // Scrolling Up → reverse back toward frame 30
      if (targetFrame < frameCount) {
        e.preventDefault();
        // Scroll step multiplier adjusted to 0.1
        frameProgress = Math.min(frameCount, frameProgress + Math.abs(e.deltaY) * 0.1);
        targetFrame = Math.max(1, Math.min(frameCount, Math.round(frameProgress)));
      }
    }
  }
}, { passive: false });

// Intercept touch movement for mobile devices
window.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
});

window.addEventListener("touchmove", (e) => {
  if (document.body.classList.contains("intro-active")) {
    e.preventDefault();
    return;
  }

  if (window.scrollY <= 5) {
    const touchY = e.touches[0].clientY;
    const deltaY = touchStartY - touchY; // positive = swiping up = scroll down

    if (deltaY > 0) {
      // Swiping up → 30→1
      if (targetFrame > 1) {
        e.preventDefault();
        // Touch multiplier adjusted to 0.2
        frameProgress = Math.max(1, frameProgress - deltaY * 0.2);
        targetFrame = Math.max(1, Math.min(frameCount, Math.round(frameProgress)));
      }
    } else if (deltaY < 0) {
      // Swiping down → reverse back to 30
      if (targetFrame < frameCount) {
        e.preventDefault();
        // Touch multiplier adjusted to 0.2
        frameProgress = Math.min(frameCount, frameProgress + Math.abs(deltaY) * 0.2);
        targetFrame = Math.max(1, Math.min(frameCount, Math.round(frameProgress)));
      }
    }
    touchStartY = touchY;
  }
}, { passive: false });

// Raw scroll targets (set instantly on scroll)
const panelRawProgress = new Map();
// Smoothed display values (lerped toward raw in rAF loop)
const panelSmoothed = new Map();
// Track which panels have already had their children set up (one-time)
const panelChildrenInitialized = new Set();

// Background color transitions configuration
const transitionSections = [
  { id: "chapter-intro", rgb: { r: 6, g: 6, b: 6 } },
  { id: "chapter-about", rgb: { r: 15, g: 15, b: 18 } },
  { id: "chapter-services-sticky", rgb: { r: 15, g: 15, b: 18 } },
  { id: "chapter-process", rgb: { r: 252, g: 252, b: 252 } },
  { id: "chapter-portfolio", rgb: { r: 15, g: 18, b: 29 } },
  { id: "chapter-why-us", rgb: { r: 245, g: 246, b: 248 } },
  { id: "chapter-accreditations", rgb: { r: 32, g: 13, b: 20 } },
  { id: "chapter-contact-details", rgb: { r: 10, g: 10, b: 10 } },
  { id: "chapter-footer", rgb: { r: 3, g: 3, b: 3 } }
];
let currentBgColor = { r: 6, g: 6, b: 6 };

// Horizontal scrolling values
let targetHorizontalTranslate = 0;
let currentHorizontalTranslate = 0;

// Process scrolling values
let targetProcessProgress = 0;
let currentProcessProgress = 0;

// On scroll: only READ scroll position and store raw targets. No DOM writes here.
function handleScroll() {
  const panels = document.querySelectorAll(".story-panel, .footer-panel");
  const vh = window.innerHeight;

  panels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    const enterAt = vh * 0.92;
    const settleAt = vh * 0.08;
    let raw = (enterAt - rect.top) / (enterAt - settleAt);
    raw = Math.max(0, Math.min(1, raw));
    panelRawProgress.set(panel, raw);
  });

  // Calculate horizontal scroll progress for Chapter 4
  const horizContainer = document.getElementById("chapter-services-sticky");
  if (horizContainer) {
    const rect = horizContainer.getBoundingClientRect();
    const containerHeight = horizContainer.offsetHeight;
    const scrollableRange = containerHeight - vh;

    if (scrollableRange > 0) {
      // relative scroll position within the sticky zone: 0 to 1
      let progress = -rect.top / scrollableRange;
      progress = Math.max(0, Math.min(1, progress));

      // We want to translate the slides wrapper from 0 to -400vw
      const maxTranslateWidth = (window.innerWidth * 4); // 400vw (5 slides - 1)
      targetHorizontalTranslate = -progress * maxTranslateWidth;
    }
  }

  // Calculate process section scroll progress
  const processContainer = document.getElementById("chapter-process");
  if (processContainer) {
    const rect = processContainer.getBoundingClientRect();
    const containerHeight = processContainer.offsetHeight;
    const scrollableRange = containerHeight - vh;

    if (scrollableRange > 0) {
      let progress = -rect.top / scrollableRange;
      targetProcessProgress = Math.max(0, Math.min(1, progress));
    }
  }
}

// One-time setup: prepare children for animation (set initial invisible state)
function initPanelChildren(panel) {
  if (panelChildrenInitialized.has(panel)) return;
  panelChildrenInitialized.add(panel);

  const tag = panel.querySelector(".tag");
  const heading = panel.querySelector("h2");
  const items = panel.querySelectorAll("p, .service-item, .pillar-card, .timeline-step, .portfolio-item, .why-card, .infra-block, .footer-col");

  // Removed delay parameters so items update instantly on scroll rather than queuing up
  if (tag) {
    tag.style.transition = "opacity 0.4s ease, transform 0.4s ease-out";
  }
  if (heading) {
    heading.style.transition = "opacity 0.4s ease, transform 0.4s ease-out";
  }
  items.forEach((el) => {
    el.style.transition = "opacity 0.4s ease, transform 0.4s ease-out";
  });
}

// The single animation RAF loop — smoothly lerps all panels toward their targets
function panelAnimationLoop() {
  const panels = document.querySelectorAll(".story-panel, .footer-panel");

  panels.forEach((panel) => {
    initPanelChildren(panel);

    const raw = panelRawProgress.get(panel) || 0;
    const prev = panelSmoothed.get(panel) || 0;

    // Fast response lerp
    const lerpFactor = raw > prev ? 0.15 : 0.1;
    const smoothed = prev + (raw - prev) * lerpFactor;
    panelSmoothed.set(panel, smoothed);

    // Update CSS variable for 3D panel transform (CSS uses this)
    panel.style.setProperty("--section-progress", smoothed.toFixed(4));

    // Child element animation driven directly by smoothed value
    const childProgress = smoothed;

    const tag = panel.querySelector(".tag");
    const heading = panel.querySelector("h2");
    const items = panel.querySelectorAll("p, .service-item, .pillar-card, .timeline-step, .portfolio-item, .why-card, .infra-block, .footer-col");

    if (tag) {
      tag.style.opacity = childProgress;
      tag.style.transform = `translateY(${(1 - childProgress) * 12}px)`;
    }
    if (heading) {
      heading.style.opacity = childProgress;
      heading.style.transform = `translate3d(${(1 - childProgress) * -20}px, ${(1 - childProgress) * 12}px, 0)`;
    }
    items.forEach((el) => {
      // Direct opacity maps instantly to progress without delayed stagger loops
      el.style.opacity = childProgress;
      el.style.transform = `translateY(${(1 - childProgress) * 15}px)`;
    });
  });

  // Smoothly lerp horizontal scroll translate
  currentHorizontalTranslate = lerp(currentHorizontalTranslate, targetHorizontalTranslate, 0.05);
  const slidesWrapper = document.querySelector(".horizontal-slides-wrapper");
  if (slidesWrapper) {
    slidesWrapper.style.transform = `translate3d(${currentHorizontalTranslate}px, 0, 0)`;

    // Dynamically update individual slides or fade background text based on distance
    const slides = document.querySelectorAll(".horizontal-slide");
    const vw = window.innerWidth;
    slides.forEach((slide, idx) => {
      const slideStart = -idx * vw;
      const slideOffset = Math.abs(currentHorizontalTranslate - slideStart);
      const activeProgress = Math.max(0, 1 - (slideOffset / vw));

      // Let's dynamically shift background ghost text slightly
      const bgText = slide.querySelector(".slide-bg-text");
      if (bgText) {
        bgText.style.transform = `translate(-50%, -50%) translate3d(${(currentHorizontalTranslate - slideStart) * 0.15}px, 0, 0)`;
      }

      // Animate the background rhombus
      const rhombus = slide.querySelector(".slide-rhombus-bg");
      if (rhombus) {
        const rotation = 45 + (1 - activeProgress) * 90;
        const scale = 0.7 + activeProgress * 0.3;
        const skew = (1 - activeProgress) * 12;
        rhombus.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) skew(${skew}deg)`;
        rhombus.style.opacity = activeProgress;
      }

      // Morph the image frame polygon (rhombus transition)
      const imageFrame = slide.querySelector(".image-frame");
      if (imageFrame) {
        const skewOffset = (1 - activeProgress) * 20; // Skew percentage morph
        imageFrame.style.clipPath = `polygon(${12 + skewOffset}% 0%, 100% 0%, ${88 - skewOffset}% 100%, 0% 100%)`;
        imageFrame.style.transform = `scale(${0.85 + activeProgress * 0.15}) rotate(${(1 - activeProgress) * -5}deg)`;

        const img = imageFrame.querySelector("img");
        if (img) {
          // Counter parallax slide for depth
          img.style.transform = `scale(1.2) translate3d(${(1 - activeProgress) * -12}%, 0, 0)`;
        }
      }

      // Smooth content translation
      const contentLeft = slide.querySelector(".slide-content-left");
      const contentRight = slide.querySelector(".slide-content-right");
      const content = contentLeft || contentRight;
      if (content) {
        const slideDir = contentLeft ? -50 : 50;
        content.style.transform = `translateY(-50%) translate3d(${(1 - activeProgress) * slideDir}px, 0, 0)`;
        content.style.opacity = activeProgress;
      }
    });
  }

  // Process canvas scroll section animation
  currentProcessProgress = lerp(currentProcessProgress, targetProcessProgress, 0.04);

  targetProcessFrame = Math.max(1, Math.min(processFrameCount, Math.round(targetProcessProgress * (processFrameCount - 1) + 1)));
  currentRenderedProcessFrame = lerp(currentRenderedProcessFrame, targetProcessFrame, 0.15);
  const pFrameToDraw = Math.round(currentRenderedProcessFrame);

  if (pFrameToDraw !== lastDrawnProcessFrame && pFrameToDraw >= 1 && pFrameToDraw <= processFrameCount) {
    if (processImages[pFrameToDraw] && processImages[pFrameToDraw].complete) {
      drawProcessImageCover(processImages[pFrameToDraw]);
    }
    lastDrawnProcessFrame = pFrameToDraw;
  }

  const processTexts = document.querySelectorAll(".process-step-text");
  if (processTexts.length > 0) {
    const totalTexts = processTexts.length;
    processTexts.forEach((text, idx) => {
      const textStart = idx / totalTexts;
      const textEnd = (idx + 1) / totalTexts;
      const center = (textStart + textEnd) / 2;
      const distance = currentProcessProgress - center;
      const activeWindow = 1 / totalTexts;

      let normDist = distance / (activeWindow * 0.9);
      let absDist = Math.abs(normDist);

      // Create a plateau so the grid stays for a little time
      let opacity = 0;
      if (absDist < 0.3) {
        opacity = 1;
      } else if (absDist < 1.0) {
        opacity = 1 - (absDist - 0.3) / 0.7;
      }

      const dirY = distance > 0 ? 30 : -30;
      let translateY = -50 + normDist * dirY;

      text.style.opacity = opacity;
      text.style.transform = `translateY(${translateY}%)`;
      text.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
    });
  }

  // Calculate target background color based on section visibility in viewport
  let targetRgb = { r: 6, g: 6, b: 6 };
  let totalWeight = 0;
  let rSum = 0, gSum = 0, bSum = 0;
  const vh = window.innerHeight;

  transitionSections.forEach(sec => {
    const el = document.getElementById(sec.id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const bottom = Math.min(vh, rect.bottom);
      if (bottom > top) {
        const weight = bottom - top;
        rSum += sec.rgb.r * weight;
        gSum += sec.rgb.g * weight;
        bSum += sec.rgb.b * weight;
        totalWeight += weight;
      }
    }
  });

  if (totalWeight > 0) {
    targetRgb = {
      r: rSum / totalWeight,
      g: gSum / totalWeight,
      b: bSum / totalWeight
    };
  }

  // Smoothly lerp background color
  currentBgColor.r = lerp(currentBgColor.r, targetRgb.r, 0.08);
  currentBgColor.g = lerp(currentBgColor.g, targetRgb.g, 0.08);
  currentBgColor.b = lerp(currentBgColor.b, targetRgb.b, 0.08);

  document.body.style.backgroundColor = `rgb(${Math.round(currentBgColor.r)}, ${Math.round(currentBgColor.g)}, ${Math.round(currentBgColor.b)})`;

  requestAnimationFrame(panelAnimationLoop);
}

// Dynamically create background rhombus shapes for horizontal slides
document.querySelectorAll(".horizontal-slide").forEach(slide => {
  const rhombus = document.createElement("div");
  rhombus.className = "slide-rhombus-bg";
  slide.appendChild(rhombus);
});

// Interactive 3D Social Cube click toggle
const socialCube = document.querySelector(".social-cube");
if (socialCube) {
  socialCube.addEventListener("click", () => {
    socialCube.classList.toggle("pressed");
  });
}

// Start the dedicated panel animation loop once
panelAnimationLoop();

// Start the preloading process
preloadImages();
preloadProcessImages();
