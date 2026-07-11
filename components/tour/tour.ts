import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";

export function createTour(steps: DriveStep[], opts?: Partial<Config>) {
  return driver({
    showProgress: true,
    smoothScroll: true,
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
