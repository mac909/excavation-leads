import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";

export function createTour(steps: DriveStep[], opts?: Partial<Config>) {
  // Animated scrolling causes overlay flicker on mobile (driver.js redraws
  // the spotlight cutout every scroll frame while Leaflet repaints tiles) —
  // scroll instantly below the desktop breakpoint. Note animate must stay on:
  // driver.js stops moving the spotlight between steps when animate is false.
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  return driver({
    showProgress: true,
    smoothScroll: desktop,
    stagePadding: 8,
    stageRadius: 0,
    overlayOpacity: 0.65,
    popoverClass: "digsite-tour",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Done",
    progressText: "{{current}} / {{total}}",
    steps,
    ...opts,
  });
}

export function shouldAutoStart(): boolean {
  return new URLSearchParams(window.location.search).get("tour") === "1";
}
